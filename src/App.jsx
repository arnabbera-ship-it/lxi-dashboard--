import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

// ---------- Design tokens ----------
const T = {
  bg: "#12151A",
  surface: "#1B1F26",
  surfaceRaised: "#20252D",
  hairline: "#2A303A",
  textPrimary: "#F2F4F6",
  textMuted: "#8B95A1",
  textFaint: "#5B6472",
  amber: "#E8A33D",
  teal: "#3FC9B0",
  red: "#E1584A",
  blue: "#5B8DEF",
  violet: "#9B7BE0",
};
const displayFont = "'Oswald', 'Barlow Condensed', sans-serif";
const bodyFont = "'Inter', system-ui, sans-serif";
const monoFont = "'JetBrains Mono', 'Roboto Mono', monospace";

const DEPT_COLOR = {
  "Technical": T.blue,
  "Sales & Service": T.teal,
  "Management": T.amber,
  "Compliance & Safety": T.violet,
};

// ---------- Raw pilot dataset (mirrors the report exactly) ----------
const RAW = [
  { name: "Advanced CNC Machining Fundamentals", dept: "Technical", cohort: 24, quarter: "Q1", dims: { cr: 84, fe: 79, nps: 72, ltq: 75, la: 76, kg: 74, ei: 68, tas: null } },
  { name: "PLC Programming for Line Technicians", dept: "Technical", cohort: 19, quarter: "Q1", dims: { cr: 80, fe: 75, nps: 66, ltq: 70, la: 73, kg: 70, ei: 64, tas: 61 } },
  { name: "Customer-Facing Service Excellence", dept: "Sales & Service", cohort: 31, quarter: "Q2", dims: { cr: 79, fe: 88, nps: 80, ltq: 78, la: 82, kg: 75, ei: 79, tas: 69 } },
  { name: "Dealer Network Negotiation Skills", dept: "Sales & Service", cohort: 22, quarter: "Q2", dims: { cr: 74, fe: 81, nps: 71, ltq: 69, la: 75, kg: 68, ei: 70, tas: 58 } },
  { name: "First-Time Manager Transition Programme", dept: "Management", cohort: 18, quarter: "Q3", dims: { cr: 77, fe: 83, nps: 74, ltq: 72, la: 79, kg: 71, ei: 73, tas: 64 } },
  { name: "Strategic Decision-Making Workshop", dept: "Management", cohort: 15, quarter: "Q3", dims: { cr: 82, fe: 85, nps: 78, ltq: 74, la: 80, kg: 76, ei: 71, tas: null } },
  { name: "Quality & Compliance Refresher", dept: "Compliance & Safety", cohort: 40, quarter: "Q4", dims: { cr: 68, fe: 64, nps: 55, ltq: 62, la: 66, kg: 60, ei: 52, tas: 47 } },
  { name: "Safety Systems Certification Renewal", dept: "Compliance & Safety", cohort: 35, quarter: "Q4", dims: { cr: 71, fe: 69, nps: 60, ltq: 65, la: 68, kg: 63, ei: 58, tas: 51 } },
];

const r1 = (x) => Math.round(x * 10) / 10;

