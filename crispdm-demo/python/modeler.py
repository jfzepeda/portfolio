"""
CRISP-DM Modeler - Trains and evaluates multiple models, selects the best.
"""
import sys
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    silhouette_score, calinski_harabasz_score
)
from sklearn.linear_model import LinearRegression, Ridge, Lasso, LogisticRegression, ElasticNet
from sklearn.ensemble import (
    RandomForestRegressor, RandomForestClassifier,
    GradientBoostingRegressor, GradientBoostingClassifier,
    AdaBoostRegressor, AdaBoostClassifier
)
from sklearn.svm import SVR, SVC
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings("ignore")


def train_models(file_path, config):
    df = pd.read_csv(file_path)
    task_type = config.get("task_type", "regression")
    target = config.get("target_column")
    models_to_try = config.get("models", [])
    results = {"models": [], "best_model": None, "task_type": task_type}

    if task_type in ["regression", "classification"] and target:
        if target not in df.columns:
            return {"error": f"Target column '{target}' not found"}

        X = df.drop(columns=[target])
        y = df[target]

        # Keep only numeric
        X = X.select_dtypes(include=[np.number])
        if X.empty:
            return {"error": "No numeric features available"}

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        model_map_reg = {
            "linear_regression": LinearRegression(),
            "ridge": Ridge(alpha=1.0),
            "lasso": Lasso(alpha=0.1),
            "elastic_net": ElasticNet(alpha=0.1, l1_ratio=0.5),
            "decision_tree": DecisionTreeRegressor(random_state=42, max_depth=10),
            "random_forest": RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
            "gradient_boosting": GradientBoostingRegressor(n_estimators=100, random_state=42),
            "svr": SVR(kernel="rbf"),
            "knn": KNeighborsRegressor(n_neighbors=5),
            "adaboost": AdaBoostRegressor(n_estimators=100, random_state=42),
        }

        model_map_clf = {
            "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
            "decision_tree": DecisionTreeClassifier(random_state=42, max_depth=10),
            "random_forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
            "gradient_boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
            "svc": SVC(kernel="rbf", random_state=42),
            "knn": KNeighborsClassifier(n_neighbors=5),
            "adaboost": AdaBoostClassifier(n_estimators=100, random_state=42),
        }

        model_map = model_map_reg if task_type == "regression" else model_map_clf

        if not models_to_try:
            models_to_try = list(model_map.keys())

        for model_name in models_to_try:
            if model_name not in model_map:
                continue
            model = model_map[model_name]
            try:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

                if task_type == "regression":
                    metrics = {
                        "r2": round(float(r2_score(y_test, y_pred)), 4),
                        "rmse": round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 4),
                        "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
                    }
                    cv = cross_val_score(model, X, y, cv=5, scoring="r2")
                    metrics["cv_r2_mean"] = round(float(cv.mean()), 4)
                    metrics["cv_r2_std"] = round(float(cv.std()), 4)
                    sort_metric = metrics["cv_r2_mean"]
                else:
                    metrics = {
                        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
                        "f1": round(float(f1_score(y_test, y_pred, average="weighted")), 4),
                        "precision": round(float(precision_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
                        "recall": round(float(recall_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
                    }
                    cv = cross_val_score(model, X, y, cv=5, scoring="accuracy")
                    metrics["cv_accuracy_mean"] = round(float(cv.mean()), 4)
                    metrics["cv_accuracy_std"] = round(float(cv.std()), 4)
                    sort_metric = metrics["cv_accuracy_mean"]

                # Feature importances
                feat_imp = {}
                if hasattr(model, "feature_importances_"):
                    for feat, imp in zip(X.columns, model.feature_importances_):
                        feat_imp[feat] = round(float(imp), 4)
                elif hasattr(model, "coef_"):
                    coefs = model.coef_ if len(model.coef_.shape) == 1 else model.coef_[0]
                    for feat, coef in zip(X.columns, coefs):
                        feat_imp[feat] = round(float(abs(coef)), 4)

                feat_imp = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True))

                is_blackbox = model_name in ["svr", "svc", "knn", "adaboost"]
                is_interpretable = model_name in ["linear_regression", "ridge", "lasso", "elastic_net",
                                                    "logistic_regression", "decision_tree"]

                model_result = {
                    "name": model_name,
                    "metrics": metrics,
                    "sort_metric": sort_metric,
                    "feature_importance": feat_imp,
                    "is_blackbox": is_blackbox,
                    "is_interpretable": is_interpretable,
                    "predictions_sample": {
                        "actual": y_test.head(20).tolist(),
                        "predicted": y_pred[:20].tolist(),
                    },
                    "residuals": (y_test.values[:100] - y_pred[:100]).tolist() if task_type == "regression" else [],
                }
                results["models"].append(model_result)

            except Exception as e:
                results["models"].append({"name": model_name, "error": str(e)})

        # Sort and pick best
        valid_models = [m for m in results["models"] if "error" not in m]
        if valid_models:
            valid_models.sort(key=lambda x: x["sort_metric"], reverse=True)
            results["models"] = valid_models
            results["best_model"] = valid_models[0]["name"]
            results["best_metrics"] = valid_models[0]["metrics"]

    elif task_type == "clustering":
        X = df.select_dtypes(include=[np.number])
        if X.empty:
            return {"error": "No numeric features for clustering"}

        cluster_results = []
        for k in [2, 3, 4, 5, 6, 7, 8]:
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = km.fit_predict(X)
            sil = silhouette_score(X, labels)
            ch = calinski_harabasz_score(X, labels)
            cluster_results.append({
                "k": k,
                "silhouette": round(float(sil), 4),
                "calinski_harabasz": round(float(ch), 4),
                "inertia": round(float(km.inertia_), 4),
            })

        best_k = max(cluster_results, key=lambda x: x["silhouette"])
        km_best = KMeans(n_clusters=best_k["k"], random_state=42, n_init=10)
        labels = km_best.fit_predict(X)

        # PCA for visualization
        pca_data = None
        if X.shape[1] > 2:
            pca = PCA(n_components=2)
            X_pca = pca.fit_transform(X)
            pca_data = {
                "x": X_pca[:, 0].tolist(),
                "y": X_pca[:, 1].tolist(),
                "labels": labels.tolist(),
                "explained_variance": pca.explained_variance_ratio_.tolist(),
            }

        results = {
            "task_type": "clustering",
            "cluster_evaluations": cluster_results,
            "best_k": best_k["k"],
            "best_silhouette": best_k["silhouette"],
            "cluster_sizes": pd.Series(labels).value_counts().to_dict(),
            "pca_data": pca_data,
            "models": [{"name": f"KMeans(k={best_k['k']})", "metrics": best_k, "is_blackbox": False}],
            "best_model": f"KMeans(k={best_k['k']})",
        }

    return results


if __name__ == "__main__":
    file_path = sys.argv[1]
    config = json.loads(sys.argv[2])
    result = train_models(file_path, config)
    print(json.dumps(result))
