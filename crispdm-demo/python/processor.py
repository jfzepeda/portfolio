"""
CRISP-DM Data Processor - Feature engineering, transformations, and preparation.
Receives a processing plan (from Claude) and executes it.
"""
import sys
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import (
    StandardScaler, MinMaxScaler, RobustScaler,
    LabelEncoder, OneHotEncoder, OrdinalEncoder,
    PolynomialFeatures, PowerTransformer
)
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.feature_selection import (
    mutual_info_regression, mutual_info_classif,
    f_regression, f_classif, SelectKBest
)
from sklearn.decomposition import PCA


def process(file_path, plan):
    df = pd.read_csv(file_path)
    log = []
    target = plan.get("target_column")
    task_type = plan.get("task_type", "regression")

    # 1. Drop columns
    cols_to_drop = plan.get("drop_columns", [])
    if cols_to_drop:
        valid_drops = [c for c in cols_to_drop if c in df.columns]
        df.drop(columns=valid_drops, inplace=True)
        log.append(f"Dropped columns: {valid_drops}")

    # 2. Handle missing values
    missing_strategy = plan.get("missing_strategy", {})
    for col, strategy in missing_strategy.items():
        if col not in df.columns:
            continue
        if strategy == "drop_rows":
            before = len(df)
            df.dropna(subset=[col], inplace=True)
            log.append(f"{col}: dropped {before - len(df)} rows with missing values")
        elif strategy == "mean":
            val = df[col].mean()
            df[col].fillna(val, inplace=True)
            log.append(f"{col}: filled missing with mean ({val:.4f})")
        elif strategy == "median":
            val = df[col].median()
            df[col].fillna(val, inplace=True)
            log.append(f"{col}: filled missing with median ({val:.4f})")
        elif strategy == "mode":
            val = df[col].mode()[0]
            df[col].fillna(val, inplace=True)
            log.append(f"{col}: filled missing with mode ({val})")
        elif strategy == "zero":
            df[col].fillna(0, inplace=True)
            log.append(f"{col}: filled missing with 0")
        elif strategy == "knn":
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if col in numeric_cols:
                imputer = KNNImputer(n_neighbors=5)
                df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
                log.append(f"{col}: KNN imputation applied")

    # 3. Encode categoricals
    encoding_plan = plan.get("encoding", {})
    for col, method in encoding_plan.items():
        if col not in df.columns:
            continue
        if method == "onehot":
            dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
            df = pd.concat([df.drop(columns=[col]), dummies], axis=1)
            log.append(f"{col}: one-hot encoded ({len(dummies.columns)} new columns)")
        elif method == "label":
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            log.append(f"{col}: label encoded")
        elif method == "ordinal":
            oe = OrdinalEncoder()
            df[col] = oe.fit_transform(df[[col]])
            log.append(f"{col}: ordinal encoded")
        elif method == "frequency":
            freq = df[col].value_counts(normalize=True)
            df[col] = df[col].map(freq)
            log.append(f"{col}: frequency encoded")
        elif method == "target" and target and target in df.columns:
            means = df.groupby(col)[target].mean()
            df[col] = df[col].map(means)
            log.append(f"{col}: target encoded using {target}")

    # 4. Feature transformations
    transformations = plan.get("transformations", {})
    for col, transform in transformations.items():
        if col not in df.columns:
            continue
        if transform == "log":
            min_val = df[col].min()
            if min_val <= 0:
                df[f"{col}_log"] = np.log1p(df[col] - min_val)
            else:
                df[f"{col}_log"] = np.log(df[col])
            log.append(f"{col}: log transformation applied")
        elif transform == "sqrt":
            min_val = df[col].min()
            if min_val < 0:
                df[f"{col}_sqrt"] = np.sqrt(df[col] - min_val)
            else:
                df[f"{col}_sqrt"] = np.sqrt(df[col])
            log.append(f"{col}: sqrt transformation applied")
        elif transform == "boxcox":
            pt = PowerTransformer(method="yeo-johnson")
            df[f"{col}_boxcox"] = pt.fit_transform(df[[col]])
            log.append(f"{col}: Yeo-Johnson transformation applied")
        elif transform == "square":
            df[f"{col}_sq"] = df[col] ** 2
            log.append(f"{col}: square transformation applied")

    # 5. Scaling
    scaling = plan.get("scaling", {})
    scale_cols = scaling.get("columns", [])
    scale_method = scaling.get("method", "standard")
    valid_scale_cols = [c for c in scale_cols if c in df.columns and df[c].dtype in [np.float64, np.int64, np.float32, np.int32]]
    if valid_scale_cols:
        if scale_method == "standard":
            scaler = StandardScaler()
        elif scale_method == "minmax":
            scaler = MinMaxScaler()
        elif scale_method == "robust":
            scaler = RobustScaler()
        else:
            scaler = StandardScaler()
        df[valid_scale_cols] = scaler.fit_transform(df[valid_scale_cols])
        log.append(f"Scaled {len(valid_scale_cols)} columns with {scale_method}")

    # 6. Feature interactions
    interactions = plan.get("interactions", [])
    for inter in interactions:
        col1, col2 = inter.get("col1"), inter.get("col2")
        op = inter.get("operation", "multiply")
        if col1 in df.columns and col2 in df.columns:
            if op == "multiply":
                df[f"{col1}_x_{col2}"] = df[col1] * df[col2]
            elif op == "divide":
                df[f"{col1}_div_{col2}"] = df[col1] / df[col2].replace(0, np.nan)
            elif op == "add":
                df[f"{col1}_plus_{col2}"] = df[col1] + df[col2]
            elif op == "subtract":
                df[f"{col1}_minus_{col2}"] = df[col1] - df[col2]
            log.append(f"Created interaction: {col1} {op} {col2}")

    # 7. Feature selection (if target specified)
    feature_importance = {}
    if target and target in df.columns:
        numeric_features = df.select_dtypes(include=[np.number]).columns.tolist()
        if target in numeric_features:
            numeric_features.remove(target)

        X_sel = df[numeric_features].dropna()
        y_sel = df.loc[X_sel.index, target]

        if len(X_sel) > 0 and len(numeric_features) > 0:
            try:
                if task_type == "regression":
                    mi = mutual_info_regression(X_sel, y_sel, random_state=42)
                else:
                    mi = mutual_info_classif(X_sel, y_sel, random_state=42)
                for feat, score in zip(numeric_features, mi):
                    feature_importance[feat] = round(float(score), 4)
            except Exception:
                pass

    # Drop any remaining NaN rows
    before_drop = len(df)
    df.dropna(inplace=True)
    if before_drop - len(df) > 0:
        log.append(f"Dropped {before_drop - len(df)} remaining rows with NaN values")

    # Save processed file
    output_path = file_path.replace(".csv", "_processed.csv")
    df.to_csv(output_path, index=False)

    result = {
        "output_path": output_path,
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "dtypes": {col: str(dt) for col, dt in df.dtypes.items()},
        "log": log,
        "feature_importance": dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)),
        "sample": json.loads(df.head(5).to_json(orient="records")),
    }
    return result


if __name__ == "__main__":
    file_path = sys.argv[1]
    plan = json.loads(sys.argv[2])
    result = process(file_path, plan)
    print(json.dumps(result))
