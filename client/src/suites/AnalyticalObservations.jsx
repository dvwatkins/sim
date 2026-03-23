import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  navy: "#0a1628", navyLight: "#132843", navyMid: "#1a3d5c",
  gold: "#c5a55a", goldBg: "#fdf8e8",
  white: "#fff", offWhite: "#f8f9fa", lightGray: "#e8eef4",
  midGray: "#6c757d", text: "#1a1a1a", textSec: "#555",
  blue: "#1565c0", blueBg: "#e3f2fd",
  teal: "#00796b", tealBg: "#e0f2f1",
  danger: "#c62828", dangerBg: "#ffebee",
};

const WEEK_META = {
  SR: {
    week: 1, title: "Scholarly Research",
    watchFor: [
      "How the expert distinguishes scholarly, professional, and popular sources",
      "When the expert demonstrates a systematic evaluation framework (not just gut feeling)",
      "How database search strategies differ from Google searching",
      "When AI-generated content is identified and verification steps are applied",
      "Whether the learner internalizes the criteria or just accepts the expert's judgment",
    ],
    reflectionPrompts: [
      "What evaluation criteria did the expert use to assess source quality? How did they apply them?",
      "Was there a moment where a source the learner trusted was shown to be weak? What made the difference?",
      "How did the expert handle the distinction between a source being interesting and a source being credible?",
      "What search strategies or verification steps could you apply to your own research process?",
    ],
  },
  LF: {
    week: 2, title: "Logical Fallacies",
    watchFor: [
      "How the skilled thinker identifies fallacies by mechanism, not just label",
      "When the identification is delivered constructively (targeting reasoning, not the person)",
      "How the thinker helps reconstruct the argument after identifying the flaw",
      "Whether System 1/System 2 awareness is connected to the fallacy",
      "How the thinker maintains the relationship while challenging the logic",
    ],
    reflectionPrompts: [
      "Which fallacies were identified? For each, explain the mechanism (why it fails logically, not just the label).",
      "How did the skilled thinker deliver the identification without damaging the relationship?",
      "Was there a moment where the person making the argument began to see the fallacy themselves? What enabled that?",
      "How would you apply these identification and reconstruction skills in your own professional context?",
    ],
  },
  CT: {
    week: 3, title: "Critical Thinking",
    watchFor: [
      "How the thinker applies Elements of Thought to examine reasoning structure",
      "When Intellectual Standards are used to evaluate quality (not just identify components)",
      "How hidden assumptions are surfaced through questioning",
      "When the thinker introduces alternative perspectives without imposing them",
      "Whether the Socratic approach leads to genuine self-correction",
    ],
    reflectionPrompts: [
      "Which Elements of Thought did the coach apply? How did each one reveal something about the reasoning?",
      "Which Intellectual Standards were used to evaluate the reasoning? What did each reveal?",
      "Was there a moment where a hidden assumption was surfaced? How did the person react?",
      "How would you use the Socratic approach demonstrated here in your own leadership practice?",
    ],
  },
};