const PROGRAMMES = RAW.map((p, i) => {
  const experience = r1(p.dims.cr * 0.30 + p.dims.fe * 0.30 + p.dims.nps * 0.22 + p.dims.ltq * 0.09 + p.dims.la * 0.09);
  const learning = r1(p.dims.kg * 0.55 + p.dims.ei * 0.45);
  const hasApp = p.dims.tas != null;
  const application = hasApp ? r1(p.dims.tas * 0.5 + Math.min(100, p.dims.tas * 0.5 + p.dims.kg * 0.5 * 0.9) * 0.5) : null;
  const composite = hasApp ? r1(experience * 0.4 + learning * 0.3 + application * 0.3) : r1(experience * 0.4 + learning * 0.3);
  return {
    id: `p${i}`, ...p, experience, learning, application, composite,
    status: hasApp ? "Final" : "Provisional",
    dimsArr: [
      { key: "Content Relevance", val: p.dims.cr, layer: "A" },
      { key: "Facilitator Effectiveness", val: p.dims.fe, layer: "A" },
      { key: "Net Promoter Score", val: p.dims.nps, layer: "A" },
      { key: "Learning Touchpoint Quality", val: p.dims.ltq, layer: "A" },
      { key: "Learning Ambience", val: p.dims.la, layer: "A" },
      { key: "Knowledge Gain", val: p.dims.kg, layer: "B" },
      { key: "Engagement Index (quality-weighted)", val: p.dims.ei, layer: "B" },
      { key: "Transfer / Application Score", val: p.dims.tas, layer: "C" },
    ],
  };
});

const DEPTS = ["Technical", "Sales & Service", "Management", "Compliance & Safety"];

function bandColor(v) {
  if (v == null) return T.textFaint;
  if (v >= 80) return T.teal;
  if (v >= 60) return T.amber;
  return T.red;
}
function bandLabel(v) {
  if (v == null) return "Pending";
  if (v >= 80) return "High";
  if (v >= 60) return "Medium";
  return "Low";
}

