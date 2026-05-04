"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Errors = Partial<Record<"name" | "email" | "website" | "phone", string>>;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeUrl(value: string) {
  const t = value.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function isValidUrl(value: string) {
  const raw = value.trim();
  if (!raw) return false;
  try {
    const u = new URL(normalizeUrl(raw));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function IntakeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!website.trim()) next.website = "Please enter your website URL.";
    else if (!isValidUrl(website)) next.website = "Enter a valid URL (e.g. example.com).";
    if (!phone.trim()) next.phone = "Please enter your phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 650));
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className={styles.card}>
        <div className={styles.success}>
          <div className={styles.successIcon} aria-hidden>
            ✓
          </div>
          <h3>You&apos;re on the list</h3>
          <p>
            Thanks, {name.trim().split(/\s+/)[0]}. We&apos;ll review your site and follow up at{" "}
            <strong style={{ color: "#cbd5e1" }}>{email.trim()}</strong> shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Request access</h2>
      <p className={styles.cardHint}>Tell us about your business — we&apos;ll tailor Local SEO &amp; AEO to your market.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-name">
            Name
          </label>
          <input
            id="intake-name"
            name="name"
            type="text"
            autoComplete="name"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
          />
          {errors.name ? (
            <p className={styles.errorText} role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-email">
            Email
          </label>
          <input
            id="intake-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
          />
          {errors.email ? (
            <p className={styles.errorText} role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-website">
            Website URL
          </label>
          <input
            id="intake-website"
            name="website"
            type="url"
            autoComplete="url"
            className={`${styles.input} ${errors.website ? styles.inputError : ""}`}
            placeholder="https://yourbusiness.com"
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              if (errors.website) setErrors((p) => ({ ...p, website: undefined }));
            }}
          />
          {errors.website ? (
            <p className={styles.errorText} role="alert">
              {errors.website}
            </p>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-phone">
            Phone number
          </label>
          <input
            id="intake-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
            }}
          />
          {errors.phone ? (
            <p className={styles.errorText} role="alert">
              {errors.phone}
            </p>
          ) : null}
        </div>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Sending…" : "Get started"}
        </button>
      </form>
    </div>
  );
}