const OBS = {
  "SR-A": {
    weekKey: "SR", id: "SR-A", subtitle: "The Source Hierarchy",
    leader: { name: "Dr. Castillo", role: "Research Director" },
    other: { name: "Ava", role: "Program Coordinator" },
    situation: "Ava has gathered 8 sources from Google for a leadership proposal. Dr. Castillo walks her through evaluating each source using a systematic framework: peer review status, author credentials, publisher type, and citation count. The hierarchy becomes visible.",
    keyMoments: [
      "Dr. Castillo asks Ava to describe how she chose each source (reveals no systematic criteria)",
      "They evaluate the Forbes op-ed vs. the journal article side by side; the difference becomes concrete",
      "Dr. Castillo introduces the concept of peer review and Ava realizes most of her sources lack it",
      "Ava independently evaluates the fifth source using the new criteria (skill transfer in real time)",
      "Dr. Castillo connects source quality to proposal credibility: 'Your VP will ask where this came from'",
    ],
    perspectiveShift: "You are Ava. You were proud of your research. When Dr. Castillo asks how you chose sources, feel the first flicker of doubt. When the Forbes article falls apart next to the journal article, feel the hierarchy click into place. By the fifth source, notice that you are evaluating before she asks you to.",
    genPrompt: `Generate a 20-24 turn conversation between Dr. Castillo (research director) and Ava (program coordinator with 8 Google-sourced references).

SCENARIO: Ava is building a leadership proposal. Her sources: 2 blog posts, 1 Forbes op-ed, 1 TED talk summary site, 1 HBR article, 1 peer-reviewed journal article, 1 Wikipedia page, 1 consulting infographic. She thinks this is solid research.

ARC: Ava presents sources proudly → Dr. Castillo asks selection criteria (none) → side-by-side evaluation of Forbes vs. journal → peer review concept introduced → Ava evaluates one independently → connection to proposal credibility.

DEMONSTRATE: source evaluation framework, peer review explanation, author credential checking, evidence hierarchy, teaching vs. telling. Dr. Castillo is warm but rigorous.

Mark [KEY MOMENT] at 5 turns. Format: DR. CASTILLO: text or AVA: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Ava's internal experience at 3 moments.`,
  },
  "SR-B": {
    weekKey: "SR", id: "SR-B", subtitle: "The Database Detective",
    leader: { name: "Hana", role: "Research Librarian" },
    other: { name: "Eliot", role: "Graduate Student" },
    situation: "Eliot has 47 open tabs and a research question so broad it returns 12,000 results. Hana guides him through narrowing the question, selecting databases, using Boolean operators, and developing inclusion/exclusion criteria. By the end, 47 tabs become 7 core sources.",
    keyMoments: [
      "Hana asks Eliot to state his research question; it is impossibly broad",
      "Hana demonstrates the difference between Google and EBSCO/SAGE results for the same query",
      "Eliot tries his first Boolean search and the results narrow dramatically",
      "Hana introduces inclusion/exclusion criteria; Eliot starts closing tabs independently",
      "Eliot rewrites his research question in a form that is actually answerable",
    ],
    perspectiveShift: "You are Eliot. You are drowning in tabs. When Hana shows you Boolean logic and the results narrow from 12,000 to 340, feel the relief. When you start closing tabs yourself using the criteria she taught you, notice the shift from collecting to curating.",
    genPrompt: `Generate a 20-24 turn conversation between Hana (research librarian) and Eliot (grad student with 47 open tabs, impossibly broad research question).

SCENARIO: Eliot's question: "How does leadership affect organizational change?" Two weeks searching, 47 tabs, mix of Google Scholar, random PDFs, news articles. He does not know Boolean operators or database selection.

ARC: Chaos presented → Hana asks research question → narrows it together → database vs. Google demo → Boolean search → inclusion/exclusion criteria → Eliot closes tabs independently → rewritten question.

DEMONSTRATE: search strategy development, Boolean logic, database selection, inclusion/exclusion criteria, iterative refinement. Hana is patient and methodical.

Mark [KEY MOMENT] at 5 turns. Format: HANA: text or ELIOT: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Eliot's internal experience.`,
  },
  "SR-C": {
    weekKey: "SR", id: "SR-C", subtitle: "The AI Verification",
    leader: { name: "Professor Yun", role: "Faculty Advisor" },
    other: { name: "Malik", role: "MBA Student" },
    situation: "Malik used AI to generate references for a research brief. Three of five citations are hallucinated. Professor Yun walks Malik through discovering this himself by verifying each citation, then helps him build a verification workflow he can use going forward.",
    keyMoments: [
      "Malik presents his AI-generated references confidently",
      "Professor Yun suggests they verify the first citation together; it checks out (building false confidence)",
      "The second citation fails verification; Malik is surprised",
      "The third also fails; Malik realizes the pattern: AI fabricates plausible-looking citations",
      "Together they build a three-step verification checklist Malik can use every time",
    ],
    perspectiveShift: "You are Malik. You saved hours using AI and felt smart about it. When the first citation checks out, you feel validated. When the second fails, feel the ground shift. When the third fails too, feel the realization: the AI was not researching, it was generating. The efficiency you thought you gained was actually a liability.",
    genPrompt: `Generate a 20-24 turn conversation between Professor Yun (faculty advisor, pragmatic about AI) and Malik (MBA student who used ChatGPT to generate 5 citations).

SCENARIO: Malik's 5 references: (1) Greenleaf 1977 [real], (2) van Dierendonck 2011 [real, wrong pages], (3) fabricated AMJ article, (4) fabricated GOM article, (5) real authors but wrong title/year. Malik has not verified any.

ARC: Malik presents confidently → verify first (real, builds confidence) → verify second (pages wrong) → verify third (does not exist, shock) → verify fourth (also fake) → pattern recognition → build verification workflow together.

DEMONSTRATE: verification process (DOI lookup, database search, author check), AI literacy (why AI fabricates), building a replicable verification workflow. Professor Yun is NOT anti-AI; she is pro-verification.

Mark [KEY MOMENT] at 5 turns. Format: PROFESSOR YUN: text or MALIK: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Malik's internal experience.`,
  },
  "LF-A": {
    weekKey: "LF", id: "LF-A", subtitle: "The Budget Battle",
    leader: { name: "Sylvie", role: "CFO" },
    other: { name: "Leon", role: "VP of Marketing" },
    situation: "Leon passionately presents a budget increase request built on four logical fallacies: appeal to authority, false dichotomy, bandwagon, and slippery slope. Sylvie identifies each one constructively, helping Leon see the gaps while preserving the relationship and the underlying merit of his request.",
    keyMoments: [
      "Leon delivers his pitch with conviction; Sylvie listens fully before responding",
      "Sylvie identifies the appeal to authority: 'What your former CMO believed is not evidence for our company'",
      "Sylvie names the false dichotomy: 'Are those really the only two options?'",
      "Leon begins to see the pattern; Sylvie helps him rebuild one argument with actual data",
      "Leon realizes his argument was persuasive but not sound, and that sound arguments are more persuasive",
    ],
    perspectiveShift: "You are Leon. Your argument feels airtight because it feels convincing. When Sylvie asks for evidence and you realize you have none, feel the gap between rhetoric and reasoning. When she helps you rebuild one point with data, notice that the data-backed version is actually more compelling than the original.",
    genPrompt: `Generate a 20-24 turn conversation between Sylvie (CFO, sharp but fair) and Leon (VP of Marketing presenting a budget increase built on fallacies).

SCENARIO: Leon's four arguments: (1) "Our CMO at my last company always said 15% of revenue on brand" [appeal to authority], (2) "Either we invest now or lose market share permanently" [false dichotomy], (3) "Every competitor increased brand spend" [bandwagon], (4) "Without this, morale drops, people leave, clients follow" [slippery slope]. His request may have merit; the reasoning does not.

ARC: Leon presents with energy → Sylvie listens fully → identifies authority appeal → names false dichotomy → Leon starts seeing pattern → Sylvie helps rebuild one argument with evidence → Leon sees sound reasoning is more persuasive.

DEMONSTRATE: fallacy identification by mechanism (not just label), constructive delivery, argument reconstruction, maintaining relationship while challenging logic. Sylvie respects Leon; she is improving his argument, not attacking it.

Mark [KEY MOMENT] at 5 turns. Format: SYLVIE: text or LEON: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Leon's internal experience.`,
  },
  "LF-B": {
    weekKey: "LF", id: "LF-B", subtitle: "The Policy Pitch",
    leader: { name: "Tamara", role: "VP of Strategy" },
    other: { name: "Craig", role: "Director of Operations" },
    situation: "Craig proposes a mandatory overtime policy using circular reasoning, appeal to tradition, tu quoque, and red herring. Tamara uses Socratic questioning to help Craig discover each flaw rather than pointing them out, so he develops metacognitive awareness.",
    keyMoments: [
      "Craig presents confidently; Tamara asks 'What is the evidence that this specific policy improves output?'",
      "Craig's circular reasoning surfaces: 'We need overtime because we are behind, and we are behind because we need overtime'",
      "When challenged, Craig deflects: 'Well, our competitors do it too' (tu quoque). Tamara names the redirect.",
      "Tamara asks Craig to steelman the opposing position; he struggles and then sees the weakness in his own",
      "Craig reconstructs the argument with actual productivity data and the proposal improves",
    ],
    perspectiveShift: "You are Craig. You have been making this argument for months and it always worked. When Tamara asks for the evidence loop and you hear yourself say the same thing twice, feel the circularity click. When she asks you to argue the other side, feel how hard it is and what that difficulty reveals.",
    genPrompt: `Generate a 20-24 turn conversation between Tamara (VP of Strategy, Socratic approach) and Craig (Director of Operations proposing mandatory overtime).

SCENARIO: Craig's arguments: (1) "We need overtime because we are behind schedule" but his evidence for being behind is... needing overtime [circular], (2) "We have always done mandatory overtime during crunch" [appeal to tradition], (3) When challenged on outcomes: "Well, engineering does it too" [tu quoque], (4) When asked about burnout data: "The real issue is client commitments" [red herring].

ARC: Craig presents → Tamara asks for evidence loop → circular reasoning surfaces → tradition cited → Tamara names the redirect → asks Craig to steelman the opposition → Craig struggles, sees weakness → reconstructs with data.

DEMONSTRATE: Socratic questioning (not telling), fallacy identification through guided discovery, steelmanning exercise, constructive reconstruction. Tamara never says "you are wrong"; she asks questions that make Craig see it.

Mark [KEY MOMENT] at 5 turns. Format: TAMARA: text or CRAIG: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Craig's internal experience.`,
  },
  "LF-C": {
    weekKey: "LF", id: "LF-C", subtitle: "The Vendor Pitch",
    leader: { name: "Renata", role: "Procurement Lead" },
    other: { name: "Kai", role: "Sales Representative" },
    situation: "Kai is a skilled vendor making a polished sales pitch that blurs the line between persuasion and manipulation: appeal to authority (Fortune 500 clients), false urgency (limited-time pricing), false dichotomy (buy now or fall behind), and cherry-picked statistics. Renata identifies each technique calmly and demands the real data.",
    keyMoments: [
      "Kai opens with the Fortune 500 client list; Renata asks for results data, not logos",
      "Kai creates urgency ('pricing expires Friday'); Renata names it as a pressure tactic",
      "Kai presents cherry-picked statistics; Renata asks for the full dataset",
      "Renata distinguishes between 'this is a good product' and 'this argument is designed to prevent me from thinking'",
      "Kai, pushed to substance, actually makes a stronger honest case than the manipulative one",
    ],
    perspectiveShift: "You are Kai. Your pitch usually closes deals. When Renata asks for data behind the logos, feel the unfamiliar pushback. When she names your urgency tactic, feel the deflation. But notice: when you are forced to make the honest case, it is actually stronger. The manipulation was a crutch, not a strategy.",
    genPrompt: `Generate a 20-24 turn conversation between Renata (procurement lead, analytically rigorous) and Kai (sales representative with a polished but fallacy-laden pitch).

SCENARIO: Kai is selling an enterprise software platform. Pitch includes: (1) "Used by 12 Fortune 500 companies" [appeal to authority/bandwagon], (2) "This pricing is only available through Friday" [false urgency], (3) "You can either modernize now or watch competitors pass you" [false dichotomy], (4) "Our clients see 40% efficiency gains" [cherry-picked; full data shows 12-40% range]. The product may be good; the pitch is manipulative.

ARC: Polished pitch → Renata asks for results behind logos → names urgency tactic → requests full dataset → distinguishes good product from manipulative argument → Kai makes honest case → honest case is stronger.

DEMONSTRATE: identifying persuasion techniques in real time, demanding evidence behind claims, distinguishing product quality from argument quality, firm but professional pushback. Renata is not hostile; she is rigorous.

Mark [KEY MOMENT] at 5 turns. Format: RENATA: text or KAI: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Kai's internal experience.`,
  },
  "CT-A": {
    weekKey: "CT", id: "CT-A", subtitle: "The Strategic Pivot",
    leader: { name: "Simone", role: "Executive Coach" },
    other: { name: "Bennett", role: "CEO" },
    situation: "Bennett is about to present a major strategic pivot to the board. Simone uses the Elements of Thought to help Bennett examine his own reasoning: What is the purpose? What question are you actually answering? What are you assuming? What evidence supports this? What are the implications you have not considered?",
    keyMoments: [
      "Simone asks Bennett to state the purpose of the pivot in one sentence; he cannot do it concisely",
      "Simone asks what question the pivot answers; Bennett realizes he is answering the wrong question",
      "Bennett lists his assumptions; Simone asks which ones he has verified",
      "Simone applies Intellectual Standards: 'Is this analysis sufficient? What perspectives are missing?'",
      "Bennett revises his framing; the pivot rationale becomes significantly stronger",
    ],
    perspectiveShift: "You are Bennett. You are the CEO and you are used to people accepting your reasoning. When Simone asks you to state the purpose in one sentence and you cannot, feel the humbling realization that you have not actually clarified your own thinking. When your assumptions are listed and most are unverified, notice the distance between confidence and rigor.",
    genPrompt: `Generate a 20-24 turn conversation between Simone (executive coach, Paul-Elder framework) and Bennett (CEO preparing a strategic pivot for the board).

SCENARIO: Bennett is pivoting from B2B to B2B+B2C. He has market data and competitive analysis. His reasoning is confident but has not been examined through the Elements of Thought. His assumptions are unverified, his question is poorly framed, and he has not considered two critical implications.

ARC: Bennett presents confidently → Simone asks for purpose (vague) → asks what question he is answering (wrong question) → lists assumptions (mostly unverified) → applies Intellectual Standards → Bennett revises framing → reasoning strengthens.

DEMONSTRATE: All 8 Elements of Thought applied naturally, Intellectual Standards (clarity, accuracy, precision, relevance, depth, breadth, logic, significance, fairness), Socratic questioning. Simone never tells Bennett what to think.

Mark [KEY MOMENT] at 5 turns. Format: SIMONE: text or BENNETT: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Bennett's internal experience.`,
  },
  "CT-B": {
    weekKey: "CT", id: "CT-B", subtitle: "The Policy Autopsy",
    leader: { name: "Vera", role: "Division Director" },
    other: { name: "Isaiah", role: "Senior Analyst" },
    situation: "A major initiative failed and leadership wants to know why. Vera and Isaiah conduct a reasoning autopsy using the Elements of Thought: what was the original purpose, what question was being answered, what assumptions drove the plan, what evidence was ignored, and what implications were overlooked.",
    keyMoments: [
      "Vera asks Isaiah to reconstruct the original reasoning (not just the timeline of events)",
      "They discover the initiative answered a political question ('How do we look proactive?') rather than an operational one",
      "Isaiah surfaces an assumption everyone held but no one stated: 'We assumed the market would wait for us'",
      "Vera applies the Standard of Breadth: 'Whose perspective was never in the room?'",
      "Together they build a 'reasoning checklist' for future initiatives",
    ],
    perspectiveShift: "You are Isaiah. Autopsies usually blame people. When Vera focuses on reasoning rather than responsibility, feel the different quality of the conversation. When the unstated assumption surfaces, feel the collective blind spot become visible for the first time.",
    genPrompt: `Generate a 20-24 turn conversation between Vera (division director) and Isaiah (senior analyst) conducting a post-mortem on a failed initiative.

SCENARIO: A digital transformation initiative consumed 18 months and significant budget before being shelved. Leadership blames execution. Vera suspects the failure was in reasoning, not execution. She and Isaiah examine the original proposal using Elements of Thought.

ARC: Standard post-mortem framing → Vera redirects to reasoning → reconstruct original purpose (was actually political) → surface unstated assumptions → examine ignored evidence → apply Breadth standard → build prevention checklist.

DEMONSTRATE: Elements of Thought as analytical forensics, Intellectual Standards applied to past reasoning, assumption surfacing, perspective analysis. This is collaborative analysis, not blame.

Mark [KEY MOMENT] at 5 turns. Format: VERA: text or ISAIAH: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Isaiah's internal experience.`,
  },
  "CT-C": {
    weekKey: "CT", id: "CT-C", subtitle: "The Assumption Iceberg",
    leader: { name: "Lyle", role: "Strategy Consultant" },
    other: { name: "Rosario", role: "VP of Expansion" },
    situation: "Rosario has a data-driven expansion plan that looks rigorous. Lyle uses the Elements of Thought to surface three hidden assumptions beneath the data. The numbers are accurate, but the frame they sit in is unexamined. Lyle demonstrates that accuracy is not sufficiency.",
    keyMoments: [
      "Rosario presents impressive data; Lyle acknowledges the rigor, then asks 'What would have to be true for this plan to work?'",
      "Rosario lists conditions she has not recognized as assumptions",
      "Lyle applies the Standard of Sufficiency: 'Is accurate data enough if the frame is unexamined?'",
      "Rosario discovers that her strongest data point rests on an unverified cultural assumption",
      "Lyle helps Rosario add an assumption-testing phase before the board presentation",
    ],
    perspectiveShift: "You are Rosario. Your data is impeccable and you are proud of it. When Lyle asks what has to be true, feel the strange experience of listing things you believed without knowing you believed them. When you realize your best data point rests on an untested assumption, feel the unsettling gap between accuracy and completeness.",
    genPrompt: `Generate a 20-24 turn conversation between Lyle (strategy consultant) and Rosario (VP of Expansion with a data-driven SE Asia expansion plan).

SCENARIO: Rosario's plan has excellent market sizing, competitive analysis, and financial projections. Hidden assumptions: (1) US product-market fit transfers to SE Asia, (2) local team can be hired in 90 days, (3) regulatory timeline mirrors Europe. She has not tested any of these because the data feels sufficient.

ARC: Impressive data presented → Lyle acknowledges rigor → asks "What would have to be true?" → Rosario lists conditions (does not realize they are assumptions) → Lyle applies Sufficiency standard → cultural assumption surfaces → Rosario adds testing phase.

DEMONSTRATE: assumption surfacing through questioning, distinction between accuracy and sufficiency, Elements of Thought (assumptions, implications, point of view), Intellectual Standards applied to a seemingly rigorous plan.

Mark [KEY MOMENT] at 5 turns. Format: LYLE: text or ROSARIO: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Rosario's internal experience.`,
  },
};

