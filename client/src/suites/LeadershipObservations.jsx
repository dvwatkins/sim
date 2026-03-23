import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  navy: "#0a1628", navyLight: "#132843", navyMid: "#1a3d5c",
  gold: "#c5a55a", goldBg: "#fdf8e8",
  white: "#fff", offWhite: "#f8f9fa", lightGray: "#e8eef4",
  midGray: "#6c757d", text: "#1a1a1a", textSec: "#555",
  success: "#2e7d32", successBg: "#e8f5e9",
  warning: "#f57c00", warningBg: "#fff3e0",
  blue: "#1565c0", blueBg: "#e3f2fd",
  teal: "#00796b", tealBg: "#e0f2f1",
};

// ============================================================
// WEEK METADATA (shared watch-for and reflection per week)
// ============================================================
const WEEK_META = {
  AL: {
    week: 4, title: "Active Listening",
    reflectionPrompts: [
      "Which of the five active listening components did the leader demonstrate most effectively? What specific behaviors did you observe?",
      "Was there a moment where the leader's listening shifted the emotional tone of the conversation? What happened?",
      "What would have changed if the leader had jumped to solutions prematurely?",
      "If you were the leader, what would you have done differently? What would you keep the same?",
    ],
    watchFor: [
      "How the leader creates safety through presence and engagement (attending)",
      "When the leader restates the other person's concerns in their own words (paraphrasing)",
      "The moment the leader names an emotion not explicitly stated (reflecting)",
      "How open-ended questions deepen understanding (clarifying)",
      "Whether the leader resists jumping to solutions before the other person feels heard",
    ],
  },
  EM: {
    week: 5, title: "Empathy",
    reflectionPrompts: [
      "Which specific empathetic behaviors did the leader demonstrate? What did you observe in their words and responses?",
      "How did the leader distinguish between empathy and sympathy?",
      "What would have happened if the leader had accepted the initial deflection or minimized the situation?",
      "What would you have done differently? What would you keep the same?",
    ],
    watchFor: [
      "How the leader responds to initial minimizing or deflection",
      "When the leader names what they observe without projecting their own interpretation",
      "The moment genuine perspective-taking changes the emotional dynamic",
      "How the leader resists the urge to immediately offer solutions",
      "Whether the leader asks what support would be most helpful rather than prescribing it",
    ],
  },
  LC: {
    week: 6, title: "Leadership Coaching",
    reflectionPrompts: [
      "How did the coaching leader move through the GROW stages? Were the transitions natural?",
      "What happened when the coachee asked for advice? How did the leader handle it?",
      "At what point did the coachee shift from ambivalence to clarity? What enabled the shift?",
      "If you were coaching this person, what powerful question would you have asked?",
    ],
    watchFor: [
      "How the leader establishes the session goal (G) rather than accepting the presenting problem",
      "How reality exploration (R) addresses both facts and feelings",
      "When the coachee asks for advice and the leader redirects to a question",
      "How options (O) emerge from the coachee's own thinking",
      "Whether the commitment (W) is specific, owned by the coachee, and includes accountability",
    ],
  },
  MN: {
    week: 7, title: "Mentoring",
    reflectionPrompts: [
      "Which of Kram's mentoring functions did the mentor demonstrate? Identify at least three.",
      "How did the mentor balance career functions with psychosocial functions?",
      "At what moment did the conversation shift? What did the mentor do?",
      "How did the mentor reflect developmental network awareness?",
    ],
    watchFor: [
      "How the mentor opens with empathy before career guidance",
      "When the mentor provides honest feedback while validating feelings",
      "How the mentor normalizes difficult emotions without dismissing them",
      "When the mentor suggests expanding developmental relationships",
      "Whether the mentee arrives at their own commitment",
    ],
  },
  CS: {
    week: 8, title: "Coaching Supervision",
    reflectionPrompts: [
      "Which modes of the Seven-Eyed Model did the supervisor use? When did they shift?",
      "What did the parallel process look like? Map the layers.",
      "What would have happened if the supervisor had answered the opening question directly?",
      "What would you have done differently as the supervisor?",
    ],
    watchFor: [
      "How the supervisor starts with the client's world but does not stay there",
      "When the supervisor shifts to the coaching relationship and the supervisee's own experience",
      "The moment the supervisor identifies the parallel process",
      "How the supervisor balances support with challenge",
      "Whether the supervisor develops self-awareness rather than solving the case",
    ],
  },
  SL: {
    week: 9, title: "Storytelling",
    reflectionPrompts: [
      "How did the coach help the other person move from data or facts to narrative?",
      "At what moment did the conversation shift from resistance to insight?",
      "How does the story that emerged illustrate narrative identity work?",
      "If you were coaching someone in a similar situation, how would you help them find their story?",
    ],
    watchFor: [
      "How the coach identifies the gap between information and narrative",
      "When the coach asks a question that connects professional to personal",
      "The moment the personal story emerges and connects to the challenge",
      "How the coach helps structure the story without writing it",
      "Whether the final narrative belongs to the person or the coach",
    ],
  },
};

