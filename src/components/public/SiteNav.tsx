"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Top-of-page nav (centered links + right-side phone/email/CTA + mobile burger).
 * Pixel-identical to the static site's nav at index.html / our-team.html / etc.
 *
 * The "scrolled" class on .nav (homepage only, when body.has-hero) is applied
 * via a useEffect that watches scrollY against 60% of viewport height — same
 * trigger the static site uses inline in index.html.
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Only homepage has body.has-hero — we look it up at runtime so this nav
  // works as a single component across every page.
  useEffect(() => {
    function check() {
      if (!document.body.classList.contains("has-hero")) {
        setScrolled(false);
        return;
      }
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    if (open) document.body.classList.add("menu-open");
    else document.body.classList.remove("menu-open");
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className={`nav nav-centered${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo/aj-logo-white.png" alt="AJ Commercial Group" />
            </div>
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/recently-sold">Properties</Link>
            </li>
            <li>
              <Link href="/our-team">Team</Link>
            </li>
            <li>
              <a href="#" className="has-dropdown" onClick={(e) => e.preventDefault()}>
                Services
              </a>
              <div className="dropdown">
                <Link href="/buying">Buying</Link>
                <Link href="/selling">Selling</Link>
                <Link href="/exchange-1031">1031 Exchange</Link>
              </div>
            </li>
            <li>
              <Link href="/blog">News</Link>
            </li>
          </ul>
          <div className="nav-right">
            <a href="tel:6308957989" className="nav-icon-btn" aria-label="Call">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            <a href="mailto:contact@ajcommercialgroup.com" className="nav-icon-btn" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
            <Link href="/selling" className="nav-cta">
              Free Valuation
            </Link>
          </div>
          <button
            className={`nav-burger${open ? " is-open" : ""}`}
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-header">
          <Link href="/" className="logo" onClick={() => setOpen(false)}>
            <div className="logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo/aj-logo-black.png" alt="AJ Commercial Group" />
            </div>
            <div>
              <div className="logo-text">AJ Commercial Group</div>
              <div className="logo-sub">Multifamily Advisors</div>
            </div>
          </Link>
          <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <ul className="mobile-menu-list" onClick={() => setOpen(false)}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/our-team">About</Link>
          </li>
          <li>
            <Link href="/recently-sold">Recently Sold</Link>
          </li>
          <li>
            <Link href="/blog">Insights</Link>
          </li>
          <li>
            <Link href="/buying">Buying</Link>
          </li>
          <li>
            <Link href="/selling">Selling</Link>
          </li>
          <li>
            <Link href="/exchange-1031">1031 Exchange</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <Link href="/careers">Careers</Link>
          </li>
        </ul>
        <div className="mobile-menu-footer">
          <a href="tel:6308957989" className="mobile-menu-phone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            (630) 895-7989
          </a>
          <Link href="/selling" className="mobile-menu-cta" onClick={() => setOpen(false)}>
            Get a Free Valuation
          </Link>
        </div>
      </div>
    </>
  );
}