function parseConversation(raw) {
  const parts = raw.split("[PERSPECTIVE SHIFT]");
  const convText = parts[0].trim();
  const perspText = parts[1] ? parts[1].trim() : "";
  const lines = convText.split("\n").filter(l => l.trim());
  const turns = [];
  for (const line of lines) {
    const isKey = line.includes("[KEY MOMENT]");
    const clean = line.replace("[KEY MOMENT]", "").trim();
    const colonIdx = clean.indexOf(":");
    if (colonIdx > 0 && colonIdx < 30) {
      const speaker = clean.slice(0, colonIdx).trim();
      const text = clean.slice(colonIdx + 1).trim();
      if (speaker && text && !/^\d+$/.test(speaker)) turns.push({ speaker, text, isKey });
    }
  }
  return { turns, perspective: perspText };
}

function Header({ obs, weekMeta }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, padding: "14px 24px", color: C.white }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.6, marginBottom: 2 }}>OBLD 500 OBSERVATION MODULE</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{weekMeta ? `${weekMeta.title}: ${obs.subtitle}` : "Analytical Observation Suite"}</div>
        </div>
        {weekMeta && <div style={{ textAlign: "right", fontSize: 11, opacity: 0.6 }}><div>Week {weekMeta.week}</div><div>Phase 3</div></div>}
      </div>
    </div>
  );
}