// ============================================================
// 18 OBSERVATION SCENARIOS
// ============================================================
const OBS = {
  "AL-A": {
    weekKey: "AL", id: "AL-A", subtitle: "The Performance Check-In",
    leader: { name: "Mira", role: "Team Lead" },
    other: { name: "Alex", role: "Team Member" },
    situation: "Mira conducts a one-on-one with Alex, whose performance has dipped due to a parent's health emergency that Alex has not shared. Mira uses all five listening components to create safety.",
    keyMoments: [
      "Mira notices the gap between Alex's words ('I am fine') and body language",
      "Mira paraphrases Alex's concerns, making Alex feel understood for the first time",
      "Alex reveals the personal stressor; Mira holds space without solving",
      "Mira summarizes and asks 'Did I get that right?'",
      "Alex, feeling heard, generates their own next steps",
    ],
    perspectiveShift: "You are Alex. When Mira paraphrases accurately, feel the relief of being understood. When she names your emotion, notice the vulnerability and then the trust. When she does NOT jump to solutions, feel the space open for you to think.",
    genPrompt: `Generate a realistic 20-24 turn workplace conversation between Mira (team lead) and Alex (underperforming team member hiding a parent's health emergency).

ARC: Alex deflects → Mira notices word-body gap → Alex opens up → Mira reflects emotion → Alex reveals crisis → Mira holds space → Alex generates own next steps.

DEMONSTRATE (naturally, don't label): attending, paraphrasing, reflecting emotion, clarifying questions, summarizing, resisting premature solutions.

Mark [KEY MOMENT] at 5 critical turns. Format: MIRA: text or ALEX: text. 1-3 sentences per turn. After conversation, add [PERSPECTIVE SHIFT] with Alex's internal experience at 3 moments.`,
  },
  "AL-B": {
    weekKey: "AL", id: "AL-B", subtitle: "The Exit Interview",
    leader: { name: "Yuki", role: "HR Director" },
    other: { name: "Terrence", role: "Departing Manager" },
    situation: "Terrence resigned after 9 years and this is his real exit conversation with Yuki. Most departing employees give polished non-answers. Yuki's listening creates enough trust for Terrence to share what actually drove him out: feeling unseen after years of quiet excellence.",
    keyMoments: [
      "Terrence gives the standard 'great opportunity' answer; Yuki does not accept it",
      "Yuki paraphrases the pattern Terrence describes without making it about retention",
      "Terrence reveals the real reason: passed over for a flashier colleague despite stronger results",
      "Yuki reflects the emotion beneath the professional language: 'It sounds like this was not just disappointing. It was personal.'",
      "Terrence shares what would have made him stay (unprompted, because he finally feels heard)",
    ],
    perspectiveShift: "You are Terrence. You came in prepared to say nothing real. Notice the moment Yuki's listening changes your calculation. When she paraphrases accurately, feel the pull to say more than you planned. When she names the personal hurt, feel the relief of finally being honest after months of performing 'fine.'",
    genPrompt: `Generate a realistic 20-24 turn exit conversation between Yuki (HR Director) and Terrence (departing manager, 9 years at company, resigned).

SCENARIO: Terrence has given standard exit reasons. Yuki is not conducting a checkbox exit interview; she genuinely wants to understand. Terrence was passed over for promotion twice; both times the role went to colleagues with higher visibility but weaker results. He has never said this directly.

ARC: Standard answers → Yuki listens past the script → Terrence tests with a mild truth → Yuki paraphrases without flinching → Terrence shares the real story → Yuki reflects the emotion → Terrence, feeling heard, voluntarily shares what would have made him stay.

DEMONSTRATE: attending (not rushing), paraphrasing (restating without HR-speak), reflecting emotion (naming hurt behind professionalism), clarifying (open questions), summarizing, resisting premature solutions (NOT trying to retain him).

Mark [KEY MOMENT] at 5 turns. Format: YUKI: text or TERRENCE: text. 1-3 sentences. After conversation, add [PERSPECTIVE SHIFT] with Terrence's internal experience.`,
  },
  "AL-C": {
    weekKey: "AL", id: "AL-C", subtitle: "The Client Complaint",
    leader: { name: "Fatima", role: "Account Director" },
    other: { name: "Noah", role: "Senior Account Manager" },
    situation: "Noah just received devastating client feedback and is deflecting blame to the client, the timeline, and the team. Fatima must listen through the blame to hear the fear underneath: Noah is terrified he is about to lose the biggest account of his career.",
    keyMoments: [
      "Noah opens with blame and rapid-fire excuses; Fatima does not interrupt",
      "Fatima paraphrases the situation without accepting or rejecting the blame frame",
      "Noah's energy shifts from anger to anxiety; Fatima names it",
      "Fatima asks what Noah is most worried about (not what went wrong)",
      "Noah admits the fear: 'I think I am going to lose this account and I do not know how to fix it'",
    ],
    perspectiveShift: "You are Noah. You came in ready to defend yourself. When Fatima does not argue or agree but simply restates what you said, notice how disarming that is. When she names your anxiety instead of your anger, feel the armor crack. When she asks what you are afraid of, feel the relief of finally saying it out loud.",
    genPrompt: `Generate a realistic 20-24 turn workplace conversation between Fatima (account director) and Noah (senior account manager who received harsh client feedback).

SCENARIO: Noah's largest client sent a formal complaint about missed deliverables and communication gaps. Noah is deflecting blame to the client's changing requirements, the compressed timeline, and an underperforming team member. Underneath: Noah is terrified he will lose the account and his reputation.

ARC: Blame and excuses → Fatima listens without arguing → paraphrases neutrally → Noah shifts from anger to anxiety → Fatima names the fear → Noah admits what is really at stake → Fatima helps Noah think about what to do next (without prescribing).

DEMONSTRATE: attending (patience through the blame storm), paraphrasing (neutral restating), reflecting emotion (naming anxiety beneath anger), clarifying (shifting from what went wrong to what matters), summarizing, resisting solutions.

Mark [KEY MOMENT] at 5 turns. Format: FATIMA: text or NOAH: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Noah's internal experience.`,
  },
  "EM-A": {
    weekKey: "EM", id: "EM-A", subtitle: "The Personal Crisis",
    leader: { name: "Danielle", role: "Team Lead" },
    other: { name: "Raj", role: "Team Member" },
    situation: "Raj's partner has been diagnosed with a serious illness. He is managing caregiving and work while minimizing everything. Danielle uses perspective-taking, emotional recognition, and supportive responding to help Raj feel genuinely understood.",
    keyMoments: [
      "Raj minimizes: 'I can handle it.' Danielle notices the disconnect",
      "Danielle names what she observes: 'I notice this seems heavier than you are letting on'",
      "Raj opens up about the diagnosis; Danielle sits with it, no rush to fix",
      "Danielle asks what support would be most helpful rather than prescribing",
      "Raj, feeling understood rather than managed, names what he actually needs",
    ],
    perspectiveShift: "You are Raj. When Danielle does not accept your deflection but does not push too hard, feel the careful balance. When she names what she sees, feel the relief and vulnerability. When she asks what you need rather than telling you, notice the dignity in being trusted to know your own situation.",
    genPrompt: `Generate a realistic 20-24 turn conversation between Danielle (team lead) and Raj (team member whose partner was diagnosed with a serious illness).

ARC: Raj minimizes → Danielle notices the gap → names it gently → Raj reveals diagnosis → Danielle holds space → takes Raj's perspective → asks what he needs → Raj identifies his own support needs.

DEMONSTRATE: perspective-taking, emotional recognition, withholding judgment, supportive responding (not prescribing).

Mark [KEY MOMENT] at 5 turns. Format: DANIELLE: text or RAJ: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Raj's internal experience.`,
  },
  "EM-B": {
    weekKey: "EM", id: "EM-B", subtitle: "The Restructure",
    leader: { name: "Owen", role: "VP of Operations" },
    other: { name: "Celeste", role: "Department Head" },
    situation: "Celeste just learned her entire department is being merged into another division. She built this team from scratch over 5 years. Owen must deliver the news with empathy, recognizing that this is not just an organizational change but a loss of professional identity.",
    keyMoments: [
      "Owen delivers the news directly but with care; watches Celeste absorb it",
      "Celeste's first reaction is professional composure; Owen does not mistake this for acceptance",
      "Owen takes Celeste's perspective: 'You built this team from nothing. This must feel like losing something you created.'",
      "Celeste's composure cracks; she expresses what the team means to her",
      "Owen does not rush to reassurance but asks what Celeste needs to process this",
    ],
    perspectiveShift: "You are Celeste. You are a senior leader and you do not cry at work. When Owen names what this team means to you, feel the threat to your composure. When he does not rush to platitudes like 'it will be fine' or 'you will land on your feet,' feel the rare experience of a leader who understands that organizational change has a human cost.",
    genPrompt: `Generate a realistic 20-24 turn conversation between Owen (VP of Operations) and Celeste (department head whose department is being merged).

SCENARIO: Celeste built her 40-person department from scratch over 5 years. The merger is decided; this conversation is about delivery, not consultation. Owen genuinely empathizes with the loss. Celeste is a composed senior leader who does not show vulnerability easily.

ARC: Owen delivers news with care → Celeste composes herself → Owen does NOT mistake composure for acceptance → Owen takes her perspective → Celeste reveals what the team means to her → Owen holds space for grief → asks what she needs, does not prescribe.

DEMONSTRATE: perspective-taking (imagining what this feels like for Celeste), emotional recognition (seeing through professional composure), withholding judgment, resisting platitudes ("it will be fine"), supportive responding.

Mark [KEY MOMENT] at 5 turns. Format: OWEN: text or CELESTE: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Celeste's internal experience.`,
  },
  "EM-C": {
    weekKey: "EM", id: "EM-C", subtitle: "The Invisible Contributor",
    leader: { name: "Patricia", role: "Division Director" },
    other: { name: "Kwame", role: "Senior Analyst" },
    situation: "Kwame has been the analytical backbone of three major initiatives but has never received public recognition. He finally requested a meeting to address it. Patricia must practice empathy without defensiveness, recognizing that Kwame's invisibility is partly a systemic failure she is responsible for.",
    keyMoments: [
      "Kwame presents the facts carefully: three projects, zero credit, no invitation to present findings",
      "Patricia's instinct is to defend the system; she catches herself and asks to understand more",
      "Kwame reveals the deeper hurt: 'I started to wonder if the work matters or just who presents it'",
      "Patricia takes his perspective without making excuses: 'If I had done that work and watched someone else present it, I would feel invisible'",
      "Kwame, feeling seen, shifts from grievance to forward-looking: 'I do not need an apology. I need it to change.'",
    ],
    perspectiveShift: "You are Kwame. You rehearsed this conversation twenty times. You expected defensiveness. When Patricia catches herself and genuinely asks to understand, feel the surprise. When she says 'I would feel invisible,' feel the weight lift. You did not come here to be comforted; you came to be seen. And for the first time, you are.",
    genPrompt: `Generate a realistic 20-24 turn conversation between Patricia (division director) and Kwame (senior analyst whose work has gone unrecognized).

SCENARIO: Kwame, a quiet high performer, has been the analytical engine behind three major initiatives over 2 years. Each time, someone else presented the findings. He was not invited to the leadership meetings where his work was discussed. He has never complained before. He requested this meeting.

ARC: Kwame presents facts calmly → Patricia's first instinct is defensive → she catches herself, asks to understand → Kwame reveals the deeper hurt (invisibility, questioning if work matters) → Patricia takes his perspective genuinely → Kwame shifts from grievance to forward-looking.

DEMONSTRATE: perspective-taking (imagining Kwame's experience), emotional recognition (seeing hurt beneath the calm professionalism), withholding judgment (not defending the system), empathic responding (acknowledging without excusing), authenticity.

Mark [KEY MOMENT] at 5 turns. Format: PATRICIA: text or KWAME: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Kwame's internal experience.`,
  },
  "LC-A": {
    weekKey: "LC", id: "LC-A", subtitle: "The Career Crossroads",
    leader: { name: "Tomas", role: "Coaching Leader" },
    other: { name: "Avery", role: "Senior Manager" },
    situation: "Avery has been offered a VP role at a partner company requiring relocation. Currently successful and comfortable. Tomas uses GROW to coach Avery through the decision without giving advice.",
    keyMoments: [
      "Tomas asks what Avery wants from this conversation (Goal, not just the situation)",
      "Avery asks 'What would you do?' and Tomas redirects with a powerful question",
      "Tomas explores what scares Avery, revealing the identity question beneath the logistics",
      "Avery generates options they had not previously considered",
      "Avery states a specific commitment with a timeline",
    ],
    perspectiveShift: "You are Avery. When Tomas redirects your request for advice, feel the initial frustration and then the freedom of being trusted to think. When you arrive at your own answer, notice it feels more real than advice would have.",
    genPrompt: `Generate a realistic 20-24 turn coaching conversation between Tomas (coaching leader) and Avery (senior manager with a VP offer requiring relocation).

ARC: Avery presents dilemma, asks for advice → Tomas sets goal → explores reality (facts AND feelings) → Avery asks "What would you do?" → Tomas redirects → hidden fear surfaces → values question → Avery generates options → commits to next step.

DEMONSTRATE GROW: Goal (session goal, not life goal), Reality (facts and feelings), Options (from Avery, not Tomas), Will (specific, owned). Non-directive stance throughout. Powerful questions.

Mark [KEY MOMENT] at 5 turns. Format: TOMAS: text or AVERY: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Avery's internal experience.`,
  },
  "LC-B": {
    weekKey: "LC", id: "LC-B", subtitle: "The Confidence Gap",
    leader: { name: "Grace", role: "Executive Coach" },
    other: { name: "Ravi", role: "Newly Promoted VP" },
    situation: "Ravi was promoted to VP three months ago but does not believe he belongs. He over-prepares for every meeting, second-guesses decisions, and defers to peers who have been at level longer. Grace coaches him through the imposter pattern using GROW without telling him he is great.",
    keyMoments: [
      "Grace establishes the real goal: not 'how to prepare better' but 'what is getting in the way of trusting yourself'",
      "Ravi describes his over-preparation ritual; Grace explores what he is protecting against",
      "Grace asks what Ravi's peers do differently; Ravi realizes they decide with less information, not more",
      "Grace asks: 'What would you do if you trusted that you earned this?' Ravi pauses, then answers clearly",
      "Ravi commits to making one decision this week without his preparation ritual",
    ],
    perspectiveShift: "You are Ravi. You came in asking for a productivity hack. When Grace redirects to what you are protecting against, feel the discomfort of being seen. When she asks what you would do if you trusted yourself, notice the answer is already there. The preparation was never about readiness; it was about fear.",
    genPrompt: `Generate a realistic 20-24 turn coaching conversation between Grace (executive coach) and Ravi (newly promoted VP struggling with imposter syndrome).

SCENARIO: Ravi promoted to VP 3 months ago. Over-prepares obsessively, defers to senior peers, second-guesses decisions. Privately terrified he does not belong at this level. Presents the problem as "I need better time management for all the prep work."

ARC: Ravi asks for productivity help → Grace sets the real goal (self-trust, not time management) → explores the over-preparation pattern → reveals what Ravi is protecting against → Ravi realizes preparation = armor → Grace asks what he would do if he trusted himself → clear answer emerges → specific commitment.

DEMONSTRATE GROW with non-directive coaching. Grace never says "you are great" or reassures directly. She helps Ravi find his own confidence through questions.

Mark [KEY MOMENT] at 5 turns. Format: GRACE: text or RAVI: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Ravi's internal experience.`,
  },
  "LC-C": {
    weekKey: "LC", id: "LC-C", subtitle: "The Team Conflict",
    leader: { name: "Vincent", role: "Coaching Leader" },
    other: { name: "Bridget", role: "Project Manager" },
    situation: "Bridget has two senior team members in open conflict that is paralyzing the project. She wants Vincent to tell her what to do. Vincent coaches her to see the situation clearly and develop her own approach using GROW.",
    keyMoments: [
      "Bridget presents the problem and asks: 'Should I separate them or force them to work it out?'",
      "Vincent reframes the goal: not solving the conflict but developing Bridget's approach to it",
      "Vincent asks what Bridget has noticed about the pattern (not just the incidents)",
      "Bridget realizes the conflict mirrors a structural problem she has been avoiding",
      "Bridget designs her own intervention plan rather than choosing between Vincent's options",
    ],
    perspectiveShift: "You are Bridget. You came in with a binary question (separate them or force collaboration). When Vincent will not answer it, feel the frustration. When he asks what you have noticed about the pattern, feel the shift from reactive firefighting to strategic thinking. When you realize the real issue is structural, feel the clarity hit.",
    genPrompt: `Generate a realistic 20-24 turn coaching conversation between Vincent (coaching leader) and Bridget (project manager with two team members in open conflict).

SCENARIO: Bridget's two senior engineers are in open conflict: disagreements in meetings, passive-aggressive Slack messages, team members taking sides. Project is 3 weeks behind. Bridget wants to be told what to do: separate them or force them to work it out.

ARC: Bridget presents binary choice → Vincent refuses the binary, sets a coaching goal → explores reality (what has Bridget tried? What has she noticed?) → Bridget realizes the conflict is about a structural role ambiguity she has been avoiding → generates options she had not considered → commits to a specific first step.

DEMONSTRATE GROW. Vincent never picks a side or prescribes. Powerful questions reveal the structural issue.

Mark [KEY MOMENT] at 5 turns. Format: VINCENT: text or BRIDGET: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Bridget's internal experience.`,
  },
  "MN-A": {
    weekKey: "MN", id: "MN-A", subtitle: "The Passed-Over Promotion",
    leader: { name: "Elena", role: "Senior Director" },
    other: { name: "Nia", role: "Clinical Services Manager" },
    situation: "Nia was not selected for the Associate VP role despite strong performance. She is hurt and considering leaving. Elena balances honest feedback (career function) with emotional validation (psychosocial function) and suggests expanding Nia's developmental network.",
    keyMoments: [
      "Elena opens with empathy, not development planning",
      "Elena shares specific behavioral feedback from the selection process",
      "Nia reveals she is considering leaving; Elena normalizes the feeling",
      "Elena suggests a second developmental relationship",
      "Nia names a 30-day commitment on her own terms",
    ],
    perspectiveShift: "You are Nia. When Elena leads with empathy, notice how it changes your willingness to hear harder feedback later. When she shares specific gaps, feel the sting AND the value. When she does not try to talk you out of leaving, notice how that paradoxically makes you want to stay.",
    genPrompt: `Generate a realistic 20-24 turn mentoring conversation between Elena (senior director, mentor) and Nia (clinical services manager, passed over for promotion).

ARC: Nia is hurt → Elena leads with empathy → transitions to honest feedback → Nia reacts defensively then absorbs → reveals considering leaving → Elena normalizes → suggests second mentor → Nia commits to 30-day plan.

DEMONSTRATE: career functions (feedback, exposure planning), psychosocial functions (validation, normalizing), developmental network awareness. Balance both types throughout.

Mark [KEY MOMENT] at 5 turns. Format: ELENA: text or NIA: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Nia's internal experience.`,
  },
  "MN-B": {
    weekKey: "MN", id: "MN-B", subtitle: "The Identity Shift",
    leader: { name: "Harold", role: "Senior VP" },
    other: { name: "Zara", role: "Rising Manager" },
    situation: "Zara was the best individual contributor on the team and was promoted to management 4 months ago. She is struggling with the identity shift from doer to developer. Her team's work is not meeting her standards and she is doing it herself at night. Harold mentors through the transition.",
    keyMoments: [
      "Harold validates the difficulty of the identity shift rather than giving delegation tips",
      "Harold shares his own early management struggle (psychosocial: modeling vulnerability)",
      "Zara admits she does not know what value she adds if she is not doing the technical work",
      "Harold reframes: her new value is developing others, not delivering deliverables",
      "Zara identifies one team member she will invest in developing this month",
    ],
    perspectiveShift: "You are Zara. You expected delegation advice. When Harold shares his own struggle, feel the surprise and relief that someone this senior went through it too. When he says your value is now developing people, feel the identity shift happen in real time. It is scary and freeing at once.",
    genPrompt: `Generate a realistic 20-24 turn mentoring conversation between Harold (senior VP, mentor, 25 years experience) and Zara (recently promoted manager, 4 months in, struggling with identity shift from IC to leader).

SCENARIO: Zara was the best engineer. Promoted to manage 8 people. Her standards are high. Team's work does not meet them. She rewrites deliverables at night. Exhausted. Framing it as "my team is not ready."

ARC: Zara presents the team quality problem → Harold validates the identity shift difficulty → shares his own early struggle → Zara admits she does not know her value without doing the work → Harold reframes value (developing people) → Zara identifies a concrete development action.

DEMONSTRATE: psychosocial (normalizing, sharing personal experience, validating), career (reframing value, concrete guidance), developmental network (suggesting peer group of new managers).

Mark [KEY MOMENT] at 5 turns. Format: HAROLD: text or ZARA: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Zara's internal experience.`,
  },
  "MN-C": {
    weekKey: "MN", id: "MN-C", subtitle: "The Cross-Cultural Navigation",
    leader: { name: "Diana", role: "Global Director" },
    other: { name: "Miguel", role: "International Transfer" },
    situation: "Miguel transferred from the Mexico City office 6 months ago and is struggling with different communication norms. His collaborative, relationship-first style is being read as 'lacking assertiveness' by the US leadership team. Diana mentors across this cultural dimension without pathologizing either style.",
    keyMoments: [
      "Diana does not start with 'how to be more assertive' but asks about Miguel's experience",
      "Miguel describes specific moments where his contributions were overlooked or misread",
      "Diana validates both communication styles without privileging one",
      "Diana helps Miguel develop a strategy for code-switching without losing authenticity",
      "Miguel identifies a specific meeting next week to try a new approach",
    ],
    perspectiveShift: "You are Miguel. You expected to be told to speak up more. When Diana asks about your experience first, feel the respect. When she validates your style rather than treating it as a deficit, feel the relief. When she helps you develop a strategy that honors both worlds, feel the possibility of belonging without erasing yourself.",
    genPrompt: `Generate a realistic 20-24 turn mentoring conversation between Diana (global director, mentor, has lived in 3 countries) and Miguel (transferred from Mexico City office 6 months ago).

SCENARIO: Miguel's collaborative, relationship-first communication style is being misread as "passive" or "lacking executive presence" by US leadership. His 360 feedback says "needs to speak up more in meetings." Miguel is frustrated: in Mexico City, his style was highly effective.

ARC: Diana asks about Miguel's experience (not "how to fix it") → Miguel shares specific misread moments → Diana validates both styles → explores code-switching (adapting without erasing) → Miguel develops a strategy → concrete plan for next meeting.

DEMONSTRATE: psychosocial (validating, normalizing cultural adjustment), career (strategic navigation, visibility tactics), developmental network (suggesting cross-cultural peer connections). Never pathologize Miguel's style.

Mark [KEY MOMENT] at 5 turns. Format: DIANA: text or MIGUEL: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Miguel's internal experience.`,
  },
  "CS-A": {
    weekKey: "CS", id: "CS-A", subtitle: "The Stuck Case",
    leader: { name: "Dr. Amara", role: "Coaching Supervisor" },
    other: { name: "Liam", role: "Coach-in-Training" },
    situation: "Liam is stuck with a resistant client and presents it as a technique question. Dr. Amara moves through the Seven-Eyed Model to identify a parallel process: Liam's conflict avoidance mirrors his client's communication avoidance.",
    keyMoments: [
      "Dr. Amara shifts from Eye 1-2 to Eye 4: asks about Liam's experience",
      "Liam reveals frustration and shame about being stuck",
      "Dr. Amara notices the parallel: avoidance in supervision mirrors avoidance in coaching",
      "Dr. Amara names the parallel process; Liam has breakthrough",
      "Liam connects the pattern to his own conflict avoidance",
    ],
    perspectiveShift: "You are Liam. The conversation starts in your comfort zone (the client's problem). Notice how it moves to territory that makes you squirm. When Dr. Amara names the parallel, feel the shock of recognition. The breakthrough is not a technique; it is you seeing yourself.",
    genPrompt: `Generate a realistic 20-24 turn supervision conversation between Dr. Amara (experienced supervisor) and Liam (coach-in-training stuck with resistant client Prashant).

ARC: Liam asks for technique → Dr. Amara explores client (Eyes 1-2) then shifts to Liam's experience (Eye 4) → Liam reveals shame → Dr. Amara explores relationship (Eye 3) → notices parallel process (Eye 5) → names it → Liam breakthrough → connects to own pattern.

DEMONSTRATE Seven-Eyed Model transitions. Balance support and challenge. Resist case consultation.

Mark [KEY MOMENT] at 5 turns. Format: DR. AMARA: text or LIAM: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Liam's internal experience.`,
  },
  "CS-B": {
    weekKey: "CS", id: "CS-B", subtitle: "The Ethical Dilemma",
    leader: { name: "Dr. Okafor", role: "Coaching Supervisor" },
    other: { name: "Mei", role: "Executive Coach" },
    situation: "Mei's client disclosed potential financial misconduct within the organization. Mei is paralyzed: coaching confidentiality versus potential harm to others. Dr. Okafor supervises through the ethical complexity using multiple lenses, helping Mei think clearly rather than telling her what to do.",
    keyMoments: [
      "Dr. Okafor resists Mei's urge for an immediate answer ('Just tell me what to do')",
      "Dr. Okafor explores the client's world (Eye 1): what exactly was disclosed and in what context",
      "Dr. Okafor shifts to Mei's process (Eye 4): what is making this so paralyzing?",
      "Mei reveals she over-identifies with the client's trust: 'If I break confidence, I lose the relationship'",
      "Dr. Okafor helps Mei see that her paralysis mirrors the client's moral paralysis (parallel process)",
    ],
    perspectiveShift: "You are Mei. You want someone to tell you the right answer. When Dr. Okafor will not, feel the frustration. When she explores YOUR paralysis rather than the ethical framework, feel the surprise. When she names the parallel, realize that both you and your client are frozen by the same fear of consequences.",
    genPrompt: `Generate a realistic 20-24 turn supervision conversation between Dr. Okafor (experienced supervisor) and Mei (executive coach whose client disclosed potential financial misconduct).

SCENARIO: Mei's client, a VP, disclosed that a colleague is manipulating quarterly reports. The client told Mei in confidence. Mei is torn between coaching confidentiality and the potential harm. She wants Dr. Okafor to give her the answer.

ARC: Mei presents the dilemma, asks what to do → Dr. Okafor resists answering → explores what was disclosed (Eye 1) → explores Mei's relationship with the client (Eye 3) → explores Mei's own process (Eye 4): why is this so paralyzing? → Mei reveals over-identification with trust → Dr. Okafor names parallel: Mei's moral paralysis mirrors client's moral paralysis → Mei develops her own approach.

DEMONSTRATE: Seven-Eyed Model across multiple lenses. Ethical reasoning WITHOUT prescribing. Help Mei think, not tell Mei what to do.

Mark [KEY MOMENT] at 5 turns. Format: DR. OKAFOR: text or MEI: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Mei's internal experience.`,
  },
  "CS-C": {
    weekKey: "CS", id: "CS-C", subtitle: "The Burnout Mirror",
    leader: { name: "Dr. Santos", role: "Coaching Supervisor" },
    other: { name: "Aiden", role: "Executive Coach" },
    situation: "Aiden is coaching 14 clients simultaneously and his quality is slipping. He presents a specific case problem, but Dr. Santos sees the systemic issue: Aiden's clients are all burned-out high achievers, and Aiden is burned out himself. The parallel process is overextension mirroring overextension.",
    keyMoments: [
      "Aiden presents a case as a technique question; Dr. Santos notices he has said 'overwhelmed' three times",
      "Dr. Santos asks how many clients Aiden is carrying; Aiden minimizes: 'It is manageable'",
      "Dr. Santos names the pattern: all of Aiden's clients are burned out. Dr. Santos asks: 'What do all your clients have in common with each other? And with you?'",
      "Aiden has the parallel process breakthrough: 'I am coaching burned-out people while being burned out myself'",
      "Aiden realizes his inability to set boundaries with his practice mirrors his clients' inability to set boundaries at work",
    ],
    perspectiveShift: "You are Aiden. You came to talk about one client. When Dr. Santos zooms out to the pattern across all your clients, feel the resistance. When she asks what they have in common with you, feel the ground shift. The realization that you are living the same pattern you are trying to coach others through is both humbling and clarifying.",
    genPrompt: `Generate a realistic 20-24 turn supervision conversation between Dr. Santos (experienced supervisor, warm but incisive) and Aiden (executive coach, 14 active clients, burning out).

SCENARIO: Aiden presents a case: a client who cannot say no to new projects. But Aiden himself has taken on 14 clients (recommended max is 8-10) and is showing signs of burnout: rushed sessions, less preparation, irritability. He does not see the parallel.

ARC: Aiden presents one case → Dr. Santos notices language patterns (Eye 4) → asks about caseload → Aiden minimizes → Dr. Santos names the cross-client pattern (all burned out) → asks the mirror question → Aiden sees himself in his clients → connects boundary failure in practice to clients' boundary failure at work → commits to reducing caseload.

DEMONSTRATE: Seven-Eyed Model, systemic lens (Eye 7: Aiden's practice context), parallel process (overextension mirroring overextension). Support before challenge.

Mark [KEY MOMENT] at 5 turns. Format: DR. SANTOS: text or AIDEN: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Aiden's internal experience.`,
  },
  "SL-A": {
    weekKey: "SL", id: "SL-A", subtitle: "The Story Behind the Numbers",
    leader: { name: "Dana", role: "SVP of Strategy" },
    other: { name: "Cameron", role: "Director of Product Development" },
    situation: "Cameron has presented the business case for a platform migration three times with data. Nobody is moving. Dana helps Cameron discover the personal story that connects the migration to something the team can feel.",
    keyMoments: [
      "Dana asks Cameron to explain the situation; Cameron leads with data. Dana: 'I heard the plan. But what is the story?'",
      "Dana names the gap: data tells what, stories tell why",
      "Dana asks 'Why did you join this company?' Cameron shares a personal experience",
      "Dana helps Cameron see the three-act structure in their experience",
      "Cameron: 'If I told that story to my team on Monday, everything would change'",
    ],
    perspectiveShift: "You are Cameron. When Dana pushes past your data, feel the frustration. When she asks about your personal connection, feel the discomfort. When your story emerges and connects to the professional challenge, feel the shift from frustration to energy.",
    genPrompt: `Generate a realistic 20-24 turn coaching conversation between Dana (SVP of Strategy, 52) and Cameron (Director of Product Development, 35).

ARC: Cameron vents about team resistance, leads with data → Dana: "What is the story?" → Cameron confused → Dana: "Why do YOU care?" → Cameron shares personal experience → Dana helps map three-act structure → Cameron sees the transformation potential.

DEMONSTRATE: identifying data-narrative gap, connecting personal to professional, providing story structure without writing the story, respecting agency.

Mark [KEY MOMENT] at 5 turns. Format: DANA: text or CAMERON: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Cameron's internal experience.`,
  },
  "SL-B": {
    weekKey: "SL", id: "SL-B", subtitle: "The Board Pitch",
    leader: { name: "Iris", role: "VP of Communications" },
    other: { name: "Felix", role: "Startup CEO" },
    situation: "Felix has built an incredible healthcare platform but cannot articulate the human story behind it. Every pitch opens with features and metrics. Iris helps him find the patient story that makes investors care, without reducing patients to fundraising props.",
    keyMoments: [
      "Felix opens with his standard pitch: features, market size, competitive advantage. Iris stops him.",
      "Iris asks: 'Why healthcare? You could have built anything.' Felix is thrown off.",
      "Felix reluctantly shares: his grandmother could not navigate the healthcare system. She missed a critical diagnosis.",
      "Iris helps Felix see that THIS story is his pitch: the problem is real because he has lived it",
      "Felix restructures the pitch: grandmother's story opens, platform is the resolution, metrics validate",
    ],
    perspectiveShift: "You are Felix. You are a technical founder who believes the product should sell itself. When Iris stops your pitch, feel the irritation. When she asks why healthcare, feel the question land somewhere personal. When your grandmother's story connects to the product, feel the sudden coherence: this is not a feature list, this is a mission.",
    genPrompt: `Generate a realistic 20-24 turn coaching conversation between Iris (VP of Communications, storytelling expert) and Felix (startup CEO with a healthcare platform, preparing for investor pitch).

SCENARIO: Felix, 34, technical founder. Platform improves care coordination for elderly patients. Every pitch leads with features and TAM. Investors nod but do not invest. Board advisor suggested working with Iris. Felix is skeptical: "I do not need marketing fluff."

ARC: Felix delivers standard pitch → Iris stops him, asks "Why healthcare?" → Felix gives market answer → Iris persists: "Why do YOU care about elderly patients?" → Felix reluctantly shares grandmother's story → Iris helps connect personal to product → Felix restructures pitch with story opening → realizes this is not fluff, it is truth.

DEMONSTRATE: listening for the story behind the data, powerful questioning (connecting personal to professional), providing structure (three-act), respecting agency (Felix owns the story). Never write the pitch FOR Felix.

Mark [KEY MOMENT] at 5 turns. Format: IRIS: text or FELIX: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Felix's internal experience.`,
  },
  "SL-C": {
    weekKey: "SL", id: "SL-C", subtitle: "The Legacy Speech",
    leader: { name: "Ruth", role: "Executive Coach" },
    other: { name: "Warren", role: "Retiring Plant Manager" },
    situation: "Warren is retiring after 35 years managing a manufacturing plant. He is giving a speech at his farewell dinner and has written a timeline of achievements. Ruth helps him find the story that captures why it mattered: not what he built, but who he became and who he helped become.",
    keyMoments: [
      "Warren reads his draft: a chronological list of milestones. Ruth asks: 'This is what you did. What is the story of who you became?'",
      "Warren is confused: 'I am not a storyteller. I am a plant manager.'",
      "Ruth asks about the person he was when he started versus the person retiring. Warren becomes reflective.",
      "Warren shares a story about a young worker he mentored who is now running the plant. 'That is the real accomplishment.'",
      "Ruth helps Warren see the three-act structure: who he was, what changed him, and what he is leaving behind",
    ],
    perspectiveShift: "You are Warren. You have given a hundred operational presentations. This is different. When Ruth asks who you became, feel the unfamiliar territory. When the story about the young worker emerges, feel the emotion surprise you. You spent 35 years thinking the plant was your legacy. The people were.",
    genPrompt: `Generate a realistic 20-24 turn coaching conversation between Ruth (executive coach, 58, warm and direct) and Warren (retiring plant manager, 62, 35 years at the company, preparing farewell speech).

SCENARIO: Warren's draft speech is a chronological timeline: plant expansion, safety record, production milestones. It is factually impressive and emotionally flat. His wife suggested working with Ruth because "you need to say what you actually mean for once."

ARC: Warren reads timeline draft → Ruth: "What is the story of who you became?" → Warren confused ("I am not a storyteller") → Ruth asks about who he was at 27 vs. now → Warren reflects → story emerges about mentoring a young worker who now runs the plant → Ruth helps him see the arc → Warren rewrites the speech around people, not production numbers.

DEMONSTRATE: creating safety for an uncomfortable task, powerful questions, connecting facts to meaning, providing structure (three acts: who you were, what changed you, what you leave behind), respecting agency. Warren is NOT naturally introspective; Ruth must be patient.

Mark [KEY MOMENT] at 5 turns. Format: RUTH: text or WARREN: text. 1-3 sentences. After, add [PERSPECTIVE SHIFT] with Warren's internal experience.`,
  },
};