// ---------- Radial gauge (signature element) ----------
function Gauge({ value, provisional, size = 176 }) {
  const stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value ?? 0, 0), 100) / 100;
  const sweep = 270, startAngle = -225;
  const dashLen = (circ * sweep) / 360;
  const valueLen = dashLen * pct;
  const color = bandColor(value);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.hairline} strokeWidth={stroke} strokeDasharray={`${dashLen} ${circ}`} strokeLinecap="round" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${valueLen} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.6s ease" }} />
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: monoFont, fontSize: 38, fontWeight: 700, color: T.textPrimary, lineHeight: 1 }}>
          {value != null ? value.toFixed(1) : "—"}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 10, letterSpacing: "0.08em", color: T.textMuted, marginTop: 5, textTransform: "uppercase" }}>
          {provisional ? "Provisional LXI" : "Composite LXI"}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 150 }}>
      <div style={{ fontFamily: bodyFont, fontSize: 10.5, letterSpacing: "0.07em", color: T.textMuted, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: monoFont, fontSize: 26, fontWeight: 700, color: color || T.textPrimary }}>{value}</div>
      {sub && <div style={{ fontFamily: bodyFont, fontSize: 11, color: T.textFaint, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function LayerCard({ label, value, sublabel }) {
  const color = bandColor(value);
  return (
    <div style={{ background: T.surfaceRaised, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: "16px 18px", flex: 1, minWidth: 150 }}>
      <div style={{ fontFamily: bodyFont, fontSize: 10.5, letterSpacing: "0.07em", color: T.textMuted, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: monoFont, fontSize: 26, fontWeight: 700, color: value != null ? T.textPrimary : T.textFaint }}>{value != null ? value.toFixed(1) : "—"}</span>
        <span style={{ fontFamily: bodyFont, fontSize: 11.5, color, fontWeight: 600 }}>{bandLabel(value)}</span>
      </div>
      <div style={{ fontFamily: bodyFont, fontSize: 10.5, color: T.textFaint, marginTop: 6 }}>{sublabel}</div>
    </div>
  );
}

function DimBar({ dim }) {
  const color = bandColor(dim.val);
  const pct = dim.val ?? 0;
  const layerTag = { A: "Experience", B: "Learning", C: "Application" }[dim.layer];
  const layerColor = { A: T.blue, B: T.amber, C: T.teal }[dim.layer];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", color: layerColor, border: `1px solid ${layerColor}55`, borderRadius: 4, padding: "1px 5px", textTransform: "uppercase" }}>{layerTag}</span>
          <span style={{ fontFamily: bodyFont, fontSize: 12.5, color: T.textPrimary }}>{dim.key}</span>
        </div>
        <span style={{ fontFamily: monoFont, fontSize: 12, color: dim.val != null ? T.textPrimary : T.textFaint }}>{dim.val != null ? dim.val.toFixed(0) : "Pending"}</span>
      </div>
      <div style={{ height: 5, background: T.hairline, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: T.surfaceRaised, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: "10px 12px", fontFamily: bodyFont }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, fontFamily: monoFont }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [deptFilter, setDeptFilter] = useState("All");
  const [activeId, setActiveId] = useState(PROGRAMMES[0].id);

  const filtered = useMemo(
    () => (deptFilter === "All" ? PROGRAMMES : PROGRAMMES.filter((p) => p.dept === deptFilter)),
    [deptFilter]
  );

  const prog = useMemo(() => PROGRAMMES.find((p) => p.id === activeId) || filtered[0], [activeId, filtered]);

  const orgStats = useMemo(() => {
    const composites = PROGRAMMES.map((p) => p.composite);
    return {
      mean: r1(composites.reduce((a, b) => a + b, 0) / composites.length),
      min: Math.min(...composites),
      max: Math.max(...composites),
      n: PROGRAMMES.length,
    };
  }, []);

  const deptChartData = useMemo(() => DEPTS.map((d) => {
    const rows = PROGRAMMES.filter((p) => p.dept === d);
    const avg = (k) => r1(rows.reduce((s, r) => s + r[k], 0) / rows.length);
    return { dept: d.length > 14 ? d.slice(0, 12) + "…" : d, fullDept: d, Experience: avg("experience"), Learning: avg("learning"), Composite: avg("composite") };
  }), []);

  const quarterData = useMemo(() => ["Q1", "Q2", "Q3", "Q4"].map((q) => {
    const rows = PROGRAMMES.filter((p) => p.quarter === q);
    return { quarter: q, "Avg. Composite LXI": r1(rows.reduce((s, r) => s + r.composite, 0) / rows.length) };
  }), []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.textPrimary, fontFamily: bodyFont, padding: "28px 24px 60px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');`}</style>

      <div style={{ maxWidth: 1240, margin: "0 auto 24px" }}>
        <div style={{ fontFamily: bodyFont, fontSize: 11, letterSpacing: "0.12em", color: T.amber, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
          Talent Management · Phase II Pilot
        </div>
        <div style={{ fontFamily: displayFont, fontSize: 30, fontWeight: 600, color: T.textPrimary }}>
          Learning Experience Composite Scorecard
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto" }}>

        {/* ---- Org-wide stats ---- */}
        <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
          <StatCard label="Pilot Mean Composite LXI" value={orgStats.mean.toFixed(1)} sub={`Across ${orgStats.n} programmes`} color={T.amber} />
          <StatCard label="Highest Composite LXI" value={orgStats.max.toFixed(1)} sub="Customer-Facing Service Excellence" color={T.teal} />
          <StatCard label="Lowest Composite LXI" value={orgStats.min.toFixed(1)} sub="Quality & Compliance Refresher" color={T.red} />
          <StatCard label="Departments Piloted" value="4" sub="Technical · Sales · Mgmt · Compliance" />
        </div>

        {/* ---- Department comparison + Quarterly trend ---- */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 22 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 14 }}>
              Department-Level Averages
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptChartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.hairline} vertical={false} />
                <XAxis dataKey="dept" tick={{ fill: T.textMuted, fontSize: 11, fontFamily: bodyFont }} axisLine={{ stroke: T.hairline }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: T.textMuted, fontSize: 11, fontFamily: bodyFont }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: T.hairline, opacity: 0.3 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: bodyFont, color: T.textMuted }} />
                <Bar dataKey="Experience" fill={T.blue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Learning" fill={T.amber} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Composite" fill={T.teal} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>
              Quarterly Trend
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 10.5, color: T.textFaint, marginBottom: 10 }}>n = 2 programmes / quarter — illustrative</div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={quarterData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.hairline} vertical={false} />
                <XAxis dataKey="quarter" tick={{ fill: T.textMuted, fontSize: 11, fontFamily: bodyFont }} axisLine={{ stroke: T.hairline }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: T.textMuted, fontSize: 11, fontFamily: bodyFont }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="Avg. Composite LXI" stroke={T.amber} strokeWidth={2.5} dot={{ r: 4, fill: T.amber }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---- Department filter + programme picker ---- */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["All", ...DEPTS].map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              style={{
                fontFamily: bodyFont, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                padding: "8px 14px", borderRadius: 8,
                background: deptFilter === d ? T.amber : "transparent",
                color: deptFilter === d ? "#1A1200" : T.textMuted,
                border: `1px solid ${deptFilter === d ? T.amber : T.hairline}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              style={{
                textAlign: "left", cursor: "pointer", flex: "1 1 260px", maxWidth: 300,
                background: p.id === prog.id ? T.surfaceRaised : T.surface,
                border: `1px solid ${p.id === prog.id ? DEPT_COLOR[p.dept] : T.hairline}`,
                borderRadius: 10, padding: "12px 14px",
              }}
            >
              <div style={{ fontFamily: bodyFont, fontSize: 9.5, fontWeight: 700, color: DEPT_COLOR[p.dept], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {p.dept}
              </div>
              <div style={{ fontFamily: bodyFont, fontSize: 13, color: T.textPrimary, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: bandColor(p.composite) }}>{p.composite.toFixed(1)}</span>
                <span style={{ fontFamily: bodyFont, fontSize: 10.5, color: T.textFaint }}>{p.status}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ---- Selected programme detail ---- */}
        <div style={{ background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: "24px 26px", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <Gauge value={prog.composite} provisional={prog.status === "Provisional"} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontFamily: displayFont, fontSize: 21, fontWeight: 600, marginBottom: 6 }}>{prog.name}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: bodyFont, fontSize: 12.5, color: T.textMuted }}>
              <span>{prog.dept}</span><span style={{ color: T.hairline }}>|</span>
              <span>Cohort: {prog.cohort}</span><span style={{ color: T.hairline }}>|</span>
              <span>{prog.quarter}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <span style={{
                fontFamily: bodyFont, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "4px 10px", borderRadius: 20,
                background: prog.status === "Provisional" ? `${T.amber}22` : `${T.teal}22`,
                color: prog.status === "Provisional" ? T.amber : T.teal,
              }}>
                {prog.status === "Provisional" ? "Provisional — Application layer pending (+90 days)" : "Final — all layers complete"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <LayerCard label="Experience" value={prog.experience} sublabel="Content · Facilitator · NPS · Touchpoint · Ambience" />
          <LayerCard label="Learning & Engagement" value={prog.learning} sublabel="Knowledge Gain · Quality-weighted Engagement" />
          <LayerCard label="Application & Execution" value={prog.application} sublabel={prog.application == null ? "Collects at +90 days post-training" : "Transfer Score · Linked KPI (CBA)"} />
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: "22px 24px" }}>
          <div style={{ fontFamily: bodyFont, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>
            Dimension Drill-Down
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 10.5, color: T.textFaint, marginBottom: 16 }}>High ≥ 80 · Medium 60–79 · Low &lt; 60</div>
          {prog.dimsArr.map((d) => <DimBar key={d.key} dim={d} />)}
        </div>

        <div style={{ marginTop: 20, fontFamily: bodyFont, fontSize: 10.5, color: T.textFaint, textAlign: "center", lineHeight: 1.6 }}>
          Composite LXI = (Experience × 0.40) + (Learning × 0.30) + (Application × 0.30) · Manager-facing view · Pilot dataset (n = 8), illustrative
        </div>
      </div>
    </div>
  );
}