function Selector({ onSelect, onHome }) {
  const order = ["SR", "LF", "CT"];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ marginBottom: 8 }}><button onClick={onHome} style={{ background: "none", border: "none", color: "#1a3d5c", fontSize: 13, cursor: "pointer", padding: 0 }}>&larr; Back to OBLD 500</button></div>
<div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Select an observation</div>
        <div style={{ fontSize: 13, color: C.textSec, maxWidth: 480, margin: "0 auto" }}>Watch a demonstration of analytical skills in action. Identify key moments, then reflect.</div>
      </div>
      {order.map(wk => {
        const w = WEEK_META[wk];
        const scens = Object.values(OBS).filter(o => o.weekKey === wk);
        return (
          <div key={wk} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.midGray, letterSpacing: 1, marginBottom: 8 }}>WEEK {w.week}: {w.title.toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {scens.map(sc => (
                <button key={sc.id} onClick={() => onSelect(sc.id)} style={{ background: C.white, border: `1px solid ${C.lightGray}`, borderRadius: 8, padding: "12px 14px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", borderLeft: `3px solid ${C.teal}` }}
                  onMouseOver={e => e.currentTarget.style.borderLeftColor = C.gold} onMouseOut={e => e.currentTarget.style.borderLeftColor = C.teal}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 2 }}>{sc.subtitle}</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>{sc.leader.name} + {sc.other.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Briefing({ obs, weekMeta, onGenerate, onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.navyMid, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 10 }}>← All observations</button>
      <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.lightGray}`, overflow: "hidden" }}>
        <div style={{ background: C.tealBg, borderBottom: `2px solid ${C.teal}`, padding: "14px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.teal, letterSpacing: 1, marginBottom: 2 }}>OBSERVATION BRIEFING</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>{obs.subtitle}</div>
        </div>
        <div style={{ padding: "18px 20px", fontSize: 14, lineHeight: 1.7, color: C.text }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, background: C.blueBg, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.blue, marginBottom: 2 }}>{obs.leader.role.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{obs.leader.name}</div>
            </div>
            <div style={{ flex: 1, background: C.offWhite, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.midGray, marginBottom: 2 }}>{obs.other.role.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{obs.other.name}</div>
            </div>
          </div>
          <p style={{ margin: "0 0 14px" }}>{obs.situation}</p>
          <div style={{ background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "12px 16px", margin: "14px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.gold, marginBottom: 6 }}>WATCH FOR</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.7 }}>
              {weekMeta.watchFor.map((w, i) => <li key={i} style={{ marginBottom: 3 }}>{w}</li>)}
            </ul>
          </div>
          <button onClick={onGenerate} style={{ display: "block", width: "100%", marginTop: 16, padding: "12px", fontSize: 15, fontWeight: 600, color: C.white, background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, border: "none", borderRadius: 8, cursor: "pointer" }}>Generate observation</button>
        </div>
      </div>
    </div>
  );
}

function ConvoView({ obs, weekMeta, turns, perspective, onReflect, onRegen, onBack }) {
  const [revealed, setRevealed] = useState(3);
  const [showPersp, setShowPersp] = useState(false);
  const btmRef = useRef(null);
  useEffect(() => { if (revealed < turns.length) { const t = setTimeout(() => setRevealed(r => r + 1), 100); return () => clearTimeout(t); } }, [revealed, turns.length]);
  useEffect(() => { btmRef.current?.scrollIntoView({ behavior: "smooth" }); }, [revealed, showPersp]);
  const allDone = revealed >= turns.length;
  const leaderUpper = obs.leader.name.toUpperCase();

  return (
    <div style={{ maxWidth: 750, margin: "0 auto", padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.navyMid, fontSize: 13, cursor: "pointer", padding: 0 }}>← Back</button>
        <div style={{ fontSize: 12, color: C.midGray }}>
          {allDone ? `${turns.length} turns` : `Turn ${revealed} of ${turns.length}`}
          {!allDone && <button onClick={() => setRevealed(turns.length)} style={{ marginLeft: 8, background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Show all</button>}
        </div>
      </div>
      {turns.slice(0, revealed).map((t, i) => {
        const isLeader = t.speaker.toUpperCase().includes(leaderUpper.split(" ").pop());
        return (
          <div key={i} style={{ marginBottom: 8, padding: t.isKey ? "10px 14px" : "8px 14px", borderRadius: 10, background: t.isKey ? C.goldBg : (isLeader ? C.white : C.offWhite), border: t.isKey ? `2px solid ${C.gold}` : `1px solid ${C.lightGray}`, borderLeft: t.isKey ? `4px solid ${C.gold}` : (isLeader ? `3px solid ${C.teal}` : `3px solid ${C.midGray}`) }}>
            {t.isKey && <div style={{ fontSize: 10, fontWeight: 600, color: C.gold, letterSpacing: 0.5, marginBottom: 2 }}>KEY MOMENT</div>}
            <div style={{ fontSize: 11, fontWeight: 600, color: isLeader ? C.teal : C.midGray, marginBottom: 2 }}>{t.speaker}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>{t.text}</div>
          </div>
        );
      })}
      {allDone && !showPersp && (
        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <button onClick={() => setShowPersp(true)} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, color: C.white, background: C.navy, border: "none", borderRadius: 8, cursor: "pointer" }}>View perspective shift</button>
          <button onClick={onRegen} style={{ padding: "12px 16px", fontSize: 13, color: C.navy, background: C.white, border: `1px solid ${C.navy}`, borderRadius: 8, cursor: "pointer" }}>Regenerate</button>
        </div>
      )}
      {showPersp && (
        <>
          <div style={{ marginTop: 24, background: C.tealBg, border: `2px solid ${C.teal}`, borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, letterSpacing: 0.5, marginBottom: 8 }}>PERSPECTIVE SHIFT: {obs.other.name.toUpperCase()}'S INTERNAL EXPERIENCE</div>
            <div style={{ fontSize: 13, color: C.textSec, fontStyle: "italic", marginBottom: 10 }}>{obs.perspectiveShift}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{perspective}</div>
          </div>
          <button onClick={onReflect} style={{ display: "block", width: "100%", marginTop: 16, padding: "12px", fontSize: 14, fontWeight: 600, color: C.white, background: C.navy, border: "none", borderRadius: 8, cursor: "pointer" }}>Continue to reflection</button>
        </>
      )}
      <div ref={btmRef} />
    </div>
  );
}

function ReflectView({ obs, weekMeta, onHome, onRewatch }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 1, marginBottom: 4 }}>OBSERVATION COMPLETE</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.navy }}>Reflection prompts</div>
      </div>
      <div style={{ background: C.goldBg, border: `2px solid ${C.gold}`, borderRadius: 10, padding: "6px 20px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 8, marginTop: 10 }}>INCLUDE IN YOUR ANALYSIS</div>
        {weekMeta.reflectionPrompts.map((p, i) => (
          <div key={i} style={{ fontSize: 14, lineHeight: 1.7, color: C.text, padding: "8px 0", borderTop: i > 0 ? `1px solid ${C.gold}40` : "none" }}><strong>{i + 1}.</strong> {p}</div>
        ))}
      </div>
      <div style={{ background: C.blueBg, border: "1px solid #bbdefb", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 4 }}>KEY MOMENTS TO REFERENCE</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.7 }}>
          {obs.keyMoments.map((m, i) => <li key={i} style={{ marginBottom: 4 }}>{m}</li>)}
        </ul>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onRewatch} style={{ flex: 1, padding: "11px", fontSize: 13, fontWeight: 600, color: C.navy, background: C.white, border: `2px solid ${C.navy}`, borderRadius: 8, cursor: "pointer" }}>Rewatch</button>
        <button onClick={onHome} style={{ flex: 1, padding: "11px", fontSize: 13, fontWeight: 600, color: C.white, background: C.navy, border: "none", borderRadius: 8, cursor: "pointer" }}>Choose another</button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.navy, marginBottom: 8 }}>Generating the conversation...</div>
      <div style={{ fontSize: 13, color: C.midGray }}>Creating a demonstration with annotated key moments.</div>
      <div style={{ marginTop: 18, height: 4, background: C.lightGray, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.teal}, ${C.navy})`, borderRadius: 2, animation: "ld 2s ease-in-out infinite", width: "40%" }} />
      </div>
      <style>{`@keyframes ld{0%{margin-left:0}50%{margin-left:60%}100%{margin-left:0}}`}</style>
    </div>
  );
}

