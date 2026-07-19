// ============================================================
// Health Reporter — the one function every skill calls to
// write its execution report to Supabase. No skill reports
// its own health directly; all reporting goes through here.
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type { SkillExecutionReport } from "./skillExecutionReport";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function emitReport(report: SkillExecutionReport): Promise<void> {
  try {
    const { error } = await supabase.from("skill_executions").upsert({
      report_id:                report.reportId,
      skill_id:                 report.skillId,
      version:                  report.version,
      project_id:               report.projectId,
      client_id:                report.clientId ?? null,
      page_id:                  report.pageId ?? null,
      started_at:               report.startedAt,
      completed_at:             report.completedAt,
      execution_ms:             report.executionMs,
      status:                   report.status,
      confidence_score:         report.confidenceScore,
      retry_count:              report.retryCount,
      inputs_received:          report.inputsReceived,
      outputs_produced:         report.outputsProduced,
      errors:                   report.errors,
      warnings:                 report.warnings,
      blocking_issues:          report.blockingIssues,
      audit_checklist_results:  report.auditChecklistResults,
      recovery_attempted:       report.recoveryAttempted,
      recovery_note:            report.recoveryNote ?? null,
    }, { onConflict: "report_id" });

    if (error) {
      console.error("HEALTH_REPORTER_FAIL:", JSON.stringify({
        skillId: report.skillId,
        reportId: report.reportId,
        message: error.message,
        code: error.code,
      }));
    }
  } catch (err) {
    // Health reporting must never crash the skill that called it
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("HEALTH_REPORTER_EXCEPTION:", msg);
  }
}

// ── Convenience: open a report at skill start, close it at end ──────────

export function openReport(
  partial: Pick<SkillExecutionReport, "reportId" | "skillId" | "version" | "projectId"> &
    Partial<SkillExecutionReport>
): SkillExecutionReport {
  return {
    clientId: undefined,
    pageId: undefined,
    startedAt: new Date().toISOString(),
    completedAt: "",
    executionMs: 0,
    status: "running",
    confidenceScore: 0,
    retryCount: 0,
    inputsReceived: [],
    outputsProduced: [],
    errors: [],
    warnings: [],
    blockingIssues: [],
    auditChecklistResults: [],
    recoveryAttempted: false,
    recoveryNote: undefined,
    ...partial,
  };
}

export function closeReport(
  report: SkillExecutionReport,
  updates: Partial<SkillExecutionReport>
): SkillExecutionReport {
  const completedAt = new Date().toISOString();
  const executionMs = new Date(completedAt).getTime() - new Date(report.startedAt).getTime();
  return { ...report, ...updates, completedAt, executionMs };
}
