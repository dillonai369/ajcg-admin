"use client";

import { useEffect, useState } from "react";

/**
 * Homepage hero background.
 *
 * Desktop: the autoplaying loop, exactly as before.
 * Phones (<768px): the poster frame only. The 3 MB video was the second-largest
 * download in Google's mobile test and most phones block autoplay anyway, so
 * visitors were paying for a video that never played. Server-side we render
 * the poster for everyone (no hydration mismatch), then swap in the video on
 * desktop after mount.
 */
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setShowVideo(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!showVideo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="hero-video" src={poster} alt="" fetchPriority="high" decoding="async" />;
  }

  return (
    <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={poster}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