function Err({ error, onRetry }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: C.dangerBg, border: "1px solid #ef9a9a", borderRadius: 8, padding: "16px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.danger, marginBottom: 4 }}>Something went wrong</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{error}</div>
        <button onClick={onRetry} style={{ padding: "6px 16px", fontSize: 13, color: C.white, background: C.danger, border: "none", borderRadius: 6, cursor: "pointer" }}>Try again</button>
      </div>
    </div>
  );
}

export default function AnalyticalObsSuite({ onHome }) {
  const [phase, setPhase] = useState("select");
  const [obsId, setObsId] = useState(null);
  const [turns, setTurns] = useState([]);
  const [persp, setPersp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const obs = obsId ? OBS[obsId] : null;
  const weekMeta = obs ? WEEK_META[obs.weekKey] : null;

  const api = useCallback(async (msgs, sys, tok = 4096) => {
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: tok, system: sys, messages: msgs }) });
    if (!r.ok) throw new Error(`API error (${r.status}): ${await r.text()}`);
    const d = await r.json();
    return d.content.map(c => c.text || "").join("\n").trim();
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true); setPhase("generating");
    try {
      const result = await api([{ role: "user", content: obs.genPrompt }], "You are an expert scriptwriter for leadership and analytical skills training. Generate realistic conversations. Follow instructions exactly. No commentary. 1-3 sentences per turn.");
      const parsed = parseConversation(result);
      if (parsed.turns.length < 8) throw new Error("Conversation too short. Please try again.");
      setTurns(parsed.turns); setPersp(parsed.perspective); setPhase("conversation");
    } catch (e) { setError(e.message); setPhase("error"); }
    finally { setIsLoading(false); }
  }, [api, obs]);

  const select = id => { setObsId(id); setPhase("briefing"); };
  const home = () => { setObsId(null); setTurns([]); setPersp(""); setError(null); setPhase("select"); };

  return (
    <div style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", background: C.offWhite, minHeight: "100vh" }}>
      <Header obs={obs} weekMeta={weekMeta} />
      {phase === "select" && <Selector onSelect={select} onHome={onHome} />}
      {phase === "briefing" && <Briefing obs={obs} weekMeta={weekMeta} onGenerate={generate} onBack={home} />}
      {phase === "generating" && <Loading />}
      {phase === "conversation" && <ConvoView obs={obs} weekMeta={weekMeta} turns={turns} perspective={persp} onReflect={() => setPhase("reflection")} onRegen={generate} onBack={() => setPhase("briefing")} />}
      {phase === "reflection" && <ReflectView obs={obs} weekMeta={weekMeta} onHome={home} onRewatch={() => setPhase("conversation")} />}
      {phase === "error" && <Err error={error} onRetry={() => setPhase("briefing")} />}
    </div>
  );
}
