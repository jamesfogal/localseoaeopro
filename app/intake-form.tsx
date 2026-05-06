"use client";

import { useState } from "react";
import styles from "./page.module.css";

export type IntakeData = {
  businessName: string;
  email: string;
  website: string;
  city: string;
  phone: string;
};

type Errors = Partial<Record<keyof IntakeData, string>>;

type Props = {
  onSuccess?: (data: IntakeData) => void;
};

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

export function IntakeForm({ onSuccess }: Props) {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Errors = {};
    if (!businessName.trim()) next.businessName = "Please enter your business name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!website.trim()) next.website = "Please enter your website URL.";
    else if (!isValidUrl(website)) next.website = "Enter a valid URL (e.g. example.com).";
    if (!city.trim()) next.city = "Please enter your city.";
    if (!phone.trim()) next.phone = "Please enter your phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    onSuccess?.({
      businessName: businessName.trim(),
      email: email.trim(),
      website: normalizeUrl(website),
      city: city.trim(),
      phone: phone.trim(),
    });
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Start your free audit</h2>
      <p className={styles.cardHint}>Enter your details to access all 32 SEO &amp; AEO modules.</p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-business">Business Name</label>
          <input
            id="intake-business"
            name="businessName"
            type="text"
            autoComplete="organization"
            className={`${styles.input} ${errors.businessName ? styles.inputError : ""}`}
            placeholder="Acme Plumbing Co."
            value={businessName}
            onChange={(e) => { setBusinessName(e.target.value); if (errors.businessName) setErrors((p) => ({ ...p, businessName: undefined })); }}
          />
          {errors.businessName && <p className={styles.errorText} role="alert">{errors.businessName}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-city">City</label>
          <input
            id="intake-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
            placeholder="St. Charles"
            value={city}
            onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors((p) => ({ ...p, city: undefined })); }}
          />
          {errors.city && <p className={styles.errorText} role="alert">{errors.city}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-website">Website URL</label>
          <input
            id="intake-website"
            name="website"
            type="url"
            autoComplete="url"
            className={`${styles.input} ${errors.website ? styles.inputError : ""}`}
            placeholder="https://yourbusiness.com"
            value={website}
            onChange={(e) => { setWebsite(e.target.value); if (errors.website) setErrors((p) => ({ ...p, website: undefined })); }}
          />
          {errors.website && <p className={styles.errorText} role="alert">{errors.website}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-email">Email Address</label>
          <input
            id="intake-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
          />
          {errors.email && <p className={styles.errorText} role="alert">{errors.email}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-phone">Phone Number</label>
          <input
            id="intake-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: undefined })); }}
          />
          {errors.phone && <p className={styles.errorText} role="alert">{errors.phone}</p>}
        </div>

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Launching audit…" : "Run My Free SEO Audit →"}
        </button>
      </form>
    </div>
  );
}
