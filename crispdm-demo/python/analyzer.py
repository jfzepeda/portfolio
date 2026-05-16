"""
CRISP-DM Data Analyzer - Performs EDA, profiling, and statistical analysis on CSV data.
Called from Next.js API routes via subprocess.
"""
import sys
import json
import pandas as pd
import numpy as np
from scipy import stats


def analyze(file_path):
    df = pd.read_csv(file_path)

    profile = {
        "shape": list(df.shape),
        "columns": [],
        "missing_summary": {},
        "correlations": None,
        "sample_rows": json.loads(df.head(5).to_json(orient="records")),
        "dtypes_summary": {"numeric": 0, "categorical": 0, "datetime": 0, "boolean": 0},
    }

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    profile["dtypes_summary"]["numeric"] = len(numeric_cols)
    profile["dtypes_summary"]["categorical"] = len(categorical_cols)

    for col in df.columns:
        col_info = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing": int(df[col].isnull().sum()),
            "missing_pct": round(float(df[col].isnull().mean() * 100), 2),
            "unique": int(df[col].nunique()),
            "sample_values": df[col].dropna().head(5).tolist(),
        }

        if col in numeric_cols:
            col_info["type"] = "numeric"
            desc = df[col].describe()
            col_info["stats"] = {
                "mean": round(float(desc["mean"]), 4),
                "std": round(float(desc["std"]), 4),
                "min": float(desc["min"]),
                "25%": float(desc["25%"]),
                "50%": float(desc["50%"]),
                "75%": float(desc["75%"]),
                "max": float(desc["max"]),
                "skewness": round(float(df[col].skew()), 4),
                "kurtosis": round(float(df[col].kurtosis()), 4),
            }
            # Detect outliers using IQR
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
            col_info["outliers"] = int(outliers)
            col_info["outliers_pct"] = round(float(outliers / len(df) * 100), 2)
        else:
            col_info["type"] = "categorical"
            value_counts = df[col].value_counts().head(10)
            col_info["top_values"] = {str(k): int(v) for k, v in value_counts.items()}
            col_info["cardinality"] = int(df[col].nunique())

        profile["columns"].append(col_info)

    profile["missing_summary"] = {
        "total_missing": int(df.isnull().sum().sum()),
        "total_cells": int(df.shape[0] * df.shape[1]),
        "missing_pct": round(float(df.isnull().sum().sum() / (df.shape[0] * df.shape[1]) * 100), 2),
        "columns_with_missing": int((df.isnull().sum() > 0).sum()),
    }

    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr()
        # Get top correlations
        corr_pairs = []
        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                corr_pairs.append({
                    "col1": numeric_cols[i],
                    "col2": numeric_cols[j],
                    "correlation": round(float(corr.iloc[i, j]), 4)
                })
        corr_pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        profile["correlations"] = corr_pairs[:20]
        profile["correlation_matrix"] = json.loads(corr.round(4).to_json())

    return profile


if __name__ == "__main__":
    file_path = sys.argv[1]
    result = analyze(file_path)
    print(json.dumps(result))
