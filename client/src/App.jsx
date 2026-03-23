import { useState } from 'react';
import LeadershipSimulations from './suites/LeadershipSimulations';
import LeadershipObservations from './suites/LeadershipObservations';
import AnalyticalSimulations from './suites/AnalyticalSimulations';
import AnalyticalObservations from './suites/AnalyticalObservations';

const C = {
  navy: "#0a1628", navyLight: "#132843", navyMid: "#1a3d5c",
  gold: "#c5a55a", goldBg: "#fdf8e8",
  white: "#fff", offWhite: "#f8f9fa", lightGray: "#e8eef4",
  midGray: "#6c757d", text: "#1a1a1a", textSec: "#555",
  teal: "#00796b", tealBg: "#e0f2f1",
  blue: "#1565c0", blueBg: "#e3f2fd",
};

const WEEKS = [
  { num: 1, title: "Scholarly Research, AI, and APA Style", group: "analytical" },
  { num: 2, title: "Logical Fallacies", group: "analytical" },
  { num: 3, title: "Critical Thinking (Paulian)", group: "analytical" },
  { num: 4, title: "Active Listening", group: "leadership" },
  { num: 5, title: "Empathy", group: "leadership" },
  { num: 6, title: "Leadership Coaching", group: "leadership" },
  { num: 7, title: "Mentoring", group: "leadership" },
  { num: 8, title: "Coaching Supervision", group: "leadership" },
  { num: 9, title: "Storytelling / Hero's Journey", group: "leadership" },
];

function Landing({ onSelect }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: C.offWhite, minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, padding: "28px 24px 24px", color: C.white, textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>EMBRY-RIDDLE AERONAUTICAL UNIVERSITY</div>
        <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>OBLD 500 Leadership Simulation Suite</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>AI-powered observation and practice for leadership development</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ fontSize: 14, color: C.textSec, textAlign: "center", marginBottom: 28, maxWidth: 560, margin: "0 auto 28px" }}>
          Select a week, then choose to <strong>observe</strong> a demonstration conversation or <strong>practice</strong> the skill yourself in an interactive simulation with AI feedback.
        </div>

        {WEEKS.map(w => (
          <div key={w.num} style={{ background: C.white, border: `1px solid ${C.lightGray}`, borderRadius: 10, padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.white, background: C.navy, borderRadius: 4, padding: "2px 8px", minWidth: 28, textAlign: "center" }}>W{w.num}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{w.title}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onSelect(w.group === "analytical" ? "obs-analytical" : "obs-leadership")}
                style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: C.teal, background: C.tealBg, border: `1px solid ${C.teal}40`, borderRadius: 6, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                onMouseOver={e => { e.target.style.background = C.teal; e.target.style.color = C.white; }}
                onMouseOut={e => { e.target.style.background = C.tealBg; e.target.style.color = C.teal; }}>
                Observe
              </button>
              <button onClick={() => onSelect(w.group === "analytical" ? "sim-analytical" : "sim-leadership")}
                style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: C.navy, background: C.blueBg, border: `1px solid ${C.navy}30`, borderRadius: 6, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                onMouseOver={e => { e.target.style.background = C.navy; e.target.style.color = C.white; }}
                onMouseOut={e => { e.target.style.background = C.blueBg; e.target.style.color = C.navy; }}>
                Practice
              </button>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.midGray }}>
          OBLD 500: Leadership in Organizations | Dr. Daryl Watkins | Embry-Riddle Aeronautical University
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [suite, setSuite] = useState(null);

  if (suite === "sim-leadership") return <LeadershipSimulations onHome={() => setSuite(null)} />;
  if (suite === "sim-analytical") return <AnalyticalSimulations onHome={() => setSuite(null)} />;
  if (suite === "obs-leadership") return <LeadershipObservations onHome={() => setSuite(null)} />;
  if (suite === "obs-analytical") return <AnalyticalObservations onHome={() => setSuite(null)} />;
  return <Landing onSelect={setSuite} />;
}
