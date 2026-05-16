"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6"];

function ChartCard({ title, description, children }) {
  return (
    <div className="card fade-in">
      <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && (
        <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{description}</p>
      )}
      <div style={{ width: "100%", height: 280 }}>
        {children}
      </div>
    </div>
  );
}

export function ModelComparisonChart({ models, taskType }) {
  const metric = taskType === "regression" ? "cv_r2_mean" : "cv_accuracy_mean";
  const metricLabel = taskType === "regression" ? "CV R² Score" : "CV Accuracy";
  const data = models
    .filter(m => m.metrics)
    .map(m => ({
      name: m.name.replace(/_/g, " "),
      value: m.metrics[metric] || 0,
      secondary: taskType === "regression" ? m.metrics.rmse : m.metrics.f1,
    }));

  return (
    <ChartCard title="Model Comparison" description={`${metricLabel} (5-fold cross-validation)`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis dataKey="name" tick={{ fill: "#8888a0", fontSize: 10 }} angle={-35} textAnchor="end" />
          <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name={metricLabel} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FeatureImportanceChart({ importance }) {
  const data = Object.entries(importance)
    .slice(0, 12)
    .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, value: parseFloat(value) }))
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard title="Feature Importance" description="Top features ranked by importance score">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis type="number" tick={{ fill: "#8888a0", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#8888a0", fontSize: 10 }} width={75} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PredictionsChart({ actual, predicted }) {
  const data = actual.map((a, i) => ({ actual: a, predicted: predicted[i] }));
  const minVal = Math.min(...actual, ...predicted);
  const maxVal = Math.max(...actual, ...predicted);

  return (
    <ChartCard title="Predicted vs Actual" description="Test set predictions against true values">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis type="number" dataKey="actual" name="Actual" tick={{ fill: "#8888a0", fontSize: 11 }} label={{ value: "Actual", position: "bottom", fill: "#8888a0", fontSize: 11 }} domain={[minVal, maxVal]} />
          <YAxis type="number" dataKey="predicted" name="Predicted" tick={{ fill: "#8888a0", fontSize: 11 }} domain={[minVal, maxVal]} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Scatter data={data} fill="#6366f1" fillOpacity={0.7} />
          <Line type="monotone" data={[{ actual: minVal, predicted: minVal }, { actual: maxVal, predicted: maxVal }]} dataKey="predicted" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ResidualsChart({ residuals }) {
  const data = residuals.map((r, i) => ({ index: i, residual: r }));

  return (
    <ChartCard title="Residual Distribution" description="Distribution of prediction errors">
      <ResponsiveContainer>
        <BarChart data={bucketize(residuals)} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis dataKey="range" tick={{ fill: "#8888a0", fontSize: 10 }} />
          <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function bucketize(values) {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const buckets = 15;
  const step = (max - min) / buckets || 1;
  const result = [];
  for (let i = 0; i < buckets; i++) {
    const lo = min + i * step;
    const hi = lo + step;
    const count = values.filter(v => v >= lo && (i === buckets - 1 ? v <= hi : v < hi)).length;
    result.push({ range: lo.toFixed(1), count });
  }
  return result;
}

export function CorrelationChart({ correlations }) {
  const data = correlations.slice(0, 12).map(c => ({
    name: `${c.col1.slice(0, 8)}×${c.col2.slice(0, 8)}`,
    value: c.correlation,
    fill: c.correlation > 0 ? "#6366f1" : "#ef4444",
  }));

  return (
    <ChartCard title="Top Correlations" description="Strongest feature correlations">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis dataKey="name" tick={{ fill: "#8888a0", fontSize: 9 }} angle={-40} textAnchor="end" />
          <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} domain={[-1, 1]} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MetricsRadarChart({ models }) {
  if (!models.length) return null;
  const best = models[0];
  const metrics = best.metrics;
  const data = Object.entries(metrics)
    .filter(([k]) => !k.startsWith("cv_") && k !== "rmse" && k !== "mae")
    .map(([key, value]) => ({ metric: key, value: Math.abs(value) }));

  return (
    <ChartCard title={`Best Model: ${best.name}`} description="Performance metrics overview">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#2a2a40" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#8888a0", fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: "#8888a0", fontSize: 10 }} />
          <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ClusterEvalChart({ evaluations }) {
  return (
    <ChartCard title="Cluster Evaluation" description="Silhouette score by number of clusters">
      <ResponsiveContainer>
        <LineChart data={evaluations} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis dataKey="k" tick={{ fill: "#8888a0", fontSize: 11 }} label={{ value: "K", position: "bottom", fill: "#8888a0" }} />
          <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="silhouette" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
          <Line type="monotone" dataKey="inertia" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} yAxisId="right" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ClusterScatterChart({ pcaData }) {
  if (!pcaData) return null;
  const data = pcaData.x.map((x, i) => ({
    x, y: pcaData.y[i], cluster: pcaData.labels[i],
  }));

  return (
    <ChartCard title="Cluster Visualization (PCA)" description={`Explained variance: ${(pcaData.explained_variance[0] * 100).toFixed(1)}% + ${(pcaData.explained_variance[1] * 100).toFixed(1)}%`}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis type="number" dataKey="x" tick={{ fill: "#8888a0", fontSize: 11 }} name="PC1" />
          <YAxis type="number" dataKey="y" tick={{ fill: "#8888a0", fontSize: 11 }} name="PC2" />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Scatter data={data} fillOpacity={0.7}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.cluster % COLORS.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DataQualityChart({ columns }) {
  const data = columns
    .filter(c => c.missing_pct > 0)
    .sort((a, b) => b.missing_pct - a.missing_pct)
    .slice(0, 15)
    .map(c => ({ name: c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name, missing: c.missing_pct }));

  if (!data.length) return null;

  return (
    <ChartCard title="Missing Data" description="Percentage of missing values by column">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
          <XAxis type="number" tick={{ fill: "#8888a0", fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: "#8888a0", fontSize: 10 }} width={75} />
          <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="missing" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
