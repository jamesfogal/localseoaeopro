export type MsgType = "text" | "typing" | "chips" | "countdown" | "result-card" | "qa-answer";
export type MsgFrom = "bot" | "user";
export type Stage = "idle" | "url" | "city" | "industry" | "email" | "running" | "results" | "qa";

export interface Msg {
  id: string;
  from: MsgFrom;
  type: MsgType;
  text?: string;
  chips?: string[];
  auditData?: AuditResult;
}

export interface AuditResult {
  reportId?: string;
  mobileScore?: number;
  desktopScore?: number;
  passesOneSecond?: boolean;
  ttfb?: number;
  lcp?: number;
  cms?: string;
  hosting?: string;
  topIssues?: string[];
  city?: string;
  industry?: string;
  url?: string;
  error?: string;
  duplicate?: boolean;
  limit?: boolean;
}

export interface Collected {
  url: string;
  city: string;
  industry: string;
  email: string;
}
