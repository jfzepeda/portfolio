"use client";
import { useState, useRef, useCallback } from "react";
import SessionsPanel from "./components/SessionsPanel";
import {
  Upload,
  Play,
  Brain,
  Database,
  BarChart3,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Target,
  Zap,
  Eye,
  TrendingUp,
} from "lucide-react";
import StepIndicator from "./components/StepIndicator";
import LogPanel from "./components/LogPanel";
import SettingsPanel from "./components/SettingsPanel";
import {
  ModelComparisonChart,
  FeatureImportanceChart,
  PredictionsChart,
  ResidualsChart,
  CorrelationChart,
  MetricsRadarChart,
  ClusterEvalChart,
  ClusterScatterChart,
  DataQualityChart,
} from "./components/Charts";

export default function Home() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [logs, setLogs] = useState([]);

  // Data state
  const [file, setFile] = useState(null);
  const [filepath, setFilepath] = useState("");
  const [objective, setObjective] = useState("");
  const [profile, setProfile] = useState(null);
  const [understanding, setUnderstanding] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [modelResults, setModelResults] = useState(null);
  const [vizConfig, setVizConfig] = useState(null);
  const [aiSettings, setAiSettings] = useState({
    provider: "anthropic",
    apiKey: "",
  });

  const [sessionId, setSessionId] = useState(null);

  const fileInputRef = useRef(null);
  const logsRef = useRef([]);

  const addLog = useCallback((message, type = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const entry = { time, message, type };
    setLogs((prev) => {
      const next = [...prev, entry];
      logsRef.current = next;
      return next;
    });
  }, []);

  const loadSession = async (id) => {
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const session = await res.json();
      if (session.error) return;

      setFile(null);
      setFilepath(session.filepath || "");
      setObjective(session.objective || "");
      setStep(session.step || 6);
      setCompletedSteps(session.completedSteps || []);
      setProfile(session.profile || null);
      setUnderstanding(session.understanding || null);
      setProcessingPlan(session.processingPlan || null);
      setProcessed(session.processed || null);
      setModelResults(session.modelResults || null);
      setVizConfig(session.vizConfig || null);
      setLogs(session.logs || []);
      logsRef.current = session.logs || [];
      setSessionId(id);
    } catch (err) {
      addLog(`Failed to load session: ${err.message}`, "error");
    }
  };

  const completeStep = useCallback((s) => {
    setCompletedSteps((prev) => (prev.includes(s) ? prev : [...prev, s]));
  }, []);

  // Step 1: Upload
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingMsg("Uploading dataset...");
    addLog(`Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFilepath(data.filepath);
      addLog(`File uploaded: ${data.filename}`, "success");
      completeStep(1);
      setStep(2);
    } catch (err) {
      addLog(`Upload failed: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2+3+4+5+6: Run entire pipeline
  const runPipeline = async () => {
    if (!objective.trim()) return;
    setLoading(true);

    try {
      // Phase 1: Business Understanding
      setLoadingMsg("AI is analyzing business objective...");
      const providerLabel =
        aiSettings.provider === "openai" ? "OpenAI" : "Claude";
      addLog(
        `Phase 1: Business Understanding - ${providerLabel} is analyzing objective...`
      );
      setStep(2);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filepath }),
      });
      const profileData = await analyzeRes.json();
      if (profileData.error) throw new Error(profileData.error);
      setProfile(profileData);
      addLog(
        `Data profiled: ${profileData.shape[0]} rows, ${profileData.shape[1]} columns`,
        "success"
      );

      const aiRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "understand_business",
          data: { objective, profile: profileData },
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.error) throw new Error(aiData.error);
      setUnderstanding(aiData);
      addLog(
        `Task type: ${aiData.task_type} | Target: ${aiData.target_column}`,
        "success"
      );
      addLog(
        `Key features identified: ${aiData.key_features?.join(", ")}`,
        "info"
      );
      completeStep(2);
      setStep(3);

      // Phase 2: Data Understanding (already done via profiling)
      setLoadingMsg("Analyzing data quality and patterns...");
      addLog(
        "Phase 2: Data Understanding - Analyzing distributions, correlations, outliers..."
      );
      completeStep(3);
      setStep(4);

      // Phase 3: Data Preparation
      setLoadingMsg("AI is designing feature engineering plan...");
      addLog(
        `Phase 3: Data Preparation - ${providerLabel} is designing processing plan...`
      );

      const planRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plan_processing",
          data: { understanding: aiData, profile: profileData },
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
        }),
      });
      const plan = await planRes.json();
      if (plan.error) throw new Error(plan.error);
      setProcessingPlan(plan);
      addLog(
        `Processing plan ready: ${plan.drop_columns?.length || 0} drops, ${
          Object.keys(plan.encoding || {}).length
        } encodings, ${
          Object.keys(plan.transformations || {}).length
        } transforms`,
        "success"
      );

      // Execute processing
      setLoadingMsg("Executing feature engineering...");
      addLog("Executing feature engineering pipeline...");

      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filepath, plan }),
      });
      const processedData = await processRes.json();
      if (processedData.error) throw new Error(processedData.error);
      setProcessed(processedData);
      processedData.log?.forEach((l) => addLog(`  ↳ ${l}`));
      addLog(
        `Processed: ${processedData.shape[0]} rows, ${processedData.shape[1]} features`,
        "success"
      );
      completeStep(4);
      setStep(5);

      // Phase 4: Modeling
      setLoadingMsg("AI is selecting models to train...");
      addLog(`Phase 4: Modeling - ${providerLabel} is selecting algorithms...`);

      const modelSelectRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "select_models",
          data: { understanding: aiData, processed: processedData },
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
        }),
      });
      const modelSelection = await modelSelectRes.json();
      if (modelSelection.error) throw new Error(modelSelection.error);
      addLog(`Models selected: ${modelSelection.models?.join(", ")}`, "info");

      // Train models
      setLoadingMsg("Training and evaluating models...");
      addLog("Training models with cross-validation...");

      const trainRes = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filepath: processedData.output_path,
          config: {
            task_type: aiData.task_type,
            target_column: aiData.target_column,
            models: modelSelection.models,
          },
        }),
      });
      const trainData = await trainRes.json();
      if (trainData.error) throw new Error(trainData.error);
      setModelResults(trainData);
      trainData.models?.forEach((m) => {
        if (m.error) {
          addLog(`  ✗ ${m.name}: ${m.error}`, "error");
        } else {
          const key =
            aiData.task_type === "regression"
              ? "cv_r2_mean"
              : "cv_accuracy_mean";
          addLog(`  ✓ ${m.name}: ${key}=${m.metrics[key]}`, "success");
        }
      });
      addLog(`Best model: ${trainData.best_model}`, "success");
      completeStep(5);
      setStep(6);

      // Phase 5: Evaluation & Visualization
      setLoadingMsg("AI is selecting visualizations...");
      addLog(`Phase 5: Evaluation - ${providerLabel} is selecting charts...`);

      const vizRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "select_visualizations",
          data: {
            task_type: aiData.task_type,
            target: aiData.target_column,
            feature_importance:
              trainData.models?.[0]?.feature_importance ||
              processedData.feature_importance,
            model_results: trainData,
            columns: processedData.columns,
            correlations: profileData.correlations,
          },
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
        }),
      });
      const vizData = await vizRes.json();
      if (vizData.error) throw new Error(vizData.error);
      setVizConfig(vizData);
      addLog(`Dashboard ready: ${vizData.charts?.length} charts`, "success");
      addLog("CRISP-DM pipeline completed!", "success");
      completeStep(6);

      // Auto-save session
      try {
        const saveRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file?.name || filepath.split("/").pop(),
            filepath,
            objective,
            step: 6,
            completedSteps: [1, 2, 3, 4, 5, 6],
            profile: profileData,
            understanding: aiData,
            processingPlan: plan,
            processed: processedData,
            modelResults: trainData,
            vizConfig: vizData,
            logs: logsRef.current,
          }),
        });
        const saved = await saveRes.json();
        setSessionId(saved.id);
        addLog("Session saved automatically", "success");
      } catch (saveErr) {
        addLog(`Session save failed: ${saveErr.message}`, "error");
      }
    } catch (err) {
      addLog(`Pipeline error: ${err.message}`, "error");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Brain size={18} color="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">CRISP-DM AutoML Studio</h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Automated ML Pipeline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SessionsPanel onLoadSession={loadSession} />
            <SettingsPanel onSettingsChange={setAiSettings} />
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <Sparkles size={14} style={{ color: "var(--accent)" }} />
              Powered by{" "}
              {aiSettings.provider === "openai" ? "OpenAI" : "Claude"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <StepIndicator currentStep={step} completedSteps={completedSteps} />

        {/* Loading overlay */}
        {loading && (
          <div
            className="card mb-6 flex items-center gap-4"
            style={{
              borderColor: "var(--accent)",
              background: "rgba(99,102,241,0.05)",
            }}
          >
            <Loader2
              size={20}
              className="pulse"
              style={{ color: "var(--accent)" }}
            />
            <div>
              <p className="text-sm font-semibold">{loadingMsg}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                This may take a moment...
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && !completedSteps.includes(1) && (
          <div className="fade-in">
            <div className="card max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Upload size={20} style={{ color: "var(--accent)" }} />
                <h2 className="text-lg font-bold">Upload Dataset</h2>
              </div>

              <div
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-[var(--accent)]"
                style={{
                  borderColor: file ? "var(--success)" : "var(--border)",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet
                      size={40}
                      style={{ color: "var(--success)" }}
                    />
                    <p className="font-semibold">{file.name}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Database
                      size={40}
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <p className="font-semibold">Click to select CSV file</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Supports .csv files
                    </p>
                  </div>
                )}
              </div>

              <button
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                <Upload size={16} />
                Upload & Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business Objective */}
        {step === 2 &&
          completedSteps.includes(1) &&
          !completedSteps.includes(2) &&
          !loading && (
            <div className="fade-in">
              <div className="card max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <Target size={20} style={{ color: "var(--accent)" }} />
                  <h2 className="text-lg font-bold">Business Objective</h2>
                </div>

                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Describe what you want to predict, classify, or discover from
                  this data.
                </p>

                <textarea
                  className="w-full rounded-lg p-4 text-sm resize-none"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    minHeight: 120,
                  }}
                  placeholder="e.g., Predecir el precio de un departamento basado en sus características como ubicación, metros cuadrados, número de habitaciones..."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />

                <button
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                  onClick={runPipeline}
                  disabled={!objective.trim() || loading}
                >
                  <Zap size={16} />
                  Run Complete CRISP-DM Pipeline
                </button>
              </div>
            </div>
          )}

        {/* Results Dashboard */}
        {completedSteps.includes(3) && (
          <div className="fade-in space-y-6">
            {/* Business Understanding Card */}
            {understanding && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="text-base font-bold">
                    Business Understanding
                  </h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      color: "var(--accent)",
                    }}
                  >
                    AI Analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="metric-card">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Task Type
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      {understanding.task_type?.toUpperCase()}
                    </p>
                  </div>
                  <div className="metric-card">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Target Variable
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--success)" }}
                    >
                      {understanding.target_column || "N/A"}
                    </p>
                  </div>
                  <div className="metric-card">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Interpretability
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--warning)" }}
                    >
                      {understanding.needs_feature_weights
                        ? "Required"
                        : "Not Required"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Approach
                    </p>
                    <p className="text-sm">
                      {understanding.recommended_approach}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Hypotheses
                    </p>
                    <ul className="text-sm space-y-1">
                      {understanding.hypothesis?.map((h, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight
                            size={12}
                            className="mt-1 flex-shrink-0"
                            style={{ color: "var(--accent)" }}
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Data Profile */}
            {profile && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={18} style={{ color: "var(--success)" }} />
                  <h2 className="text-base font-bold">Data Understanding</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="metric-card text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      {profile.shape[0]}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Rows
                    </p>
                  </div>
                  <div className="metric-card text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      {profile.shape[1]}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Columns
                    </p>
                  </div>
                  <div className="metric-card text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--success)" }}
                    >
                      {profile.dtypes_summary.numeric}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Numeric
                    </p>
                  </div>
                  <div className="metric-card text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--warning)" }}
                    >
                      {profile.dtypes_summary.categorical}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Categorical
                    </p>
                  </div>
                  <div className="metric-card text-center">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--error)" }}
                    >
                      {profile.missing_summary.missing_pct}%
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Missing
                    </p>
                  </div>
                </div>

                {/* Column details table */}
                <div className="overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th
                          className="text-left p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Column
                        </th>
                        <th
                          className="text-left p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Type
                        </th>
                        <th
                          className="text-right p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Missing %
                        </th>
                        <th
                          className="text-right p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Unique
                        </th>
                        <th
                          className="text-left p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Stats
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.columns.map((col, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <td className="p-2 font-medium">{col.name}</td>
                          <td className="p-2">
                            <span
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{
                                background:
                                  col.type === "numeric"
                                    ? "rgba(34,197,94,0.15)"
                                    : "rgba(245,158,11,0.15)",
                                color:
                                  col.type === "numeric"
                                    ? "var(--success)"
                                    : "var(--warning)",
                              }}
                            >
                              {col.type}
                            </span>
                          </td>
                          <td
                            className="p-2 text-right"
                            style={{
                              color:
                                col.missing_pct > 5
                                  ? "var(--error)"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {col.missing_pct}%
                          </td>
                          <td
                            className="p-2 text-right"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {col.unique}
                          </td>
                          <td
                            className="p-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {col.stats
                              ? `μ=${col.stats.mean} σ=${col.stats.std}`
                              : col.top_values
                              ? `top: ${Object.keys(col.top_values)[0]}`
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Processing Log */}
            {processed && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} style={{ color: "var(--warning)" }} />
                  <h2 className="text-base font-bold">Data Preparation</h2>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {processed.shape[0]} rows × {processed.shape[1]} features
                  </span>
                </div>
                {processingPlan?.reasoning && (
                  <p
                    className="text-sm mb-3 p-3 rounded-lg"
                    style={{
                      background: "var(--bg-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {processingPlan.reasoning}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {processed.log?.map((l, i) => (
                    <div key={i} className="log-entry">
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Results */}
            {modelResults && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} style={{ color: "var(--success)" }} />
                  <h2 className="text-base font-bold">Model Evaluation</h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(34,197,94,0.15)",
                      color: "var(--success)",
                    }}
                  >
                    Best: {modelResults.best_model}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th
                          className="text-left p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Model
                        </th>
                        {modelResults.task_type === "regression" ? (
                          <>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              R²
                            </th>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              RMSE
                            </th>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              MAE
                            </th>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              CV R² (mean±std)
                            </th>
                          </>
                        ) : (
                          <>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Accuracy
                            </th>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              F1
                            </th>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Precision
                            </th>
                            <th
                              className="text-right p-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              CV Acc (mean±std)
                            </th>
                          </>
                        )}
                        <th
                          className="text-center p-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelResults.models
                        ?.filter((m) => !m.error)
                        .map((m, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: "1px solid var(--border)",
                              background:
                                i === 0
                                  ? "rgba(34,197,94,0.05)"
                                  : "transparent",
                            }}
                          >
                            <td className="p-2 font-medium">
                              {i === 0 && <span className="mr-1">🏆</span>}
                              {m.name.replace(/_/g, " ")}
                            </td>
                            {modelResults.task_type === "regression" ? (
                              <>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.r2}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.rmse}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.mae}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.cv_r2_mean}±{m.metrics.cv_r2_std}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.accuracy}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.f1}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.precision}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {m.metrics.cv_accuracy_mean}±
                                  {m.metrics.cv_accuracy_std}
                                </td>
                              </>
                            )}
                            <td className="p-2 text-center">
                              <span
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  background: m.is_interpretable
                                    ? "rgba(34,197,94,0.15)"
                                    : m.is_blackbox
                                    ? "rgba(239,68,68,0.15)"
                                    : "rgba(99,102,241,0.15)",
                                  color: m.is_interpretable
                                    ? "var(--success)"
                                    : m.is_blackbox
                                    ? "var(--error)"
                                    : "var(--accent)",
                                }}
                              >
                                {m.is_interpretable
                                  ? "Interpretable"
                                  : m.is_blackbox
                                  ? "Black Box"
                                  : "Ensemble"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Charts Dashboard */}
            {vizConfig && modelResults && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="text-base font-bold">
                    {vizConfig.dashboard_title || "Analysis Dashboard"}
                  </h2>
                </div>

                {/* Key Insights */}
                {vizConfig.key_insights && (
                  <div
                    className="card mb-4"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "var(--accent)" }}
                    >
                      KEY INSIGHTS
                    </p>
                    <ul className="space-y-1">
                      {vizConfig.key_insights.map((insight, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: "var(--success)" }}
                          />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ModelComparisonChart
                    models={modelResults.models || []}
                    taskType={modelResults.task_type}
                  />

                  {modelResults.models?.[0]?.feature_importance &&
                    Object.keys(modelResults.models[0].feature_importance)
                      .length > 0 && (
                      <FeatureImportanceChart
                        importance={modelResults.models[0].feature_importance}
                      />
                    )}

                  {modelResults.task_type === "regression" &&
                    modelResults.models?.[0]?.predictions_sample && (
                      <PredictionsChart
                        actual={
                          modelResults.models[0].predictions_sample.actual
                        }
                        predicted={
                          modelResults.models[0].predictions_sample.predicted
                        }
                      />
                    )}

                  {modelResults.task_type === "regression" &&
                    modelResults.models?.[0]?.residuals?.length > 0 && (
                      <ResidualsChart
                        residuals={modelResults.models[0].residuals}
                      />
                    )}

                  {profile?.correlations?.length > 0 && (
                    <CorrelationChart correlations={profile.correlations} />
                  )}

                  <MetricsRadarChart models={modelResults.models || []} />

                  {profile?.columns && (
                    <DataQualityChart columns={profile.columns} />
                  )}

                  {modelResults.task_type === "clustering" &&
                    modelResults.cluster_evaluations && (
                      <ClusterEvalChart
                        evaluations={modelResults.cluster_evaluations}
                      />
                    )}

                  {modelResults.task_type === "clustering" &&
                    modelResults.pca_data && (
                      <ClusterScatterChart pcaData={modelResults.pca_data} />
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        <LogPanel logs={logs} />
      </main>
    </div>
  );
}
