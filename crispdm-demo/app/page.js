"use client";
import { useState, useCallback } from "react";
import SessionsPanel from "./components/SessionsPanel";
import {
  Brain,
  BarChart3,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Zap,
  Eye,
  TrendingUp,
} from "lucide-react";
import StepIndicator from "./components/StepIndicator";
import LogPanel from "./components/LogPanel";
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
  const [profile, setProfile] = useState(null);
  const [understanding, setUnderstanding] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [modelResults, setModelResults] = useState(null);
  const [vizConfig, setVizConfig] = useState(null);
  const addLog = useCallback((message, type = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const entry = { time, message, type };
    setLogs((prev) => {
      const next = [...prev, entry];
      return next;
    });
  }, []);

  const loadSession = async (id) => {
    setLoading(true);
    setLoadingMsg("Loading sample analysis...");
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const session = await res.json();
      if (!res.ok || session.error) throw new Error(session.error || "Could not load analysis");

      setStep(session.step || 6);
      setCompletedSteps(session.completedSteps || []);
      setProfile(session.profile || null);
      setUnderstanding(session.understanding || null);
      setProcessingPlan(session.processingPlan || null);
      setProcessed(session.processed || null);
      setModelResults(session.modelResults || null);
      setVizConfig(session.vizConfig || null);
      setLogs(session.logs || []);
    } catch (err) {
      addLog(`Failed to load session: ${err.message}`, "error");
    } finally {
      setLoading(false);
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
                Interactive demo · simulated results
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SessionsPanel onLoadSession={loadSession} />

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <Sparkles size={14} style={{ color: "var(--accent)" }} />
              Sample analysis
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

        {step === 1 && (
          <div className="card max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold">Explore a sample CRISP-DM analysis</h2>
            <p>This interactive demo uses fictional housing data and simulated model results. No uploads, API keys, or training are required.</p>
            <button className="btn-primary" onClick={() => loadSession("housing-demo")}>Explore sample analysis</button>
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
