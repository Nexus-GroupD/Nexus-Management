"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FancyGreeting from "@/components/FancyGreeting";

type Me = { id: number; name: string; dbRole: string; role: string };
type Shift = { shiftId: number; date: string; startTime: string; endTime: string; personId: number | null; employee?: { id: number; name: string } | null };

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Home() {
  const router = useRouter();
  const [me, setMe]         = useState<Me | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState<string | null>(null); // "YYYY-MM-DD"

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) { router.replace("/login"); return; }
      const meData: Me = await meRes.json();
      setMe(meData);

      const shiftRes = await fetch("/api/shifts");
      const shiftJson = await shiftRes.json();
      if (shiftJson.success && Array.isArray(shiftJson.data)) {
        const isAdmin = meData.id === 0;
        const visible = isAdmin
          ? shiftJson.data
          : shiftJson.data.filter((s: Shift) => s.personId === meData.id);
        setShifts(visible);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div style={{ height: "100vh", background: "#f8fafc" }} />;
  if (!me) return null;

  // Calendar math
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const shiftsByDate: Record<string, Shift[]> = {};
  shifts.forEach((s) => {
    const key = s.date.slice(0, 10);
    if (!shiftsByDate[key]) shiftsByDate[key] = [];
    shiftsByDate[key].push(s);
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelected(null);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedShifts = selected ? (shiftsByDate[selected] ?? []) : [];

  // Upcoming shifts (next 7 days from today)
  const upcoming = shifts
    .filter((s) => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <>
      <Navbar pageTitle="Home" />
      <div style={pageStyle}>

        {/* Greeting */}
        <FancyGreeting name={me.name} role={me.dbRole} />

        <div style={layoutStyle}>
          {/* Calendar */}
          <div style={calendarCardStyle}>
            {/* Month nav */}
            <div style={calNavStyle}>
              <button onClick={prevMonth} style={navBtnStyle}>‹</button>
              <span style={monthLabelStyle}>{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} style={navBtnStyle}>›</button>
            </div>

            {/* Day headers */}
            <div style={gridStyle}>
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} style={dayHeaderStyle}>{d}</div>
              ))}

              {/* Day cells */}
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const hasShift = !!shiftsByDate[dateStr];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selected;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelected(isSelected ? null : dateStr)}
                    style={{
                      ...dayCellStyle,
                      ...(isToday ? todayCellStyle : {}),
                      ...(isSelected ? selectedCellStyle : {}),
                      position: "relative",
                    }}
                  >
                    {day}
                    {hasShift && (
                      <span style={{
                        ...shiftDotStyle,
                        background: isSelected ? "white" : "#0f172a",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected day detail */}
            {selected && (
              <div style={detailPanelStyle}>
                <p style={detailDateStyle}>
                  {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                {selectedShifts.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>No shifts scheduled</p>
                ) : (
                  selectedShifts.map((s) => (
                    <div key={s.shiftId} style={shiftPillStyle}>
                      <span style={shiftDotInlineStyle} />
                      <div>
                        <div>{s.startTime} – {s.endTime}</div>
                        {s.employee?.name && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
                            {s.employee.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Upcoming shifts sidebar */}
          <div style={sidebarStyle}>
            <h3 style={sidebarTitleStyle}>Upcoming Shifts</h3>
            {upcoming.length === 0 ? (
              <p style={emptyStyle}>No upcoming shifts scheduled.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {upcoming.map((s) => {
                  const d = new Date(s.date + "T00:00:00");
                  const isToday = s.date.slice(0,10) === todayStr;
                  return (
                    <div key={s.shiftId} style={upcomingRowStyle}>
                      <div style={upcomingDateBoxStyle}>
                        <span style={upcomingMonStyle}>{d.toLocaleDateString("en-US",{month:"short"})}</span>
                        <span style={upcomingDayNumStyle}>{d.getDate()}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>
                          {isToday ? "Today" : d.toLocaleDateString("en-US",{weekday:"short"})}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.1rem" }}>
                          {s.startTime} – {s.endTime}
                        </div>
                        {me.id === 0 && s.employee?.name && (
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                            {s.employee.name}
                          </div>
                        )}
                      </div>
                      {isToday && <span style={todayBadgeStyle}>Today</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Styles ── */
const pageStyle: React.CSSProperties = {
  maxWidth: "900px", margin: "0 auto", padding: "6rem 1.5rem 3rem",
};
const layoutStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.25rem", alignItems: "start",
};
const calendarCardStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px", padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};
const calNavStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem",
};
const navBtnStyle: React.CSSProperties = {
  background: "#f1f5f9", border: "none", borderRadius: "8px",
  width: "32px", height: "32px", cursor: "pointer",
  fontSize: "1.1rem", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center",
};
const monthLabelStyle: React.CSSProperties = { fontWeight: 700, fontSize: "1rem", color: "#0f172a" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" };
const dayHeaderStyle: React.CSSProperties = {
  textAlign: "center", fontSize: "0.75rem", fontWeight: 600,
  color: "#94a3b8", padding: "0.25rem 0", textTransform: "uppercase",
};
const dayCellStyle: React.CSSProperties = {
  aspectRatio: "1", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  borderRadius: "8px", border: "none", background: "transparent",
  cursor: "pointer", fontSize: "0.875rem", color: "#374151",
  fontWeight: 500, gap: "3px", transition: "background 0.1s",
};
const todayCellStyle: React.CSSProperties = {
  background: "#f1f5f9", color: "#0f172a", fontWeight: 700,
};
const selectedCellStyle: React.CSSProperties = {
  background: "#0f172a", color: "white",
};
const shiftDotStyle: React.CSSProperties = {
  width: "5px", height: "5px", borderRadius: "50%", display: "block",
};
const detailPanelStyle: React.CSSProperties = {
  marginTop: "1.25rem", paddingTop: "1.25rem",
  borderTop: "1px solid #f1f5f9",
  display: "flex", flexDirection: "column", gap: "0.5rem",
};
const detailDateStyle: React.CSSProperties = {
  margin: "0 0 0.4rem", fontWeight: 700, color: "#0f172a", fontSize: "0.9rem",
};
const shiftPillStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.5rem",
  background: "#f8fafc", borderRadius: "8px", padding: "0.5rem 0.75rem",
  fontSize: "0.875rem", color: "#374151", fontWeight: 500,
};
const shiftDotInlineStyle: React.CSSProperties = {
  width: "7px", height: "7px", borderRadius: "50%",
  background: "#0f172a", flexShrink: 0,
};

// Sidebar
const sidebarStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px", padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};
const sidebarTitleStyle: React.CSSProperties = {
  margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a",
};
const emptyStyle: React.CSSProperties = { color: "#94a3b8", fontSize: "0.875rem", margin: 0 };
const upcomingRowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.875rem",
  padding: "0.75rem", borderRadius: "10px", background: "#f8fafc",
};
const upcomingDateBoxStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center",
  background: "#0f172a", color: "white", borderRadius: "8px",
  padding: "0.3rem 0.5rem", minWidth: "38px",
};
const upcomingMonStyle: React.CSSProperties = { fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", opacity: 0.7 };
const upcomingDayNumStyle: React.CSSProperties = { fontSize: "1rem", fontWeight: 700, lineHeight: 1 };
const todayBadgeStyle: React.CSSProperties = {
  marginLeft: "auto", background: "#dcfce7", color: "#16a34a",
  borderRadius: "999px", padding: "0.15rem 0.5rem",
  fontSize: "0.7rem", fontWeight: 600,
};