// ============================================================
// PARSE GENERATED CONVERSATION
// ============================================================
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

// ============================================================
// COMPONENTS
// ============================================================
function Header({ obs, weekMeta }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`, padding: "14px 24px", color: C.white }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.6, marginBottom: 2 }}>OBLD 500 OBSERVATION MODULE</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{weekMeta ? `${weekMeta.title}: ${obs.subtitle}` : "Leadership Observation Suite"}</div>
        </div>
        {weekMeta && <div style={{ textAlign: "right", fontSize: 11, opacity: 0.6 }}><div>Week {weekMeta.week}</div><div>Phase 3</div></div>}
      </div>
    </div>
  );
}

function Selector({ onSelect, onHome }) {
  const order = ["AL", "EM", "LC", "MN", "CS", "SL"];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ marginBottom: 8 }}><button onClick={onHome} style={{ background: "none", border: "none", color: "#1a3d5c", fontSize: 13, cursor: "pointer", padding: 0 }}>&larr; Back to OBLD 500</button></div>
<div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.navy, marginBottom: 4 }}>Select an observation</div>
        <div style={{ fontSize: 13, color: C.textSec, maxWidth: 480, margin: "0 auto" }}>Watch a demonstration conversation. Each week has three scenarios showing the same skills in different contexts.</div>
      </div>
      {order.map(wk => {
        const w = WEEK_META[wk];
        const scens = Object.values(OBS).filter(o => o.weekKey === wk);
        return (
          <div key={wk} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.midGray, letterSpacing: 1, marginBottom: 8 }}>WEEK {w.week}: {w.title.toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {scens.map(sc => (
                <button key={sc.id} onClick={() => onSelect(sc.id)} style={{
                  background: C.white, border: `1px solid ${C.lightGray}`, borderRadius: 8,
                  padding: "12px 14px", textAlign: "left", cursor: "pointer",
                  transition: "all 0.15s", borderLeft: `3px solid ${C.teal}`,
                }} onMouseOver={e => e.currentTarget.style.borderLeftColor = C.gold} onMouseOut={e => e.currentTarget.style.borderLeftColor = C.teal}>
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

function Briefing({ obs, weekMeta, onGenerate, onBack, isLoading }) {
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
          <button onClick={onGenerate} disabled={isLoading} style={{
            display: "block", width: "100%", marginTop: 16, padding: "12px", fontSize: 15, fontWeight: 600,
            color: C.white, background: isLoading ? C.midGray : `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
            border: "none", borderRadius: 8, cursor: isLoading ? "default" : "pointer",
          }}>{isLoading ? "Generating..." : "Generate observation"}</button>
        </div>
      </div>
    </div>
  );
}

