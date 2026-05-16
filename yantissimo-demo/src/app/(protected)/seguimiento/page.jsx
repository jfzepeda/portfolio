"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import dayjs from "dayjs";

import api, { put } from "~/lib/api";
import fetchQuotes from "~/lib/fetchAllQuotes";
import { getUserProfile, ROLES } from "~/utils/session";
import { SUCS } from "~/utils/global";
import {
  deriveConversationState,
  normalizeStageKey,
} from "~/app/(protected)/agent/utils/stageConfig";
import FollowUpDialog from "~/app/(protected)/agent/components/FollowUpDialog";

import KpiCards from "./components/KpiCards";
import ConversationsTable from "./components/ConversationsTable";
import QuotesTable from "./components/QuotesTable";
import Header from "~/components/header";

// ── Constants ─────────────────────────────────────────────────────────────────

const sucursales = [...SUCS, "Todas"];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SeguimientoPage() {
  const router = useRouter();

  // ── Session ────────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [curSuc, setCurSuc] = useState(null);
  const [curRole, setCurRole] = useState(null);
  const [restrictedUserId, setRestrictedUserId] = useState(null);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [sucFilter, setSucFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // ── Follow-up reschedule dialog ────────────────────────────────────────────
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // ── Init session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const profile = getUserProfile();
    const role = Number(profile?.role ?? 0);
    const suc = profile?.sucursal ?? null;
    setCurRole(role);
    setCurSuc(suc);

    // Roles below MARKETING see only their own sucursal
    const isRestricted = role < ROLES.MARKETING;
    if (isRestricted) {
      setSucFilter(String(suc ?? "Todas").toUpperCase());
      setRestrictedUserId(profile?.id ?? null);
    }

    setMounted(true);
  }, []);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch conversations ────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const params = new URLSearchParams();
      if (sucFilter && sucFilter !== "Todas") params.append("sucursal", sucFilter);
      if (restrictedUserId) params.append("userId", String(restrictedUserId));
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());

      const res = await api(`/api/conversations/followup?${params.toString()}`);
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data.conversations ?? [];

      const normalized = raw.map((c) => ({
        ...c,
        stage: normalizeStageKey(c.stage),
        state: deriveConversationState({ ...c, stage: normalizeStageKey(c.stage) }),
      }));

      setConversations(normalized);
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
      window.showToast?.("Error al cargar conversaciones", "error");
    } finally {
      setLoadingConvs(false);
    }
  }, [sucFilter, restrictedUserId, debouncedSearch]);

  // ── Fetch quotes ───────────────────────────────────────────────────────────
  const fetchFollowupQuotes = useCallback(async () => {
    setLoadingQuotes(true);
    try {
      const data = await fetchQuotes(
        sucFilter,
        curSuc,
        "followup",
        debouncedSearch,
        api,
        dayjs
      );
      setQuotes(data || []);
    } catch (err) {
      console.error("Error cargando cotizaciones:", err);
      window.showToast?.("Error al cargar cotizaciones", "error");
    } finally {
      setLoadingQuotes(false);
    }
  }, [sucFilter, curSuc, debouncedSearch]);

  // Re-fetch when filters change (only after mount)
  useEffect(() => {
    if (!mounted) return;
    let active = true;
    fetchConversations().then(() => {
      if (!active) return;
    });
    return () => { active = false; };
  }, [mounted, fetchConversations]);

  useEffect(() => {
    if (!mounted) return;
    let active = true;
    fetchFollowupQuotes().then(() => {
      if (!active) return;
    });
    return () => { active = false; };
  }, [mounted, fetchFollowupQuotes]);

  // ── Action: Reschedule conversation ───────────────────────────────────────
  const handleReschedule = (conversation) => {
    setSelectedConversation(conversation);
    setFollowUpDialogOpen(true);
  };

  const handleFollowUpConfirm = async (followUpData) => {
    if (!selectedConversation) return;
    try {
      const response = await put("/api/conversations/state", {
        userId: selectedConversation.user_id,
        state: "follow_up",
        followup_date: followUpData.followup_date,
        followup_temperature: followUpData.followup_temperature,
        followup_reason: followUpData.followup_reason,
      });
      if (!response.ok) throw new Error("Error al reprogramar");

      // Update local state optimistically
      setConversations((prev) =>
        prev.map((c) =>
          c.user_id === selectedConversation.user_id
            ? {
                ...c,
                followup_date: followUpData.followup_date,
                date: followUpData.followup_date,
                followup_temperature: followUpData.followup_temperature,
                temperature: followUpData.followup_temperature,
                followup_reason: followUpData.followup_reason,
                reason: followUpData.followup_reason,
              }
            : c
        )
      );
      window.showToast?.("Seguimiento reprogramado");
    } catch (err) {
      console.error(err);
      window.showToast?.("Error al reprogramar", "error");
    } finally {
      setFollowUpDialogOpen(false);
      setSelectedConversation(null);
    }
  };

  // ── Action: Reopen conversation (follow_up → open) ─────────────────────────
  const handleReopen = async (conversation) => {
    try {
      const response = await put("/api/conversations/state", {
        userId: conversation.user_id,
        state: "open",
      });
      if (!response.ok) throw new Error("Error al reabrir");

      setConversations((prev) =>
        prev.filter((c) => c.user_id !== conversation.user_id)
      );
      window.showToast?.("Lead reaberto y movido a Abiertos");
    } catch (err) {
      console.error(err);
      window.showToast?.("Error al reabrir el lead", "error");
    }
  };

  // ── Action: Close conversation (follow_up → closed) ────────────────────────
  const handleClose = async (conversation) => {
    try {
      const response = await put("/api/conversations/state", {
        userId: conversation.user_id,
        state: "closed",
      });
      if (!response.ok) throw new Error("Error al cerrar");

      setConversations((prev) =>
        prev.filter((c) => c.user_id !== conversation.user_id)
      );
      window.showToast?.("Lead marcado como cerrado");
    } catch (err) {
      console.error(err);
      window.showToast?.("Error al cerrar el lead", "error");
    }
  };

  // ── Sucursal filter handler ────────────────────────────────────────────────
  const handleSucChange = (e) => {
    const suc = e.target.value;
    setSucFilter(suc);
    if (suc !== "Todas") {
      localStorage.setItem("sucursal", suc);
    } else {
      localStorage.removeItem("sucursal");
    }
  };

  // ── SSR guard ─────────────────────────────────────────────────────────────
  if (!mounted) return null;

  const isRestricted = (curRole ?? 0) < ROLES.MARKETING;

  return (
    <Box>
      <Header
        title="Seguimiento"
        subtitle="Gestiona los seguimientos de conversaciones y cotizaciones"
        actions={
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SupportAgentIcon />}
              onClick={() => router.push("/agent")}
            >
              Ir a CRM
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AttachMoneyIcon />}
              onClick={() => router.push("/cotizaciones")}
            >
              Cotizaciones
            </Button>
          </Box>
        }
      />

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", mb: 3, gap: 2, alignItems: "flex-end" }}>
        {/* Search */}
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            label="Buscar"
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre, teléfono o motivo"
            sx={{ width: 280 }}
          />
        </Box>

        {/* Sucursal */}
        <Box>
          {isRestricted ? (
            <TextField
              label="Sucursal"
              value={curSuc ?? ""}
              disabled
              variant="standard"
              sx={{ width: 160 }}
            />
          ) : (
            <FormControl variant="standard" sx={{ width: 160 }}>
              <InputLabel>Sucursal</InputLabel>
              <Select value={sucFilter || "Todas"} onChange={handleSucChange}>
                {sucursales.map((suc) => (
                  <MenuItem key={suc} value={suc}>
                    {suc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <KpiCards conversations={conversations} quotes={quotes} />

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newVal) => setActiveTab(newVal)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label={`Conversaciones${conversations.length > 0 ? ` (${conversations.length})` : ""}`}
          />
          <Tab
            label={`Cotizaciones${quotes.length > 0 ? ` (${quotes.length})` : ""}`}
          />
        </Tabs>
      </Box>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <ConversationsTable
          conversations={conversations}
          loading={loadingConvs}
          curRole={curRole}
          onReschedule={handleReschedule}
          onReopen={handleReopen}
          onClose={handleClose}
        />
      )}

      {activeTab === 1 && (
        <QuotesTable
          quotes={quotes}
          loading={loadingQuotes}
          curRole={curRole}
        />
      )}

      {/* ── Reschedule Dialog ──────────────────────────────────────────────── */}
      <FollowUpDialog
        open={followUpDialogOpen}
        onClose={() => {
          setFollowUpDialogOpen(false);
          setSelectedConversation(null);
        }}
        onConfirm={handleFollowUpConfirm}
      />
    </Box>
  );
}
