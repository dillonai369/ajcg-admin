"use client";

import { useEffect } from "react";

/**
 * Toggles the `has-hero` class on <body> while the homepage is mounted.
 * The static site set this class directly in index.html — we add it here
 * because the App Router's root <body> belongs to RootLayout, not the page.
 */
export default function HasHeroFlag() {
  useEffect(() => {
    document.body.classList.add("has-hero");
    return () => document.body.classList.remove("has-hero");
  }, []);
  return null;
}
