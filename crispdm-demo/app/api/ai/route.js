import { NextResponse } from "next/server";
import { callAI } from "../../lib/ai-provider";

export async function POST(request) {
  try {
    const { action, data, provider, apiKey } = await request.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "understand_business": {
        systemPrompt = `You are an expert data scientist performing CRISP-DM Phase 1: Business Understanding.
Analyze the business objective and the dataset profile to produce a structured understanding.
Respond ONLY with valid JSON.`;
        userPrompt = `Business Objective: "${data.objective}"

Dataset Profile:
- Shape: ${data.profile.shape[0]} rows x ${data.profile.shape[1]} columns
- Columns: ${JSON.stringify(data.profile.columns.map(c => ({ name: c.name, type: c.type, dtype: c.dtype, missing_pct: c.missing_pct, unique: c.unique })))}
- Missing: ${data.profile.missing_summary.missing_pct}% total

Analyze and respond with JSON:
{
  "task_type": "regression|classification|clustering",
  "target_column": "column_name or null",
  "target_justification": "why this column is the target",
  "key_features": ["list of most promising feature columns"],
  "business_kpis": ["what KPIs/metrics matter"],
  "data_quality_concerns": ["issues found"],
  "hypothesis": ["data hypotheses to test"],
  "recommended_approach": "brief strategy",
  "needs_feature_weights": true/false,
  "is_blackbox_ok": true/false,
  "explanation": "brief explanation of the approach"
}`;
        break;
      }

      case "plan_processing": {
        systemPrompt = `You are an expert data engineer performing CRISP-DM Phase 3: Data Preparation.
Create a detailed processing plan based on the data profile and business understanding.
Respond ONLY with valid JSON.`;
        userPrompt = `Business Understanding:
${JSON.stringify(data.understanding, null, 2)}

Data Profile:
- Columns: ${JSON.stringify(data.profile.columns)}
- Correlations: ${JSON.stringify(data.profile.correlations?.slice(0, 15))}
- Missing Summary: ${JSON.stringify(data.profile.missing_summary)}

Create a processing plan as JSON:
{
  "target_column": "the target variable",
  "task_type": "regression|classification|clustering",
  "drop_columns": ["columns to remove - IDs, constants, leaky features"],
  "missing_strategy": {"column_name": "mean|median|mode|drop_rows|knn|zero"},
  "encoding": {"categorical_col": "onehot|label|ordinal|frequency|target"},
  "transformations": {"numeric_col": "log|sqrt|boxcox|square"},
  "scaling": {"method": "standard|minmax|robust", "columns": ["cols to scale"]},
  "interactions": [{"col1": "a", "col2": "b", "operation": "multiply|divide|add|subtract"}],
  "reasoning": "explain each major decision"
}

Be smart about:
- Drop high-cardinality IDs/names
- Use target encoding for high-cardinality categoricals
- Log transform skewed distributions
- Create meaningful interactions
- Choose scaling based on outlier presence`;
        break;
      }

      case "select_models": {
        systemPrompt = `You are an expert ML engineer performing CRISP-DM Phase 4: Modeling.
Select the best models to try based on the data characteristics and business needs.
Respond ONLY with valid JSON.`;
        userPrompt = `Business Understanding:
${JSON.stringify(data.understanding, null, 2)}

Processed Data:
- Shape: ${data.processed.shape}
- Columns: ${data.processed.columns?.length}
- Feature Importance: ${JSON.stringify(data.processed.feature_importance)}

Select models. Respond with JSON:
{
  "models": ["model_names"],
  "reasoning": "why these models",
  "primary_metric": "the main metric to optimize"
}

Available models for regression: linear_regression, ridge, lasso, elastic_net, decision_tree, random_forest, gradient_boosting, svr, knn, adaboost
Available models for classification: logistic_regression, decision_tree, random_forest, gradient_boosting, svc, knn, adaboost
For clustering, models are auto-selected.

Consider:
- If feature weights matter (needs_feature_weights=${data.understanding.needs_feature_weights}), include interpretable models
- If blackbox is OK (is_blackbox_ok=${data.understanding.is_blackbox_ok}), include ensemble/complex models
- Always include at least one simple baseline and one complex model`;
        break;
      }

      case "select_visualizations": {
        systemPrompt = `You are an expert data visualization specialist. Select the most insightful charts to show for this CRISP-DM analysis.
Respond ONLY with valid JSON.`;
        userPrompt = `Task Type: ${data.task_type}
Target: ${data.target}
Feature Importance: ${JSON.stringify(data.feature_importance)}
Model Results: ${JSON.stringify(data.model_results?.models?.map(m => ({ name: m.name, metrics: m.metrics })))}
Columns Available: ${JSON.stringify(data.columns)}
Correlations: ${JSON.stringify(data.correlations?.slice(0, 10))}

Select visualizations. Respond with JSON:
{
  "charts": [
    {
      "type": "bar|scatter|line|heatmap|histogram|box|radar|area|pie",
      "title": "Chart Title",
      "description": "What insight it shows",
      "data_key": "what data to use: feature_importance|model_comparison|correlations|predictions|residuals|cluster_eval|distribution",
      "config": {
        "x_field": "field name or null",
        "y_field": "field name or null",
        "color_field": "optional"
      }
    }
  ],
  "dashboard_title": "Dashboard title",
  "key_insights": ["insight 1", "insight 2", "insight 3"]
}

Select 5-8 most impactful charts. Consider:
- Always show model comparison
- Show feature importance
- For regression: predictions vs actual, residuals
- For classification: confusion-style metrics
- For clustering: cluster evaluation, PCA scatter
- Show key correlations`;
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const parsed = await callAI(provider || "anthropic", apiKey, systemPrompt, userPrompt);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
