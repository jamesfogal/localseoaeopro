import { Inter } from "next/font/google";
import { IntakeForm } from "./intake-form";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const MODULE_COUNT = 43;

export default function Home() {
  return (
    <div className={`${styles.page} ${inter.className}`}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoMark} aria-hidden>
              LS
            </span>
            <span>Local SEO &amp; AEO Pro</span>
          </div>
          <span className={styles.badge}>{MODULE_COUNT} power modules</span>
        </header>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Local + answer-engine visibility</p>
            <h1 className={styles.headline}>
              Rank locally.{" "}
              <span className={styles.gradient}>Get cited by AI.</span>
            </h1>
            <p className={styles.sub}>
              One platform for maps, citations, reviews, entities, and structured answers — built for teams who want premium
              control without the spreadsheet chaos.
            </p>
            <ul className={styles.pills} aria-label="Platform capabilities">
              <li>GBP &amp; local pack</li>
              <li>Schema &amp; entities</li>
              <li>AEO / LLM-ready content</li>
              <li>Reporting &amp; automations</li>
            </ul>
          </div>
          <IntakeForm />
        </div>

        <footer className={styles.footer}>
          Local SEO &amp; AEO Pro — intake for early access. Connect your stack when you&apos;re ready.
        </footer>
      </div>
    </div>
  );
}
