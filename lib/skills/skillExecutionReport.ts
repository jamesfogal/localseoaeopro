// ============================================================
// Skill Execution Report — the receipt every skill emits when it runs.
// One row per skill execution in the skill_executions Supabase table.
// The manifest is the contract; this is the proof of delivery.
// ============================================================

import type { SkillStatus, ErrorType } from "./skillManifest";

export interface SkillError {
  type: ErrorType;
  message: string;
  code?: string;         // HTTP status, API error code, etc.
  retryable: boolean;
}

export interface SkillWarning {
  message: string;
  field?: string;        // Which input/output triggered the warning
}

export interface AuditChecklistResult {
  item: string;
  passed: boolean;
  note?: string;
}

export interface SkillExecutionReport {
  // ── Identity ──────────────────────────────────────────────
  reportId: string;           // UUID generated at skill start
  skillId: string;
  version: string;

  // ── Project Context ───────────────────────────────────────
  projectId: string;
  clientId?: string;
  pageId?: string;            // If the skill ran against a specific page

  // ── Timing ────────────────────────────────────────────────
  startedAt: string;          // ISO 8601 timestamp
  completedAt: string;
  executionMs: number;

  // ── Result ────────────────────────────────────────────────
  status: SkillStatus;
  confidenceScore: number;    // 0–1
  retryCount: number;

  // ── Data (keys only — no raw values for privacy/size) ─────
  inputsReceived: string[];
  outputsProduced: string[];

  // ── Issues ────────────────────────────────────────────────
  errors: SkillError[];
  warnings: SkillWarning[];
  blockingIssues: string[];   // Issues that triggered blocksDeployment

  // ── Checklist ─────────────────────────────────────────────
  auditChecklistResults: AuditChecklistResult[];

  // ── Recovery ──────────────────────────────────────────────
  recoveryAttempted: boolean;
  recoveryNote?: string;      // What correction was attempted before retry
}
