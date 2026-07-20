// ============================================================
// Skill Manifest — the contract every skill must satisfy.
// Defines what a skill is, what it needs, what it produces,
// and how the Orchestrator should handle success, warning, and failure.
// ============================================================

export type SkillStatus =
  | "pending"
  | "running"
  | "passed"
  | "warning"
  | "failed"
  | "blocked"
  | "retried";

export type ErrorType =
  | "transient"    // API timeout, network blip — retry automatically
  | "recoverable"  // Missing input, malformed data — attempt correction and rerun
  | "critical";    // Logic error, failed gate — stop pipeline, require human

export type SkillLayer =
  | 1  // Master Orchestrator
  | 2  // Production Skills
  | 3  // Support Skills
  | 4; // Health & Monitoring

export type SkillCategory =
  | "orchestrator"
  | "production"
  | "support"
  | "audit"
  | "publisher"
  | "monitoring";

export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  backoffMs: number;
  retryOn: ErrorType[];
}

export interface SkillManifest {
  // ── Identity ──────────────────────────────────────────────
  skillId: string;           // kebab-case unique identifier, e.g. "authority-research"
  name: string;              // Human-readable name
  version: string;           // semver, e.g. "1.0.0"
  layer: SkillLayer;
  category: SkillCategory;
  description: string;

  // ── Contract ──────────────────────────────────────────────
  requiredInputs: string[];   // Keys that MUST be present or skill cannot start
  optionalInputs?: string[];  // Keys that improve output but are not blocking

  requiredOutputs: string[];  // Keys the skill MUST produce to pass
  optionalOutputs?: string[]; // Keys produced when data is available

  // ── Dependencies ──────────────────────────────────────────
  dependencies?: string[];    // skillIds that must complete before this skill runs

  // ── Success / Warning / Failure ───────────────────────────
  successCriteria: string[];      // All must be met for status = "passed"
  warningConditions?: string[];   // Met = status "warning" (pipeline continues)
  failureConditions: string[];    // Any met = status "failed" (see blocksDeployment)

  // ── Confidence ────────────────────────────────────────────
  confidenceThreshold: number;    // 0–1. Below this → warning. Below 0.4 → fail.

  // ── Execution ─────────────────────────────────────────────
  retryPolicy: RetryPolicy;
  timeoutMs: number;

  // ── Pipeline Control ──────────────────────────────────────
  blocksDeployment: boolean;      // Failure halts the entire pipeline
  requiresHumanReview: boolean;   // Output must be approved before next gate opens

  // ── Reporting ─────────────────────────────────────────────
  healthReportRequired: boolean;  // Must emit a SkillExecutionReport to Supabase
  auditChecklist: string[];       // Line-by-line checklist shown on the dashboard
}
