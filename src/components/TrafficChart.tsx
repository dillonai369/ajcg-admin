"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function TrafficChart() {
  const ref = useRef(null);
  // Placeholder data — wired to Plausible later
  const visitors = [180, 210, 195, 240, 260, 310, 295, 280, 320, 355, 340, 380, 360, 395, 420, 400, 440, 460, 430, 475, 490, 510, 495, 540, 560, 590, 570, 610, 640, 680];
  const labels = visitors.map((_, i) => `${i + 1}`);

  useEffect(() => {
    // no-op; placeholder for future event wiring
  }, []);

  return (
    <Line
      ref={ref}
      height={100}
      data={{
        labels,
        datasets: [
          {
            label: "Visitors",
            data: visitors,
            borderColor: "#1e3a5f",
            backgroundColor: "rgba(30,58,95,0.06)",
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Form fills",
            data: visitors.map((v) => Math.round(v * 0.3)),
            borderColor: "#c8a559",
            backgroundColor: "transparent",
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2,
            borderDash: [4, 4],
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#94a3b8" } },
          y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 }, color: "#94a3b8" } },
        },
      }}
    />
  );
}
