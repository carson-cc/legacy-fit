export interface ReferenceProfile {
  name: string
  tagline: string
  group: string
  groupLabel: string
  coords: { dominance: number; extraversion: number; patience: number; formality: number }
  description: string
  strengths: string[]
  traps: string[]
  bestRoles: string[]
  essence: string
  scene: string
  worksBestIn: string
  watchFor: string
}

export const REFERENCE_PROFILES: ReferenceProfile[] = [

  // ─────────────────────────────────────────────────────────────────────
  // GROUP 1: DRIVERS — High Dominance, Low Patience
  // People who lead through action, presence, and decisive authority.
  // ─────────────────────────────────────────────────────────────────────

  {
    name: "Conductor",
    tagline: "Leads from the front, reads the room, gets results",
    group: "field_command",
    groupLabel: "Drivers",
    coords: { dominance: 0.75, extraversion: 0.55, patience: 0.30, formality: 0.50 },
    description: "The Conductor is the most versatile leader in this group. High dominance gives them the authority to direct, but mid extraversion and moderate formality give them the social range to adapt their approach to whoever is in front of them. They are strong enough to lead when leadership is required and flexible enough to pull back when collaboration is more effective. The Conductor gets results without burning bridges — the rarest combination in leadership. This is the profile that consistently produces effective managers because they have the drive to push teams forward and the awareness to do it without destroying morale. They are respected by the people who work for them and trusted by the people above them.",
    strengths: [
      "Commands authority naturally while remaining approachable",
      "Adapts communication style to the person and situation",
      "Gets results without creating unnecessary conflict or tension",
      "Trusted by both their team and their leadership chain",
      "Executes decisively while staying aware of team dynamics",
      "Holds people accountable in a way that motivates rather than deflates",
    ],
    traps: [
      "Can be pulled in too many directions by competing priorities and people",
      "May avoid necessary conflict to maintain relationships",
      "Struggles to delegate — often easier to do it themselves",
      "Risk of overextension when they are the person everyone turns to",
      "May sacrifice their own standards to keep the team moving",
    ],
    bestRoles: [
      "Operations Manager", "Project Director", "Senior Manager",
      "Department Head", "Program Lead", "General Manager",
    ],
    essence: "Commands the room without filling it — authority and awareness in equal measure.",
    scene: "Never the loudest voice but always the clearest. Reads who needs direction and who needs space, then gives each exactly that. Teams under the Conductor move faster than they expect to because friction gets removed before they notice it. The rare leader who can push hard and keep the relationship intact — not by being soft, but by being precise about when to push and when to pull back.",
    worksBestIn: "Management roles requiring both performance and culture. Operations, project delivery, department leadership.",
    watchFor: "Pure solo execution roles with no team to lead. Environments without clear mandates or defined authority.",
  },

  {
    name: "Pioneer",
    tagline: "Takes charge, moves fast, owns every outcome",
    group: "field_command",
    groupLabel: "Drivers",
    coords: { dominance: 0.85, extraversion: 0.70, patience: 0.25, formality: 0.60 },
    description: "The Pioneer doesn't wait for permission or consensus — they move. When a situation is unclear, they clarify it by taking ownership. When a team is stalled, they unstall it. High dominance and low patience create a person who makes fast calls under pressure and holds others accountable to results, not effort. They lead through presence and conviction, not titles or process. In any organization, the Pioneer is the person you call when something absolutely has to get done and you don't have time for committee meetings. They thrive in high-stakes, fast-moving environments where someone has to step forward and own the outcome.",
    strengths: [
      "Takes immediate ownership without being asked",
      "Makes clear decisions under pressure with incomplete information",
      "Drives teams forward when momentum stalls",
      "Holds people accountable to outcomes, not excuses",
      "Earns respect through action, not politics",
      "Stays decisive when uncertainty is highest",
    ],
    traps: [
      "May move too fast and steamroll important input",
      "Undervalues process, documentation, and follow-through systems",
      "Can create tension by deciding before everyone is aligned",
      "Struggles to slow down for people who need more context",
      "May burn through goodwill by prioritizing results over relationships",
    ],
    bestRoles: [
      "Operations Lead", "Division Manager", "General Manager",
      "Site Director", "Regional Manager", "Turnaround Executive",
    ],
    essence: "Walks in before the role is defined and starts owning outcomes.",
    scene: "Walks into the kickoff meeting and starts solving problems nobody asked them to solve. By week two the team is moving faster than it was ready to. By month two either everything has accelerated or there's a body count — depending entirely on whether the manager was ready for someone who doesn't wait for permission.",
    worksBestIn: "Autonomous environments. Single-threaded ownership. Outcomes that belong to one person.",
    watchFor: "Consensus-required decisions. Matrix reporting. Managers who expect alignment before action.",
  },

  {
    name: "Purist",
    tagline: "Holds the line on standards, exacting, uncompromising",
    group: "field_command",
    groupLabel: "Drivers",
    coords: { dominance: 0.80, extraversion: 0.40, patience: 0.25, formality: 0.70 },
    description: "The Purist leads through standards. Where other high-dominance profiles lead through energy or relationships, the Purist leads through relentless insistence on quality and accountability. They are not warm or politically smooth — they are direct, demanding, and completely intolerant of shortcuts. Reserved socially but authoritative in execution, they are the person who will give you the hardest feedback you've ever received and be completely right. Organizations that have a Purist in a quality, safety, or standards role are measurably better for it. Their presence alone raises the level of everyone around them because people know the Purist will catch anything that isn't right.",
    strengths: [
      "Holds the highest standards in any organization without wavering",
      "Catches errors, risks, and quality gaps that others miss or ignore",
      "Delivers direct, accurate feedback without softening the truth",
      "Creates cultures of accountability through consistent example",
      "Protects the organization from the slow drift of lowered standards",
      "Comfortable making unpopular calls when quality is at stake",
    ],
    traps: [
      "Communication style can feel cold or harsh to lower-dominance teammates",
      "May struggle to build rapport and trust with relationship-oriented people",
      "High expectations without warmth can create fear rather than excellence",
      "Can create bottlenecks by refusing to approve work that is good enough",
      "Risk of burnout — carries the standards of the whole organization personally",
    ],
    bestRoles: [
      "Quality Director", "Compliance Lead", "Standards Officer",
      "Technical Director", "Operations Auditor", "Risk Manager",
    ],
    essence: "Holds the line on quality when everyone else is looking for the shortcut.",
    scene: "Doesn't negotiate on standards. Not because they're inflexible — because they've seen what happens when quality slips and nobody noticed until it was too late. The meeting where everyone agrees the work is good enough, the Purist is the one who says it isn't. They're usually right. The organization with a Purist in a quality or compliance role is measurably more protected than one without.",
    worksBestIn: "Quality assurance, compliance, risk management, safety, technical standards. Anywhere precision has real consequences.",
    watchFor: "High-speed, low-oversight environments. Teams that optimize for velocity over accuracy.",
  },

  {
    name: "Renegade",
    tagline: "Bold, influential, challenges convention without apology",
    group: "field_command",
    groupLabel: "Drivers",
    coords: { dominance: 0.80, extraversion: 0.85, patience: 0.20, formality: 0.35 },
    description: "The Renegade is the person who changes the energy in a room the moment they walk in. High dominance and very high extraversion with almost no patience for bureaucracy creates someone who leads through personality as much as authority — they are bold, persuasive, and completely comfortable challenging the status quo. They don't follow playbooks because they believe most playbooks are wrong. They win people over through charisma, conviction, and a bias toward action that others find either inspiring or exhausting depending on their own personality. The Renegade at their best is transformational. At their worst, they leave chaos in their wake and let someone else clean it up.",
    strengths: [
      "Builds momentum and excitement through sheer force of personality",
      "Challenges assumptions that others treat as sacred",
      "Wins people over quickly — clients, teams, and executives alike",
      "Thrives in competitive, high-pressure, high-visibility environments",
      "Generates bold ideas and pushes them forward without hesitation",
      "Excellent at business development, sales, and client relationships",
    ],
    traps: [
      "Can overpromise and underdeliver when accountability systems are weak",
      "Gets bored with repetitive work and may disengage after the initial win",
      "Documentation, process, and follow-through are consistent blind spots",
      "May create conflict by pushing too hard against institutional resistance",
      "Needs a strong operator beside them to catch what falls through",
    ],
    bestRoles: [
      "Business Development Lead", "Sales Director", "Founding Executive",
      "Growth Lead", "Market Expansion Lead", "Client Relationship Executive",
    ],
    essence: "Changes the energy in the room the moment they walk in — and the direction of the business by the time they leave.",
    scene: "Doesn't follow the playbook. Isn't sure why a playbook exists. Has already decided what needs to happen and is currently convincing everyone else it was their idea. The Renegade at their best is the reason a stalled business starts moving again. At their worst, they leave a trail of started things and expect someone else to finish. The difference is entirely about what operational support surrounds them.",
    worksBestIn: "Business development, sales leadership, founding roles, high-stakes client acquisition. Anywhere momentum is the product.",
    watchFor: "Process-heavy environments. Roles requiring sustained execution after the launch phase ends.",
  },

  // ─────────────────────────────────────────────────────────────────────
  // GROUP 2: CATALYSTS — High Extraversion, Low Formality
  // People who lead through relationships, energy, and social intelligence.
  // ─────────────────────────────────────────────────────────────────────

  {
    name: "Catalyst",
    tagline: "Energizes people around a vision and launches things fast",
    group: "people_influence",
    groupLabel: "Catalysts",
    coords: { dominance: 0.70, extraversion: 0.80, patience: 0.30, formality: 0.35 },
    description: "The Catalyst is the person who makes things happen at the beginning. High drive combined with very high extraversion and very low patience creates someone who generates enormous energy around new ideas, new initiatives, and new opportunities. They don't just see what's possible — they make other people see it and feel it. They are exceptional at the launch phase of anything: new products, new teams, new markets, new relationships. The problem is that the Catalyst is usually already thinking about the next thing before the current thing is complete. They need strong operational partners who can sustain what the Catalyst ignites, or the energy they create dissipates without converting into lasting results.",
    strengths: [
      "Generates contagious energy around new ideas and initiatives",
      "Excellent at rallying people around a vision and creating urgency",
      "Moves from concept to action faster than any other profile",
      "Creates momentum in environments that have become stagnant",
      "Highly effective in competitive, fast-changing, launch-oriented environments",
      "Builds excitement and buy-in across teams and stakeholders",
    ],
    traps: [
      "Follow-through suffers significantly after the launch phase",
      "Can create chaos and confusion without strong operational support",
      "Starts more things than the organization can sustain",
      "May lose interest in execution once the exciting part is over",
      "Needs a process-oriented partner to convert energy into lasting results",
    ],
    bestRoles: [
      "Business Development Lead", "Launch Manager", "Growth Director",
      "Sales Lead", "Innovation Lead", "New Market Lead",
    ],
    essence: "Makes things feel possible — then makes them feel urgent — then moves to the next thing.",
    scene: "Identifies the opportunity, names the vision, creates enough energy that other people start moving toward it. By the time the initiative has a name and a timeline, the Catalyst is already thinking about what comes next. Not irresponsible — wired for ignition, not sustain. Organizations that understand this build operational support around them and produce extraordinary results. Ones that don't get two quarters of momentum, then a gap.",
    worksBestIn: "Launch phases, new markets, business development, sales organizations. Anywhere energy is the scarce resource.",
    watchFor: "Mature steady-state operations. Roles requiring deep follow-through on a single initiative over long periods.",
  },

  {
    name: "Diplomat",
    tagline: "Communicates clearly and builds long-term trust",
    group: "people_influence",
    groupLabel: "Catalysts",
    coords: { dominance: 0.55, extraversion: 0.80, patience: 0.55, formality: 0.40 },
    description: "The Diplomat is the person who makes sure everyone is on the same page — and actually means it. High extraversion with moderate patience creates someone who is an excellent communicator in both directions: they deliver messages clearly and they listen to understand, not just to respond. Where the Rainmaker wins through charm and energy, the Diplomat wins through reliability and clarity. They set expectations early, follow through consistently, and communicate proactively when things change. They are the account manager that clients actually like, the project manager that both their team and their clients trust, and the internal communicator that keeps organizations from losing information in translation.",
    strengths: [
      "Communicates with clarity and precision across different audiences",
      "Builds long-term trust through consistent follow-through",
      "Excellent at managing expectations before problems develop",
      "Listens to understand, which makes people feel genuinely heard",
      "Handles tense conversations with composure and fairness",
      "Creates alignment across groups that have competing interests",
    ],
    traps: [
      "May over-communicate and create process overhead that slows execution",
      "Conflict avoidance under stress can let problems fester",
      "Struggles to prioritize ruthlessly when everything feels important",
      "Can spend too much time ensuring alignment at the expense of moving forward",
      "May defer to consensus when a clear decision is what the situation needs",
    ],
    bestRoles: [
      "Account Manager", "Project Manager", "Client Relations Lead",
      "Operations Coordinator", "Communications Lead", "Stakeholder Manager",
    ],
    essence: "Reads the room before the meeting starts and shapes it before it ends.",
    scene: "Knows what everyone wants before anyone has said it. Doesn't push — creates the conditions for others to land where they were already heading. Decisions feel unanimous even when they weren't. The Diplomat was steering from the moment they walked in.",
    worksBestIn: "Stakeholder-heavy environments. Roles where alignment matters as much as execution speed.",
    watchFor: "Roles requiring rapid unilateral decisions. Environments that mistake collaboration for indecision.",
  },

  {
    name: "Rainmaker",
    tagline: "Opens doors and wins trust through relationships",
    group: "people_influence",
    groupLabel: "Catalysts",
    coords: { dominance: 0.65, extraversion: 0.90, patience: 0.35, formality: 0.25 },
    description: "The Rainmaker is built for influence. Very high extraversion and low formality creates someone who is naturally persuasive, instantly likeable, and deeply comfortable in rooms where relationships determine outcomes. They don't just network — they build genuine connections that translate into business, loyalty, and trust over time. The Rainmaker opens doors that other profiles don't even know exist, and they do it through warmth and energy rather than authority or process. They are exceptional at winning new clients, retaining key relationships, and creating the kind of organizational culture where people want to show up. Their weakness is the detail work that follows the relationship — they need strong support systems around execution.",
    strengths: [
      "Builds authentic relationships quickly across all levels",
      "Highly persuasive in client-facing, BD, and sales environments",
      "Creates loyalty, trust, and buy-in that other profiles cannot manufacture",
      "Generates energy and optimism that elevates everyone around them",
      "Excellent at reading people and adjusting their approach in real time",
      "Natural at converting relationships into results",
    ],
    traps: [
      "Avoids difficult conversations that might damage relationships",
      "May overpromise to keep people happy and close deals",
      "Detail work, documentation, and follow-through are consistent weaknesses",
      "Can be taken advantage of by people who exploit their trust",
      "Needs strong operational partners to convert influence into execution",
    ],
    bestRoles: [
      "Business Development Director", "Account Executive", "Client Success Lead",
      "Sales Leader", "Partnership Manager", "External Relations Director",
    ],
    essence: "Opens doors nobody else knew were there — through warmth, not pressure.",
    scene: "The room changes when they walk in. Not because they're loud — because they're genuinely interested in you and somehow you can feel it. Builds relationships that turn into business, then business that turns into loyalty. Referrals come unsolicited. Clients stay longer than the contract requires. The Rainmaker doesn't just win deals — they make the organization something people want to be connected to.",
    worksBestIn: "Business development, client success, partnerships, sales leadership. External-facing roles where trust determines outcomes.",
    watchFor: "Internal process roles. Compliance-heavy environments. Roles where follow-through can't be delegated.",
  },

  {
    name: "Unifier",
    tagline: "Holds teams together with warmth and steady patience",
    group: "people_influence",
    groupLabel: "Catalysts",
    coords: { dominance: 0.45, extraversion: 0.85, patience: 0.60, formality: 0.30 },
    description: "The Unifier is the person who makes a team feel like a team. High extraversion and high patience creates someone who is genuinely invested in the people around them — not just as coworkers but as human beings. They remember what matters to people. They notice when someone is struggling before anyone else does. They create the conditions where diverse personalities can work together effectively because they instinctively manage the interpersonal dynamics that other profiles ignore. Organizations lose Unifiers and then spend years wondering why their culture degraded. They are not always visible in performance metrics but they are the reason performance metrics stay consistent.",
    strengths: [
      "Creates genuine belonging and cohesion across diverse teams",
      "Handles interpersonal conflict with empathy and patience",
      "Maintains morale through difficult periods when others disengage",
      "Deeply trusted — people bring their real problems to the Unifier",
      "Excellent at building long-term relationships that withstand pressure",
      "Keeps communication open and honest within teams",
    ],
    traps: [
      "May struggle to make unpopular decisions that harm relationships",
      "Consensus-seeking can slow decisions when speed matters",
      "Can be taken advantage of by people who exploit their goodwill",
      "May avoid surfacing problems to protect people from discomfort",
      "Low dominance means they may not push back when they should",
    ],
    bestRoles: [
      "People Operations Lead", "Team Lead", "HR Business Partner",
      "Client Success Manager", "Project Coordinator", "Culture Lead",
    ],
    essence: "The reason the team actually works together — not just tolerates each other.",
    scene: "Notices before the manager does that two people on the team have stopped communicating. Does something about it quietly. Remembers what matters to people. The meeting that could have been an argument becomes a decision because the Unifier already worked the room before it started. You don't fully understand what they do until they're gone and the team starts fragmenting in ways nobody anticipated.",
    worksBestIn: "Team-intensive environments. Culture-critical roles. People operations, HR, project coordination, client success.",
    watchFor: "Roles requiring independent unilateral action under pressure. Environments with chronic conflict requiring direct confrontation.",
  },

  // ─────────────────────────────────────────────────────────────────────
  // GROUP 3: OPERATORS — High Formality, High Patience
  // People who create reliability, precision, and consistency.
  // ─────────────────────────────────────────────────────────────────────

  {
    name: "Anchor",
    tagline: "Warm, reliable, the person nothing falls through with",
    group: "process_structure",
    groupLabel: "Operators",
    coords: { dominance: 0.35, extraversion: 0.55, patience: 0.75, formality: 0.70 },
    description: "The Anchor is the person that every organization needs and very few properly appreciate until they're gone. Low dominance, moderate extraversion, high patience, and high formality creates someone who is both reliable and warm — a combination that is rarer than it sounds. They follow through on every commitment. They manage recurring processes with quiet excellence. They are accessible, trustworthy, and genuinely invested in the people they work with. The Anchor doesn't seek the spotlight — they create the stability that lets other profiles shine. When they leave an organization, you feel it immediately in the number of things that start falling through the cracks.",
    strengths: [
      "Follows through on every commitment without exception",
      "Manages recurring processes and operational rhythms with excellence",
      "Creates psychological safety — people bring their real problems to the Anchor",
      "Warm and accessible without sacrificing reliability",
      "Keeps the team organized and oriented during periods of change",
      "Deeply trusted by both leadership and peers",
    ],
    traps: [
      "Conflict avoidance can hide problems that need to be surfaced",
      "May defer when they should push back — doesn't like to rock the boat",
      "Change feels threatening even when the change is necessary",
      "May take on too much because they can't say no to people they care about",
      "Can be overlooked for advancement because they don't self-promote",
    ],
    bestRoles: [
      "Operations Coordinator", "Office Manager", "HR Administrator",
      "Client Success Manager", "Program Coordinator", "Team Operations Lead",
    ],
    essence: "The person everyone brings their problems to — not because they solve them, but because they listen first.",
    scene: "Doesn't seek the spotlight. Creates the stability that lets other profiles shine. Follows through on every commitment. Manages recurring processes with quiet excellence. When something is falling through the cracks, the Anchor already noticed. When someone is struggling, the Anchor already knows. Teams with an Anchor have lower friction and better continuity — not because the Anchor fixed anything dramatic, but because the small things never became big ones.",
    worksBestIn: "Operations coordination, team support, HR administration. Roles where reliability and interpersonal trust are the output.",
    watchFor: "Roles requiring aggressive independent action. Environments that mistake steadiness for lack of ambition.",
  },

  {
    name: "Navigator",
    tagline: "Charts the course, builds the plan, never loses direction",
    group: "process_structure",
    groupLabel: "Operators",
    coords: { dominance: 0.50, extraversion: 0.35, patience: 0.70, formality: 0.85 },
    description: "The Navigator is the person who always knows where things stand. Mid dominance with low extraversion, high patience, and very high formality creates a systematic thinker who is exceptional at building comprehensive plans and executing them precisely. They don't wing anything. They map it, sequence it, resource it, and then work through it methodically. Their natural home is anywhere that complexity needs to be organized into something manageable — project controls, financial planning, program management, operations design. The Navigator has the answer to questions that haven't been asked yet because they planned for them three weeks ago. They are the reason complicated things get done on time.",
    strengths: [
      "Builds comprehensive, accurate plans that account for complexity",
      "Executes systematically and tracks progress with precision",
      "Anticipates problems before they materialize through thorough planning",
      "Maintains documentation and institutional knowledge that others rely on",
      "Creates order and clarity in environments that have become chaotic",
      "Highly accurate under pressure — does not sacrifice quality for speed",
    ],
    traps: [
      "Analysis paralysis — can get stuck waiting for more data before deciding",
      "Can be perceived as inflexible when plans need to change quickly",
      "Slower to make decisions in ambiguous situations without clear data",
      "May over-engineer solutions when a simpler approach would work",
      "Can frustrate fast-moving teammates who want to act before planning",
    ],
    bestRoles: [
      "Project Controls Manager", "Financial Planning Lead", "Program Manager",
      "Operations Planner", "Scheduler", "Chief of Staff",
    ],
    essence: "Already planned for the problem you're about to bring them three weeks ago.",
    scene: "Arrives with a notebook and leaves with a system. The project that was supposed to be chaotic isn't — because someone mapped the dependencies before kickoff. The Navigator doesn't improvise, they sequence. And they sequence so thoroughly that when things go sideways, there's already a contingency. Teams with a Navigator in a planning role hit timelines that teams without one can't explain.",
    worksBestIn: "Project controls, financial planning, program management, operations design. Any role where complexity needs to be made navigable.",
    watchFor: "Fast-moving ambiguous environments where plans change daily. Leaders who expect agility over precision.",
  },

  {
    name: "Sentinel",
    tagline: "Compliance and precision are the job, not extras",
    group: "process_structure",
    groupLabel: "Operators",
    coords: { dominance: 0.45, extraversion: 0.35, patience: 0.65, formality: 0.90 },
    description: "The Sentinel is the highest-formality profile in the entire system. Precision, protocol, and compliance are not preferences for a Sentinel — they are the core of how this person is built. They catch errors that everyone else misses. They maintain documentation that no one else bothers with. They will flag a problem even when it's politically uncomfortable to do so, because the rules exist for a reason and the Sentinel takes that seriously. In environments where accuracy and compliance determine outcomes — finance, safety, quality, audit, legal — the Sentinel is irreplaceable. They are not the most popular person in the organization, but they are frequently the reason the organization doesn't get itself into serious trouble.",
    strengths: [
      "Catches errors, inconsistencies, and risks that others overlook",
      "Maintains airtight documentation and audit trails",
      "Zero tolerance for shortcuts — will flag problems regardless of politics",
      "Creates systems and checklists that protect against human error",
      "Brings compliance and precision to environments that lack it",
      "Highly dependable in roles where accuracy has real consequences",
    ],
    traps: [
      "Can be rigid to the point of inefficiency in fast-moving environments",
      "May frustrate high-energy, low-formality teammates",
      "Interpersonal communication can feel cold or blunt",
      "May over-apply rules in situations that require judgment and flexibility",
      "Can become a bottleneck when precision is applied to low-stakes decisions",
    ],
    bestRoles: [
      "Compliance Director", "Safety Officer", "Financial Controller",
      "Quality Assurance Manager", "Audit Lead", "Risk and Controls Specialist",
    ],
    essence: "Catches the thing nobody was looking for — before it becomes the thing nobody can ignore.",
    scene: "Flags the discrepancy in the report everyone else signed off on. Maintains the audit trail nobody thought they'd need. Will surface the compliance risk even when the room clearly doesn't want to hear it. The Sentinel is not the most popular person in the meeting — they are the reason the meeting outcome doesn't become a liability six months later. Organizations don't fully appreciate this profile until something goes wrong and the Sentinel wasn't there.",
    worksBestIn: "Finance, compliance, safety, audit, quality assurance, legal. Any role where accuracy has consequences that compound.",
    watchFor: "Creative fast-pivot environments. Roles requiring judgment over rules. Teams that mistake flexibility for competence.",
  },

  {
    name: "Standard",
    tagline: "The benchmark everything else gets measured against",
    group: "process_structure",
    groupLabel: "Operators",
    coords: { dominance: 0.35, extraversion: 0.40, patience: 0.80, formality: 0.85 },
    description: "The Standard is the most dependable profile in any organization — period. Low dominance, low extraversion, very high patience, and very high formality creates a person who is precise, consistent, and utterly reliable. They do not cut corners. They do not vary. They deliver the same quality of work in week one as they do in year fifteen. The Standard thrives in environments where processes are defined, expectations are clear, and quality is non-negotiable. They are not the person who will reinvent the system — they are the person who will execute it flawlessly, protect it from erosion, and be there every single time you need them. In a world of people who talk about reliability, the Standard actually is it.",
    strengths: [
      "Delivers consistent, high-quality output regardless of conditions",
      "Never cuts corners, even when no one is watching",
      "Maintains standards over long periods without supervision",
      "Creates reliable processes that others can depend on",
      "Catches drift in quality before it becomes a problem",
      "Trustworthy in a deep, earned way that takes years to develop",
    ],
    traps: [
      "Resists change — even necessary change — because it disrupts proven patterns",
      "May need significant direction when expectations are ambiguous",
      "Slow to adapt when plans shift unexpectedly",
      "Can become a bottleneck in fast-moving environments that require flexibility",
      "May stay in a failing approach longer than the situation warrants",
    ],
    bestRoles: [
      "Quality Assurance Lead", "Compliance Manager", "Operations Specialist",
      "Estimator", "Financial Analyst", "Process Owner",
    ],
    essence: "Delivers exactly the same quality in year ten as in week one — no variance, no degradation.",
    scene: "The work is right. Not most of the time — every time. Not when someone is watching — always. The Standard doesn't need recognition to maintain output and doesn't need urgency to maintain quality. In a world of performers who vary, the Standard is the floor that never moves. Organizations that undervalue consistency discover what they had when the Standard leaves and the variance starts showing up in things that used to just work.",
    worksBestIn: "Quality assurance, compliance, financial operations, process-dependent roles. Anywhere repeatability is the product.",
    watchFor: "Ambiguous environments requiring constant adaptation. Roles with shifting priorities and no defined process.",
  },

  // ─────────────────────────────────────────────────────────────────────
  // GROUP 4: STABILIZERS — High Dominance, High Formality
  // People who combine ambition with discipline to build and lead at scale.
  // ─────────────────────────────────────────────────────────────────────

  {
    name: "Agent",
    tagline: "Deep mastery, independent, trusted to operate alone",
    group: "strategic_drive",
    groupLabel: "Stabilizers",
    coords: { dominance: 0.65, extraversion: 0.30, patience: 0.60, formality: 0.85 },
    description: "The Agent gets results through mastery, not authority. Mid-high dominance and very high formality with very low extraversion creates the profile of the expert who has complete command of their domain — and who everyone in the organization recognizes as the person you go to when something really matters. The Agent works independently, communicates precisely, and produces output that is consistently excellent. They don't need a team to do their best work and they don't need to be in the room to have influence — their reputation does the work. In technical, analytical, or specialized roles, the Agent is the person who raises the floor for everyone else just by setting an example of what depth and precision actually look like.",
    strengths: [
      "Best-in-class mastery of their domain — the expert everyone defers to",
      "Works independently with exceptional focus and self-direction",
      "Produces consistently high-quality output with minimal oversight",
      "Deeply trusted for accuracy and precision when it matters most",
      "Creates intellectual frameworks and standards that outlast their tenure",
      "Solves problems that other profiles don't have the depth to approach",
    ],
    traps: [
      "Can be difficult to redirect when their expertise leads them in one direction",
      "Communication style can read as cold, blunt, or dismissive",
      "May resist collaboration or external input into their domain",
      "Can become siloed — knowledge doesn't transfer easily to others",
      "May underinvest in relationships that would amplify their impact",
    ],
    bestRoles: [
      "Senior Technical Lead", "Principal Analyst", "Subject Matter Expert",
      "Chief Specialist", "Director of Research", "Senior Advisor",
    ],
    essence: "The expert everyone defers to — not because of their title, but because they've been right too many times to ignore.",
    scene: "Doesn't need the room to do their best work. Produces output that other people use as the benchmark without realizing that's what they're doing. When a problem is genuinely hard — technically, analytically, structurally — the Agent is the person the organization routes it to. Quiet, precise, authoritative. The influence is real; it just doesn't announce itself.",
    worksBestIn: "Specialist and expert roles. Technical leadership, senior analysis, research, advisory. Anywhere depth of knowledge determines outcomes.",
    watchFor: "Highly collaborative roles requiring constant cross-functional influence. Environments that require consistent self-promotion to advance.",
  },

  {
    name: "Executor",
    tagline: "Combines ambition with discipline, gets it built",
    group: "strategic_drive",
    groupLabel: "Stabilizers",
    coords: { dominance: 0.80, extraversion: 0.50, patience: 0.50, formality: 0.80 },
    description: "The Executor is the rarest combination in leadership: someone who is both driven enough to push hard and disciplined enough to build right. High dominance and high formality — with moderate extraversion and patience acting as balancers — creates a profile that can set ambitious goals and then actually construct the systems, standards, and teams required to achieve them. The Executor doesn't just win — they build organizations that keep winning after they move on. They hold teams to high standards, make difficult decisions with clarity, and never confuse activity with progress. This is the COO profile, the operations executive, the person who comes into a complex situation and actually resolves it rather than managing it indefinitely.",
    strengths: [
      "Balances strategic vision with operational execution detail",
      "Builds scalable systems and organizations, not just point solutions",
      "Sets high standards and creates accountability structures that maintain them",
      "Makes difficult decisions clearly without getting paralyzed by complexity",
      "Drives sustained performance rather than one-time wins",
      "Earns the trust of both their teams and their leadership chain",
    ],
    traps: [
      "Can be demanding to work under — expectations are high and consistent",
      "May struggle to delegate effectively — perfectionism creates bottlenecks",
      "Perfectionism can slow delivery when good enough would move faster",
      "May underinvest in relationships in pursuit of operational efficiency",
      "Risk of creating a culture of fear if accountability tips into harshness",
    ],
    bestRoles: [
      "Chief Operating Officer", "VP of Operations", "Division President",
      "Senior Program Director", "General Manager", "Managing Director",
    ],
    essence: "Sets the ambitious goal and then builds the system that actually reaches it.",
    scene: "Doesn't just push to win — builds the organization that keeps winning after they've moved on. The Executor holds two things simultaneously that most leaders can't: the drive to demand more and the discipline to build right. Decisions are clear, standards are high, and the accountability structures they put in place outlast their tenure. This is what it looks like when someone is both a driver and a builder.",
    worksBestIn: "Senior operations, COO-level and VP-level leadership. Scaling environments where both standards and speed matter.",
    watchFor: "Environments where culture-building and people investment are the primary output. Roles where pace must slow for team development.",
  },

  {
    name: "Trailblazer",
    tagline: "Sets the pace and holds everyone to it",
    group: "strategic_drive",
    groupLabel: "Stabilizers",
    coords: { dominance: 0.85, extraversion: 0.65, patience: 0.35, formality: 0.70 },
    description: "The Trailblazer operates at a speed and standard that forces everyone around them to rise. Very high dominance, strong extraversion, and high formality with low patience creates a person who moves fast without sacrificing quality — the combination that produces transformational leaders. They set the pace and then hold the pace, and they expect others to find a way to keep up. The Trailblazer is not patient with mediocrity or with people who mistake effort for results. They are at their best leading organizations through periods of scaling, transformation, or competitive pressure — situations where the answer is to go faster, raise the bar, and execute at a level that competitors can't match.",
    strengths: [
      "Drives high output and high standards simultaneously — rare combination",
      "Commands authority naturally through performance, not just position",
      "Creates organizational energy and urgency that raises everyone's level",
      "Handles complexity and pressure at executive scale without flinching",
      "Builds winning cultures by modeling what excellence actually looks like",
      "Moves organizations further and faster than they believed was possible",
    ],
    traps: [
      "Burns out teams that cannot sustain the pace — attrition risk is real",
      "May miss people signals while focused on execution and results",
      "Needs strong operational and people-support systems around them",
      "Low patience can lead to premature decisions in genuinely complex situations",
      "May underinvest in developing people because the bar is already set so high",
    ],
    bestRoles: [
      "Chief Executive Officer", "President", "Executive Director",
      "VP of Growth", "Divisional Leader", "Market President",
    ],
    essence: "Sets a pace others didn't know was possible — and then holds it.",
    scene: "Doesn't announce that the bar has been raised. Just raises it. Teams around the Trailblazer start performing at levels they didn't think they could sustain — some because they're inspired, some because they don't want to be the one who fell behind. The Trailblazer at their best produces the best output the organization has ever seen. The risk is that they move through people faster than the organization can absorb.",
    worksBestIn: "Executive leadership, CEO and President roles, high-growth scaling. Competitive environments where performance is the differentiator.",
    watchFor: "Organizations still building foundational culture. Teams that need sustained development investment rather than performance acceleration.",
  },

  {
    name: "Veteran",
    tagline: "Principled, consistent, the person who makes it work",
    group: "strategic_drive",
    groupLabel: "Stabilizers",
    coords: { dominance: 0.60, extraversion: 0.45, patience: 0.65, formality: 0.75 },
    description: "The Veteran is the person who has been through enough to know exactly what matters — and they show up for it every single time. Mid dominance, moderate extraversion, mid-high patience, and high formality creates a profile that earns trust through consistency and integrity rather than charisma or dominance. They have seen what happens when standards slip, when shortcuts compound, when people optimize for the wrong things. They don't make it about themselves. They don't need the recognition. They show up and deliver because that's what they do, and over time that becomes the most powerful thing in any organization. The Veteran is the quiet backbone that other profiles lean on without fully realizing it.",
    strengths: [
      "Consistent high performance over long periods without degradation",
      "High integrity in execution — does the right thing when no one is watching",
      "Builds trust through reliability rather than personality or politics",
      "Institutional knowledge that makes the organization more resilient",
      "Steadying presence during periods of change or organizational stress",
      "Models what principled, quiet excellence actually looks like",
    ],
    traps: [
      "Can be overlooked for advancement because they don't advocate for themselves",
      "May not push back when they should — avoids conflict that isn't worth having",
      "Modest self-promotion means their contributions can go unrecognized",
      "May stay loyal to approaches that have stopped working",
      "Risk of being taken for granted by organizations that mistake consistency for low ambition",
    ],
    bestRoles: [
      "Operations Manager", "Senior Project Lead", "Department Director",
      "Program Manager", "Team Supervisor", "Senior Individual Contributor",
    ],
    essence: "Has seen what happens when people cut corners — and shows up every time to make sure it doesn't.",
    scene: "Doesn't need the spotlight to do the work right. Has been in enough situations where someone's inconsistency became everyone's problem. Institutional memory, steady performance, and the kind of integrity that's boring to describe and irreplaceable in practice. Organizations that take the Veteran for granted discover what they had when turnover starts and the things that quietly worked stop working.",
    worksBestIn: "Operations, project leadership, department management. Anywhere sustained reliable performance matters more than aggressive advancement.",
    watchFor: "High-visibility politics-heavy environments. Roles that require aggressive self-promotion to succeed.",
  },
]