function ConvoView({ obs, weekMeta, turns, perspective, onReflect, onRegen, onBack }) {
  const [revealed, setRevealed] = useState(3);
  const [showPersp, setShowPersp] = useState(false);
  const btmRef = useRef(null);

  useEffect(() => {
    if (revealed < turns.length) { const t = setTimeout(() => setRevealed(r => r + 1), 100); return () => clearTimeout(t); }
  }, [revealed, turns.length]);
  useEffect(() => { btmRef.current?.scrollIntoView({ behavior: "smooth" }); }, [revealed, showPersp]);

  const allDone = revealed >= turns.length;
  const leaderNames = [obs.leader.name.toUpperCase()];
  if (obs.leader.name.startsWith("Dr.")) leaderNames.push(obs.leader.name.split(" ")[1]?.toUpperCase());

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
        const isLeader = leaderNames.some(n => t.speaker.toUpperCase().includes(n));
        return (
          <div key={i} style={{
            marginBottom: 8, padding: t.isKey ? "10px 14px" : "8px 14px", borderRadius: 10,
            background: t.isKey ? C.goldBg : (isLeader ? C.white : C.offWhite),
            border: t.isKey ? `2px solid ${C.gold}` : `1px solid ${C.lightGray}`,
            borderLeft: t.isKey ? `4px solid ${C.gold}` : (isLeader ? `3px solid ${C.teal}` : `3px solid ${C.midGray}`),
          }}>
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
          <div key={i} style={{ fontSize: 14, lineHeight: 1.7, color: C.text, padding: "8px 0", borderTop: i > 0 ? `1px solid ${C.gold}40` : "none" }}>
            <strong>{i + 1}.</strong> {p}
          </div>
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
      <div style={{ fontSize: 13, color: C.midGray }}>Creating a realistic demonstration with annotated key moments.</div>
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

// ============================================================
// MAIN
// ============================================================
export default function ObservationSuite18({ onHome }) {
  const [phase, setPhase] = useState("select");
  const [obsId, setObsId] = useState(null);
  const [turns, setTurns] = useState([]);
  const [persp, setPersp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const obs = obsId ? OBS[obsId] : null;
  const weekMeta = obs ? WEEK_META[obs.weekKey] : null;

  const api = useCallback(async (msgs, sys, tok = 4096) => {
    const r = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: tok, system: sys, messages: msgs }),
    });
    if (!r.ok) throw new Error(`API error (${r.status}): ${await r.text()}`);
    const d = await r.json();
    return d.content.map(c => c.text || "").join("\n").trim();
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true); setPhase("generating");
    try {
      const result = await api(
        [{ role: "user", content: obs.genPrompt }],
        "You are an expert scriptwriter for leadership development. Generate realistic workplace conversations. Follow instructions exactly. No commentary before or after. Each speaker turn is 1-3 sentences."
      );
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
