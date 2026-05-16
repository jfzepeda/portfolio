"use client";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Business" },
  { id: 3, label: "Data Understanding" },
  { id: 4, label: "Preparation" },
  { id: 5, label: "Modeling" },
  { id: 6, label: "Evaluation" },
];

export default function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className={`step-dot ${
                completedSteps.includes(step.id)
                  ? "completed"
                  : currentStep === step.id
                  ? "active"
                  : ""
              }`}
            >
              {completedSteps.includes(step.id) ? (
                <Check size={14} />
              ) : (
                step.id
              )}
            </div>
            <span
              className="text-xs mt-1"
              style={{
                color:
                  currentStep === step.id
                    ? "var(--accent)"
                    : completedSteps.includes(step.id)
                    ? "var(--success)"
                    : "var(--text-secondary)",
              }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`step-line ${
                completedSteps.includes(step.id) ? "completed" : ""
              }`}
              style={{ marginBottom: "18px" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
