"use client";

import { useEffect, useState, useRef } from "react";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function getGreetingText(tod: TimeOfDay): string {
  switch (tod) {
    case "morning":   return "Good morning";
    case "afternoon": return "Good afternoon";
    case "evening":   return "Good evening";
    case "night":     return "Good night";
  }
}

// Ambient particles that drift across the background
function Particles({ tod }: { tod: TimeOfDay }) {
  const colors: Record<TimeOfDay, string[]> = {
    morning:   ["#fde68a", "#fed7aa", "#fca5a5", "#a5f3fc"],
    afternoon: ["#bfdbfe", "#ddd6fe", "#fbcfe8", "#bbf7d0"],
    evening:   ["#c4b5fd", "#f9a8d4", "#fcd34d", "#fb923c"],
    night:     ["#818cf8", "#a78bfa", "#e879f9", "#38bdf8"],
  };
  const palette = colors[tod];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none" }}>
      {Array.from({ length: 18 }).map((_, i) => {
        const size  = 4 + (i % 5) * 3;
        const left  = (i * 37 + 11) % 100;
        const delay = (i * 0.4) % 6;
        const dur   = 6 + (i % 4) * 2;
        const color = palette[i % palette.length];
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left:    `${left}%`,
              bottom:  "-20px",
              width:   `${size}px`,
              height:  `${size}px`,
              borderRadius: "50%",
              background: color,
              opacity: 0.55,
              animation: `floatUp ${dur}s ${delay}s ease-in-out infinite`,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </div>
  );
}

// Animated clock display
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  const h12 = String(time.getHours() % 12 || 12).padStart(2, "0");

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
      <span style={clockMainStyle}>{h12}:{mm}</span>
      <span style={clockSecStyle}>{ss}</span>
      <span style={clockAmpmStyle}>{ampm}</span>
    </div>
  );
}

interface Props {
  name: string;
  role: string;
}

export default function FancyGreeting({ name, role }: Props) {
  const [tod, setTod]           = useState<TimeOfDay>(getTimeOfDay);
  const [revealed, setRevealed] = useState(false);
  const [nameIdx, setNameIdx]   = useState(0);
  const nameRef = useRef(name);

  // Update ToD every minute
  useEffect(() => {
    const id = setInterval(() => setTod(getTimeOfDay()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Trigger entrance animation
  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(id);
  }, []);

  // Typewriter effect for name
  useEffect(() => {
    nameRef.current = name;
    setNameIdx(0);
    if (!name) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setNameIdx(i);
      if (i >= name.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [name]);

  const greeting  = getGreetingText(tod);
  const gradients: Record<TimeOfDay, string> = {
    morning:   "linear-gradient(135deg, #fef3c7 0%, #fde8d8 40%, #fce7f3 100%)",
    afternoon: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 50%, #faf5ff 100%)",
    evening:   "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
    night:     "linear-gradient(135deg, #0f0f23 0%, #1a1040 50%, #0c1445 100%)",
  };
  const isDark = tod === "evening" || tod === "night";

  const icons: Record<TimeOfDay, string> = {
    morning:   "☀️",
    afternoon: "🌤️",
    evening:   "🌇",
    night:     "🌙",
  };

  const tagColors: Record<TimeOfDay, { bg: string; color: string }> = {
    morning:   { bg: "rgba(251,191,36,0.15)",  color: "#92400e" },
    afternoon: { bg: "rgba(99,102,241,0.12)",  color: "#3730a3" },
    evening:   { bg: "rgba(167,139,250,0.2)",  color: "#ddd6fe" },
    night:     { bg: "rgba(99,102,241,0.2)",   color: "#a5b4fc" },
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 0.55; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-420px) scale(0.6); opacity: 0; }
        }
        @keyframes greetSlideIn {
          from { opacity: 0; transform: translateY(18px) skewY(1deg); }
          to   { opacity: 1; transform: translateY(0)    skewY(0deg); }
        }
        @keyframes nameSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.25); }
          70%  { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .greeting-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 2rem 2.25rem;
          background: ${gradients[tod]};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
          box-shadow: ${isDark
            ? "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)"};
          transition: background 1.2s ease, box-shadow 1.2s ease;
        }
        .greeting-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .greeting-text-area {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .greeting-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)"};
          display: flex;
          align-items: center;
          gap: 0.4rem;
          opacity: ${revealed ? 1 : 0};
          animation: ${revealed ? "greetSlideIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards" : "none"};
          animation-delay: 0.05s;
        }
        .greeting-main {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 300;
          line-height: 1.15;
          color: ${isDark ? "rgba(255,255,255,0.9)" : "#0f172a"};
          margin: 0;
          opacity: ${revealed ? 1 : 0};
          animation: ${revealed ? "greetSlideIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards" : "none"};
          animation-delay: 0.15s;
        }
        .greeting-name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 700;
          font-style: italic;
          color: ${isDark ? "#fff" : "#0f172a"};
          display: inline-block;
          opacity: ${revealed ? 1 : 0};
          animation: ${revealed ? "nameSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards" : "none"};
          animation-delay: 0.3s;
        }
        .greeting-cursor {
          display: inline-block;
          width: 3px;
          height: 1em;
          background: ${isDark ? "#a78bfa" : "#6366f1"};
          border-radius: 2px;
          vertical-align: text-bottom;
          margin-left: 3px;
          animation: blink 0.8s step-end infinite;
        }
        .role-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.6rem;
          background: ${tagColors[tod].bg};
          color: ${tagColors[tod].color};
          border-radius: 999px;
          padding: 0.3rem 0.875rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          opacity: ${revealed ? 1 : 0};
          animation: ${revealed ? "greetSlideIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards" : "none"};
          animation-delay: 0.5s;
          backdrop-filter: blur(4px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"};
        }
        .clock-area {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          opacity: ${revealed ? 1 : 0};
          animation: ${revealed ? "greetSlideIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards" : "none"};
          animation-delay: 0.2s;
        }
        .date-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          color: ${isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"};
          text-align: right;
        }
      `}</style>

      <div className="greeting-card">
        <Particles tod={tod} />

        <div className="greeting-inner">
          <div className="greeting-text-area">
            <div className="greeting-label">
              <span style={{ fontSize: "1rem" }}>{icons[tod]}</span>
              {dateStr}
            </div>

            <p className="greeting-main">
              {greeting},&nbsp;
              <span className="greeting-name">
                {name.slice(0, nameIdx)}
                {nameIdx < name.length && <span className="greeting-cursor" />}
              </span>
            </p>

            <span className="role-tag">
              <span style={{ opacity: 0.7 }}>◆</span>
              {role}
            </span>
          </div>

          <div className="clock-area">
            <LiveClock />
            <div className="date-label">
              {new Date().toLocaleDateString("en-US", { timeZoneName: "short" }).split(", ")[1] ?? ""}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Clock sub-styles */
const clockMainStyle: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
  fontWeight: 700,
  lineHeight: 1,
  color: "inherit",
  letterSpacing: "-0.02em",
};
const clockSecStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
  fontWeight: 500,
  opacity: 0.45,
  marginLeft: "2px",
};
const clockAmpmStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  opacity: 0.5,
  alignSelf: "flex-start",
  marginTop: "4px",
  marginLeft: "4px",
};
