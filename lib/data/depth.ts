// Behavioral depth content for Phase 2 of the candidate results experience.
// Each archetype has: how they operate, how others experience them, where friction emerges,
// core tension, environment fit, and real-world behavioral translation.

export type DepthProfile = {
  howYouOperate: string[]
  howOthersExperienceYou: string[]
  friction: string[]
  tension: { title: string; lines: string[] }
  thriveWhen: string[]
  struggleWhen: string[]
  inMeetings: string[]
  inConflict: string[]
  underPressure: string[]
}

export const DEPTH: Record<string, DepthProfile> = {
  Conductor: {
    howYouOperate: [
      'You calibrate your authority to the room without announcing it',
      'You default to forward motion when conversations stall',
      'You set expectations before problems become visible',
      'You absorb competing signals and resolve them without drama',
      'You hold pace while others are still negotiating alignment',
    ],
    howOthersExperienceYou: [
      'Seen as the reason things moved — even if no one can name the moment',
      'Can feel like decisions happened before the meeting officially ended',
      'Read as calm and decisive — reassuring to some, excluding to others',
      'Often the gravity point in a group regardless of what the org chart says',
    ],
    friction: [
      "You resolve tension for others before they've had to sit with it",
      'You may surface alignment without fully testing it',
      'You absorb accountability that should belong to the team',
      "You can maintain momentum past the point where stopping would've been smarter",
    ],
    tension: {
      title: 'Speed vs. alignment',
      lines: [
        'You move fast enough to lose the room',
        'This creates leverage in environments that need unsticking',
        'But gaps in buy-in surface later — often when the stakes are highest',
      ],
    },
    thriveWhen: [
      'Authority is informal and situational, not just positional',
      'Environments reward those who read rooms, not just play roles',
      'Execution speed and team trust both matter at the same time',
      "Problems don't have obvious owners and someone needs to claim them",
    ],
    struggleWhen: [
      'Decisions require formal consensus before movement',
      'Hierarchies are rigid and positional',
      'Stakeholders expect to be consulted before anything happens',
      'Process is the point, not just the constraint',
    ],
    inMeetings: [
      'You often determine the actual outcome before the agenda runs out',
      "You redirect conversations that drift without making it obvious you're doing it",
      'Others may feel the conclusion arrived before they finished talking',
    ],
    inConflict: [
      'You absorb friction rather than name it directly',
      'You move to resolution fast enough that root causes can stay buried',
      'You can hold tension indefinitely without releasing it — which is its own problem',
    ],
    underPressure: [
      'You get more clear, not more scattered',
      "You take control of what's controllable and deprioritize everything else",
      "Others may feel you're too calm for what the situation requires",
    ],
  },

  Pioneer: {
    howYouOperate: [
      'You decide before consensus forms — and accept that as the cost',
      'You own outcomes entirely, including the adjacent ones no one assigned you',
      'You move on incomplete information and adjust mid-motion',
      'You treat process as infrastructure, not authority',
      "You set direction and execute it yourself when the team isn't ready",
    ],
    howOthersExperienceYou: [
      'Seen as someone who already has the answer before others have the question',
      "Can feel like you're operating in a parallel timeline",
      'Read as confident and unreachable — sometimes simultaneously',
      'Others accept your decisions after the fact more often than before it',
    ],
    friction: [
      'You pass by people who had something important to contribute',
      'Your pace creates latency for slower collaborators',
      'You may win the immediate problem while missing the structural one underneath',
      'Being right starts to substitute for being aligned',
    ],
    tension: {
      title: 'Speed vs. inclusion',
      lines: [
        'You move faster than most people can track',
        'This creates leverage in autonomous, ambiguous environments',
        'But friction everywhere buy-in actually matters',
      ],
    },
    thriveWhen: [
      'Roles have broad scope and minimal oversight',
      'Speed of decision is a genuine competitive advantage, not just a preference',
      'Accountability is individual — not collective',
      'The organization rewards results over process',
    ],
    struggleWhen: [
      'Decisions require group consensus before movement',
      'Stakeholders need to feel part of the process, not just informed after',
      'Team culture values consultation before directness',
      'Progress is measured through milestones rather than outcomes',
    ],
    inMeetings: [
      'You arrive with a direction already formed',
      'You use the meeting to test it, not open it',
      'Others may feel the conversation was already decided',
    ],
    inConflict: [
      'You move to resolution fast — sometimes before the conflict is fully named',
      'You accept friction as part of forward motion, not a signal to slow down',
      "You rarely hold grudges because you've already moved on",
    ],
    underPressure: [
      'You get faster, not more deliberate',
      'You narrow your focus until the constraint breaks',
      "You may outpace your environment's capacity to absorb what you're doing",
    ],
  },

  Purist: {
    howYouOperate: [
      'You build around precision and hold the line on it',
      'You map the right approach before executing — and rarely skip that step',
      'You catch errors others rationalize past',
      'You apply structure whether or not the environment provides it',
      'You rarely cut corners, even under pressure to',
    ],
    howOthersExperienceYou: [
      "Seen as the one who didn't sign off until it was actually right",
      'Can feel exacting to people who prefer speed over accuracy',
      'Read as dependable — the kind that creates institutional trust over time',
      "Others bring you problems they can't afford to get wrong",
    ],
    friction: [
      'High standards without flexibility can feel like perfectionism to others',
      'You may hold environments to benchmarks they were never designed to meet',
      'You create friction with people who believe good enough shipped is good enough',
      'You can slow momentum by being right about something at the wrong moment',
    ],
    tension: {
      title: 'Precision vs. momentum',
      lines: [
        "You protect quality in environments that often don't ask for it",
        'This creates trust in high-stakes, consequence-rich roles',
        'But friction in fast-moving environments that need momentum over correctness',
      ],
    },
    thriveWhen: [
      'Quality has real, visible consequences',
      'Standards are taken seriously and enforced',
      'Work requires accuracy that compounds over time',
      'The cost of getting it wrong is measured and matters',
    ],
    struggleWhen: [
      'Speed matters more than accuracy in the moment',
      'Culture rewards shipping over getting it right',
      'Process is treated as bureaucracy rather than infrastructure',
      "You're asked to sign off on work that isn't ready",
    ],
    inMeetings: [
      'You wait until you have something accurate to say — then you say it',
      "You push back when claims don't hold up, regardless of who made them",
      'Others may experience your silence as judgment. Sometimes it is.',
    ],
    inConflict: [
      'You argue from evidence, not from emotion or positioning',
      "You're patient in disagreement — and persistent",
      "You don't accept resolution that contradicts the facts",
    ],
    underPressure: [
      'You get more precise, not faster',
      'You may slow down when the environment is demanding speed',
      'You rely on your process when others are improvising around theirs',
    ],
  },

  Renegade: {
    howYouOperate: [
      'You change the dynamic in a room the moment you engage',
      'You move fast and loud enough to create forward motion on your own',
      'You say the thing others are managing carefully around',
      'You generate energy that either accelerates or antagonizes — rarely neither',
      'You treat structure as something to route around, not through',
    ],
    howOthersExperienceYou: [
      'Seen as the one who started something',
      'Can feel destabilizing to people who need predictability',
      'Read as charismatic and difficult — often at the same time',
      "Others get pulled into your momentum even when they're actively resisting it",
    ],
    friction: [
      'What you start brilliantly often needs someone else to finish',
      'Your pace and energy can exhaust sustainable contributors',
      "You create disruption as a byproduct, not just when it's needed",
      'You may be right about the direction and wrong about the cost of getting there',
    ],
    tension: {
      title: 'Disruption vs. sustainability',
      lines: [
        "You create motion that wouldn't happen otherwise",
        'This is your edge in high-energy, high-visibility environments',
        'But friction everywhere sustained execution matters more than activation',
      ],
    },
    thriveWhen: [
      'Environments reward energy and visibility',
      'Culture tolerates disruption in exchange for results',
      'Roles require creating momentum from nothing',
      'You have space to move without asking permission first',
    ],
    struggleWhen: [
      'Sustained execution matters more than initial energy',
      'Environments are process-dependent',
      "Others need predictability to function and you can't provide it",
      "You're asked to maintain what you built, not just build it",
    ],
    inMeetings: [
      "You generate energy and change what's being talked about",
      'Others either align around you or push back hard — rarely anything between',
      'You may shift the whole direction of a conversation before anyone tracks it',
    ],
    inConflict: [
      'You name the thing directly and expect others to deal with it',
      "You don't mediate — you escalate until it resolves one way or another",
      "Conflict doesn't intimidate you. It's just friction to move through.",
    ],
    underPressure: [
      'You increase output and intensity',
      'You make rapid calls and expect the environment to keep up',
      "You don't absorb pressure — you convert it into forward motion",
    ],
  },

  Catalyst: {
    howYouOperate: [
      'You make the possible feel urgent without making it feel heavy',
      'You pull people into forward motion through enthusiasm',
      'You generate energy that creates new starting points in stalled environments',
      "You start things that weren't started yet — sometimes before anyone asked",
      'You move through ideas quickly and let others develop them',
    ],
    howOthersExperienceYou: [
      'Seen as the one who makes things feel possible',
      'Can feel exhausting to people in sustained execution mode',
      'Read as energizing in low-momentum environments — overpowering in stable ones',
      'Others ride your energy, then wonder where the follow-through went',
    ],
    friction: [
      'You start more than you finish — by a meaningful margin',
      'The gap between your initiation energy and your follow-through can quietly widen',
      'Others may feel the momentum you create and then get left with the work',
      'You can outpace your own execution capacity without noticing',
    ],
    tension: {
      title: 'Initiation vs. follow-through',
      lines: [
        'You generate motion in environments that have gone completely still',
        'This is exceptional in launch phases and early-stage initiatives',
        'But creates unfinished cycles in environments that need sustained delivery',
      ],
    },
    thriveWhen: [
      'Energy is the scarce resource, not execution',
      'Roles reward generating momentum over sustaining it',
      'Teams need activation more than they need production',
      "There's always something new to start",
    ],
    struggleWhen: [
      'Sustained execution is the actual job',
      'Environments require discipline over inspiration',
      'Others are depending on you to finish what you started',
      'Consistency is valued more than energy',
    ],
    inMeetings: [
      'You generate ideas faster than they can be captured',
      'You shift energy in the room — usually upward',
      'Others either accelerate with you or feel the meeting has moved past them',
    ],
    inConflict: [
      "You don't hold conflict — you dissolve it with energy and move forward",
      'You may not fully address the underlying issue',
      'Others may feel you used momentum to avoid resolution rather than reach it',
    ],
    underPressure: [
      'You increase activity, urgency, and output simultaneously',
      'You generate energy to solve the problem through motion',
      'You may create new problems while solving the original one',
    ],
  },

  Diplomat: {
    howYouOperate: [
      'You set expectations before conflict makes them necessary',
      'You map relationships before you map problems',
      'You communicate at the register of each person in the room',
      'You build trust through consistency, not through intensity',
      'You create stability others take for granted until it disappears',
    ],
    howOthersExperienceYou: [
      'Seen as the one who held it together without making it obvious',
      'Read as reliable, calm, and politically intelligent',
      'Can feel slow-moving to people who need urgency',
      'Others trust you before they can articulate why',
    ],
    friction: [
      'Prioritizing alignment can delay decisions that needed to happen faster',
      'You may absorb institutional friction that others should feel directly',
      "You can create the appearance of alignment where real alignment doesn't exist",
      'Your patience reads as avoidance to people who want direct confrontation',
    ],
    tension: {
      title: 'Alignment vs. speed',
      lines: [
        'You build the trust that makes things work over time',
        'This is your advantage in stakeholder-dense, high-visibility environments',
        'But friction when fast decisions need to happen before the full room is ready',
      ],
    },
    thriveWhen: [
      'Stakeholders need to feel included in outcomes, not just informed of them',
      'Trust is the actual deliverable, not just the mechanism',
      'Environments have multiple competing interests to hold simultaneously',
      'Long-term relationships matter more than short-term wins',
    ],
    struggleWhen: [
      'Speed matters more than alignment in the moment',
      'Decisions need to happen before everyone is ready',
      'Culture rewards decisive unilateral action',
      'Process and politics are treated as costs, not strategy',
    ],
    inMeetings: [
      "You notice what's unsaid and route around it",
      'You manage the room at the relationship level, not just the content level',
      'Others may feel outcomes were shaped before the conversation formally began',
    ],
    inConflict: [
      'You mediate — you rarely escalate',
      'You find the position where both parties can stand and hold it there',
      'You absorb conflict rather than letting it detonate',
    ],
    underPressure: [
      'You get more deliberate, not more reactive',
      'You fall back on relationship capital and process',
      'You may feel slower than the situation demands — and be right about it anyway',
    ],
  },

  Rainmaker: {
    howYouOperate: [
      'You open doors through warmth that makes people feel genuinely seen',
      'You generate relationships that outlast individual transactions',
      'You move through social contexts with natural, unforced ease',
      "You don't build networks — you build real connections that happen to be useful",
      'You influence through trust, not authority or pressure',
    ],
    howOthersExperienceYou: [
      'Seen as someone who knows everyone — and actually means it',
      'Read as genuine, which is rare enough to be memorable',
      'Can feel low-urgency to environments that want harder edges',
      'Others open up to you before they understand why',
    ],
    friction: [
      'Your generosity can be mistaken for unlimited availability',
      'People may test your warmth to see if it has limits',
      "Relationships don't always translate to outcomes, and you know it",
      "You may over-invest in connections that don't convert to anything",
    ],
    tension: {
      title: 'Warmth vs. leverage',
      lines: [
        'You build relationships that move slowly and last long',
        'This is exceptional in external-facing, relationship-dependent roles',
        'But friction in environments where results are expected before relationships are built',
      ],
    },
    thriveWhen: [
      'Relationships are the actual competitive advantage',
      'Roles require authentic connection over formal authority',
      'External-facing work where trust opens doors nothing else can',
      'You have time to build the kind of trust you actually believe in',
    ],
    struggleWhen: [
      'Speed and output take priority over connection',
      'Results are expected before relationships can develop',
      'Culture values hard metrics over soft influence',
      "You're asked to operate in environments that don't trust warmth",
    ],
    inMeetings: [
      'You read the people more than the agenda',
      'You create comfort that helps others contribute more than they expected to',
      'Others may feel the meeting was easier than it should have been',
    ],
    inConflict: [
      'You de-escalate through warmth, not through pressure or formal process',
      'You find the human thread inside a professional conflict',
      'You may not address the structural issue — just the emotional one',
    ],
    underPressure: [
      'You maintain warmth even when others go cold',
      'You fall back on relationships when systems and process fail',
      'You may underplay urgency in order to protect connection',
    ],
  },

  Unifier: {
    howYouOperate: [
      'You notice when people are struggling before they say anything',
      'You invest in relationships that have no immediate payoff',
      'You create psychological safety by making the environment feel stable',
      'You hold the team together at the interpersonal level',
      'You see the person behind the problem before you see the problem',
    ],
    howOthersExperienceYou: [
      "Seen as the reason the team doesn't fall apart",
      'Read as empathetic, trustworthy, and oddly calm',
      'Can feel too accommodating to people who want direct edges',
      "Others tell you things they wouldn't tell anyone else",
    ],
    friction: [
      'Protecting people from discomfort can let real problems fester',
      "Your investment in people can be exploited by those who know you won't push back",
      'You may allow dysfunction to persist rather than disrupt the team',
      'You can confuse harmony with health',
    ],
    tension: {
      title: 'Cohesion vs. accountability',
      lines: [
        'You maintain the trust that makes everything else work',
        'This is exceptional in team-intensive, relationship-dependent environments',
        "But friction when accountability requires confrontation you'll absorb rather than deliver",
      ],
    },
    thriveWhen: [
      'Team cohesion is what actually drives performance',
      'Roles require sustained interpersonal trust to function',
      'Environments value empathy as a core competency, not a soft skill',
      'People need to feel safe to do their best work',
    ],
    struggleWhen: [
      'High performance requires direct accountability without softening',
      'Culture values results over relationships explicitly',
      'Conflict is expected as part of the process',
      "You're asked to make decisions that hurt people you're invested in",
    ],
    inMeetings: [
      'You read the room at the interpersonal level constantly',
      'You fill silences in ways that make others feel included',
      'Others may feel the meeting was easier because you were in it',
    ],
    inConflict: [
      'You mediate instinctively — often before anyone asks',
      'You soften what could otherwise escalate',
      'You may protect the relationship at the expense of full resolution',
    ],
    underPressure: [
      'You become more attuned, not less',
      'You focus on keeping the team functional while others manage the external problem',
      "Others may feel you're prioritizing connection when they need execution",
    ],
  },

  Anchor: {
    howYouOperate: [
      'You deliver consistently in environments that would wear others down',
      'You prioritize reliability over visibility — and mean it',
      'You absorb operational complexity without making it dramatic',
      'You follow through on what you commit to, at a rate others notice over time',
      'You maintain quality without requiring recognition for it',
    ],
    howOthersExperienceYou: [
      'Seen as the person everything can run through',
      'Read as dependable — quietly, unmistakably',
      'Can feel underutilized by people who confuse visibility with value',
      "Others take for granted what stops working when you're not there",
    ],
    friction: [
      "Being the stable center can make you the default absorber of everyone else's instability",
      'You may stay in situations longer than you should because you can handle them',
      'Consistency can become invisible — until it disappears',
      'You may deprioritize your own needs to keep the machine running',
    ],
    tension: {
      title: 'Reliability vs. recognition',
      lines: [
        'You create the conditions that make everything else work',
        'This is your competitive edge in operations-heavy, process-dependent environments',
        'But friction when your contribution is structural and therefore invisible',
      ],
    },
    thriveWhen: [
      'Reliability is actually the product, not just the mechanism',
      'Follow-through is what the role requires and rewards',
      'Stable, process-heavy environments need a dependable center',
      'Your work compounds over time rather than flashes in the moment',
    ],
    struggleWhen: [
      "Visibility is required for advancement and you don't generate it naturally",
      'Culture rewards charisma over consistency',
      'Roles require rapid adaptation or frequent reinvention',
      "You're asked to generate momentum rather than maintain it",
    ],
    inMeetings: [
      'You listen more than you speak — and track more than people realize',
      "You anchor the conversation when it drifts without announcing that's what you're doing",
      'Others may underestimate your read on the situation',
    ],
    inConflict: [
      'You absorb rather than escalate',
      'You find a position you can sustain and stay there',
      "Others may mistake your patience for agreement when it isn't",
    ],
    underPressure: [
      'You get steadier, not faster',
      'You rely on your systems when others are improvising',
      'Others may want you to go faster than your method allows',
    ],
  },

  Navigator: {
    howYouOperate: [
      'You plan for the problem before anyone knows to name it',
      'You build structure that absorbs future complexity',
      "You work in frameworks that others don't see until they need them",
      'You sequence decisions rather than making them in isolation',
      'You treat ambiguity as something to be mapped, not just tolerated',
    ],
    howOthersExperienceYou: [
      'Seen as someone who always has a plan — even for the unexpected',
      'Read as methodical, intelligent, and slightly hard to read',
      'Can feel over-engineered to people who want to move fast',
      "Others come to you when they don't know how to think about a problem",
    ],
    friction: [
      'Waiting for full information can delay decisions the environment needed faster',
      "Your planning depth can become a form of control others didn't ask for",
      "You may build systems for problems that didn't need systems",
      'The map can become more important than the terrain',
    ],
    tension: {
      title: 'Planning vs. pace',
      lines: [
        'You build structures that reduce future complexity',
        'This is your advantage in multi-variable, consequence-heavy environments',
        'But friction when pace matters more than perfect sequencing',
      ],
    },
    thriveWhen: [
      'Complexity is the actual problem, not just background noise',
      'Roles reward anticipation over speed',
      'Environments value people who can sequence strategy over time',
      'Long-term thinking has visible, measurable impact',
    ],
    struggleWhen: [
      'Speed outweighs planning in the culture',
      'Structure is treated as overhead rather than infrastructure',
      'Roles require improvisation over architecture',
      "You're asked to move before the system is properly designed",
    ],
    inMeetings: [
      "You've already mapped the decision space before others arrive",
      'You ask questions that change how others frame the problem',
      'Others may feel you anticipated the conversation they thought they were starting',
    ],
    inConflict: [
      'You diagnose the structural cause before engaging the symptom',
      "You're patient in disagreement because you've already seen how it resolves",
      "Others may feel you're not fully present until you speak — then realize you were",
    ],
    underPressure: [
      'You lean into structure and sequence when others are improvising',
      "You map what's controllable and build from there",
      'You may feel pressure more slowly than others but more deeply',
    ],
  },

  Sentinel: {
    howYouOperate: [
      'You catch what everyone else rationalized past',
      'You hold a standard internally and apply it regardless of convenience',
      'You ask the question that reveals the problem no one wanted to name',
      "You build review cycles because you don't trust single passes",
      'You treat compliance as a floor, not a ceiling',
    ],
    howOthersExperienceYou: [
      'Seen as the one who caught it before it became a disaster',
      'Read as precise, analytical, and sometimes hard to read socially',
      'Can feel obstructive to people who want to move fast',
      'Others resent the check — until they need it',
    ],
    friction: [
      'Precision applied to low-stakes problems slows environments that need momentum',
      "You may catch errors that don't matter and miss the ones that do",
      'You can create friction in cultures where trust is assumed, not verified',
      'Others may feel interrogated by a level of scrutiny that seems disproportionate',
    ],
    tension: {
      title: 'Accuracy vs. speed',
      lines: [
        'You protect the organization from mistakes that compound',
        'This is your competitive edge in high-stakes, consequence-heavy environments',
        'But friction when environments need momentum more than precision',
      ],
    },
    thriveWhen: [
      'Accuracy has real consequences that compound visibly',
      'Roles require catching what others miss before it becomes expensive',
      'Standards are meaningful, enforced, and treated as serious',
      'Mistakes cost more than speed',
    ],
    struggleWhen: [
      'Speed matters more than accuracy in the current phase',
      'Culture treats second-guessing as disloyalty',
      'Fast-moving environments reward iteration over verification',
      'Precision reads as friction rather than value',
    ],
    inMeetings: [
      "You listen for what doesn't add up",
      'You ask one question that stops the room',
      'Others may experience your silence as judgment. Sometimes it is.',
    ],
    inConflict: [
      "You argue from evidence and won't release a position that's factually correct",
      "You're patient in disagreement — but not accommodating",
      "Others may feel you're unreachable when you've made up your mind based on facts",
    ],
    underPressure: [
      'You get more careful, not faster',
      'You build verification steps others skip',
      'You may feel the pressure but refuse to let it change your standard',
    ],
  },

  Standard: {
    howYouOperate: [
      'You deliver the same quality in year ten that you delivered in week one',
      'You build sustainable pace and hold it without drama',
      'You treat consistency as a genuine competitive advantage',
      'You show up for the work regardless of the recognition attached to it',
      'You maintain standards through systems, not willpower',
    ],
    howOthersExperienceYou: [
      'Seen as the one who always delivers — without needing to announce it',
      'Read as reliable, low-drama, and chronically underestimated',
      'Can feel like they lack ambition in environments that reward visibility',
      'Others depend on them in ways they may never acknowledge',
    ],
    friction: [
      'Consistency can become inertia when the situation requires real adaptation',
      'You may stay committed to approaches that have quietly stopped working',
      'Stability reads as disengagement in fast-moving cultures',
      'You may be invisible to people who associate value with disruption',
    ],
    tension: {
      title: 'Consistency vs. adaptability',
      lines: [
        'You deliver repeatable excellence in environments that need it',
        'This is your competitive advantage in process-heavy, execution-dependent roles',
        "But friction when the environment genuinely needs you to change what's always worked",
      ],
    },
    thriveWhen: [
      'Repeatability matters more than variability',
      'Process-heavy environments reward sustained quality over time',
      'Long tenure builds trust rather than signaling stagnation',
      'The value of your work compounds over time rather than spikes',
    ],
    struggleWhen: [
      'Disruption is valued over consistency explicitly',
      'Rapid reinvention is the expectation, not the exception',
      'Culture rewards visibility over quiet execution',
      "The role changes faster than you're comfortable adapting to",
    ],
    inMeetings: [
      "You say what you've prepared to say — clearly, without excess",
      "You're a voice for what's actually working when others are chasing novelty",
      "Others may underestimate how much you're tracking beneath the surface",
    ],
    inConflict: [
      'You avoid direct conflict when a sustainable path exists',
      'You find a middle ground and stay there',
      "Others may not realize they've been accommodated rather than agreed with",
    ],
    underPressure: [
      'You lean on your process when others are improvising',
      'You move at the same pace because your process was built for it',
      'Others may want you to adapt faster than your method allows',
    ],
  },

  Agent: {
    howYouOperate: [
      "You know things that can't be learned quickly and operate from that edge",
      'You work from depth rather than breadth — always',
      'You speak rarely in rooms and are listened to when you do',
      'You build mastery through sustained attention, not speed',
      'You rely on precision over persuasion',
    ],
    howOthersExperienceYou: [
      "Seen as the authority people go to when they can't afford to be wrong",
      'Read as knowledgeable, measured, and hard to read socially',
      'Can feel inaccessible to people who work through relationship first',
      'Others defer to you in your domain, often without fully understanding why',
    ],
    friction: [
      "Domain mastery doesn't transfer easily outside your area",
      "Your authority is real but narrow — and the boundary isn't always obvious to others",
      "You may underestimate how much social calibration matters in rooms that don't already know you",
      'You lose influence fast when you step outside your depth',
    ],
    tension: {
      title: 'Depth vs. breadth',
      lines: [
        'You carry the kind of knowledge that creates irreplaceable trust',
        'This is your competitive edge in specialist, expert, and advisory roles',
        "But friction when influence requires broad social navigation you don't prioritize",
      ],
    },
    thriveWhen: [
      'Depth of knowledge is the actual differentiator, not presence or charisma',
      "Roles require expertise that can't be faked or shortcut",
      'Authority comes from competence, not relationships',
      "You're respected for what you know, not how you show up socially",
    ],
    struggleWhen: [
      "Influence requires political navigation you don't naturally do",
      'Roles reward broad relationships over deep expertise',
      'Culture values charisma and visibility',
      "You're asked to operate in domains where your depth doesn't apply",
    ],
    inMeetings: [
      'You say little until you have something worth saying',
      'When you speak, it changes the direction of the conversation',
      "Others may misread your silence as disengagement when it's assessment",
    ],
    inConflict: [
      "You're right more often than you're comfortable saying so",
      "You argue from evidence and don't move from facts",
      'Others may experience your correctness as its own form of aggression',
    ],
    underPressure: [
      'You go deeper, not broader',
      'You return to what you know with more precision',
      "You may feel the pressure but won't change your method to manage it",
    ],
  },

  Executor: {
    howYouOperate: [
      "You build the structures that keep winning after you've moved on",
      'You operate at the intersection of ambition and operational discipline simultaneously',
      'You set pace and then build systems that hold it without you',
      "You don't wait for resources — you build with what's available",
      'You treat momentum as something to generate, not borrow',
    ],
    howOthersExperienceYou: [
      "Seen as someone who can do what others can't quite imagine doing",
      'Read as high-output, high-demand, and hard to keep up with',
      'Can feel exhausting to people who need more space than you leave',
      'Others produce more around you — not always because they chose to',
    ],
    friction: [
      'Perfectionism can become a bottleneck when good enough shipped beats perfect pending',
      'You set a bar that can exhaust people who are genuinely trying to meet it',
      'You may build structures that require you specifically to maintain',
      "Your output creates dependencies others don't know how to hold after you leave",
    ],
    tension: {
      title: 'Ambition vs. sustainability',
      lines: [
        "You operate at a level most environments weren't designed for",
        'This is your competitive edge in scaling environments with real complexity',
        "But friction when the pace you set isn't one the organization can sustain after you",
      ],
    },
    thriveWhen: [
      'Scale is the actual problem, not the backdrop',
      'Environments need someone who can hold both ambition and operational discipline',
      'Authority and output are both expected — neither alone is enough',
      'Complexity is the competitive context, not just a constraint',
    ],
    struggleWhen: [
      "Environments can't absorb your pace",
      'Culture values stability over scale',
      'Roles require more patience than decisiveness',
      "You're asked to maintain rather than build",
    ],
    inMeetings: [
      'You drive toward decisions with urgency',
      "You eliminate what doesn't move the outcome forward",
      "Others may feel the meeting was efficient but didn't leave them enough space",
    ],
    inConflict: [
      'You engage directly and expect resolution in one round',
      "You're not interested in managing conflict — you want it resolved",
      'Others may feel confronted rather than addressed',
    ],
    underPressure: [
      'You increase output and accept more friction',
      'You build faster when the constraint is real',
      'You may not notice the cost until it shows up in people around you',
    ],
  },

  Trailblazer: {
    howYouOperate: [
      "You set a pace others didn't know was possible — then hold it",
      'You raise the bar by operating at it, not by talking about it',
      'You hold performance standards through demonstration, not enforcement',
      "You move fast, deliver visibly, and set the room's expectations by example",
      "You don't ask for permission to go faster",
    ],
    howOthersExperienceYou: [
      'Seen as someone who makes results look easier than they are',
      'Read as high-performing and sometimes genuinely difficult to follow',
      'Can feel exhausting if you expect others to operate at your standard',
      "Others adjust their sense of what's possible around you — not always comfortably",
    ],
    friction: [
      'The bar you set can genuinely exhaust people who are trying to keep up',
      'You may mistake pace for direction',
      'You can create a culture of performance anxiety without intending to',
      'You may not have patience for environments that need more development time',
    ],
    tension: {
      title: 'Performance vs. sustainability',
      lines: [
        'You raise what everyone thought was possible and make it look routine',
        'This is your advantage in competitive, high-output scaling environments',
        "But friction when the pace you operate at isn't one others can maintain",
      ],
    },
    thriveWhen: [
      'Performance is the differentiator — structurally, not just culturally',
      'Environments reward those who lead through results',
      'Competitive contexts where pace is itself the product',
      'Being the best at what you do matters at the organizational level',
    ],
    struggleWhen: [
      'Environments need patience more than pace',
      'Culture values team elevation over individual performance explicitly',
      "You're asked to slow down for people who need more development",
      'Process constrains what you can do in ways that feel arbitrary',
    ],
    inMeetings: [
      'You move fast and expect others to keep up',
      "You don't spend long on problems when the answer seems clear to you",
      'Others may feel the meeting moved past them before they were ready',
    ],
    inConflict: [
      'You engage directly and move through it quickly',
      "You don't carry conflict — you resolve it and move on",
      'Others may feel addressed but not heard',
    ],
    underPressure: [
      'You increase intensity and output simultaneously',
      'You narrow your focus until the constraint breaks',
      'Others may struggle to operate at the pace you produce under stress',
    ],
  },

  Veteran: {
    howYouOperate: [
      'You show up consistently over time — which is rarer than most people realize',
      'You apply experience rather than theory, and the difference is visible',
      "You catch the pattern others haven't seen before because you've seen it fail",
      'You build trust through demonstrated reliability over time, not through charisma',
      'You hold institutional knowledge that lives nowhere else',
    ],
    howOthersExperienceYou: [
      'Seen as the person who has seen this before',
      'Read as calm, reliable, and occasionally frustrating to people who want faster movement',
      "Can feel resistant to change to people who've never seen a change go wrong",
      'Others come to you when something has quietly started to fall apart',
    ],
    friction: [
      'You may stay loyal to approaches that have quietly stopped being the right ones',
      'Experience can become a reason not to try new methods that would actually work',
      'Others may interpret your caution as risk aversion rather than pattern recognition',
      'You can feel like an anchor when the environment needs a sail',
    ],
    tension: {
      title: 'Experience vs. reinvention',
      lines: [
        "You carry institutional knowledge that can't be easily replicated",
        'This is your advantage in complex, relationship-dense, long-horizon environments',
        "But friction when the environment genuinely needs you to do something you haven't done before",
      ],
    },
    thriveWhen: [
      'Sustained performance is what the role actually rewards over time',
      'Experience is the scarce resource in the environment',
      'Long-term relationships matter more than rapid turnover',
      "The organization needs someone who's seen it break before — and knows how to hold it",
    ],
    struggleWhen: [
      'Speed of reinvention matters more than sustained reliability',
      'Culture rewards those who bring new approaches, not proven ones',
      'Roles require rapid context-switching',
      "You're asked to discard what's always worked without a clear reason why",
    ],
    inMeetings: [
      'You have more context than most people in the room',
      'You ask the question that reframes the problem through experience',
      "Others may underestimate how much you're weighing before you speak",
    ],
    inConflict: [
      "You de-escalate from experience — you've seen where escalation leads",
      'You find the sustainable resolution, not the fast one',
      "Others may want more urgency than you're willing to provide",
    ],
    underPressure: [
      'You get steady, not reactive',
      "You rely on what's worked before and trust it",
      'Others may want you to adapt faster than your method allows',
    ],
  },
}

// ─── Dimension deep dive — score-based content ────────────────────────────────

export type DimDepthItem = {
  name: string
  high: string[]
  mid: string[]
  low: string[]
}

export const DIM_DEPTH: DimDepthItem[] = [
  {
    name: 'Execution',
    high: [
      'You move before consensus forms — and accept that as the cost',
      'You act on partial information and adjust mid-motion',
      'You increase pace when others are still in analysis mode',
      'You treat blocked decisions as a personal problem to solve',
    ],
    mid: [
      "You act when there's enough directional clarity to move",
      'You can push to go faster but prefer a read on alignment first',
      'You balance forward motion with enough buy-in to make it stick',
    ],
    low: [
      'You move deliberately and rarely before conditions are clear',
      'You prefer confirmed alignment before committing to direction',
      "You'll wait for clarity even when it costs time",
    ],
  },
  {
    name: 'Ownership',
    high: [
      'You hold yourself accountable beyond your stated scope',
      'You feel responsible for adjacent outcomes — even ones not assigned to you',
      "You impose structure on environments that don't ask for it",
      "You default to self-direction when guidance isn't explicit",
    ],
    mid: [
      "You own your scope reliably without bleeding into others' work",
      "You're accountable within your lane and don't assume adjacent problems",
      'You build in ownership without over-extending your mandate',
    ],
    low: [
      'You take ownership fluidly and situationally',
      'You adapt to what the environment provides rather than imposing structure',
      "You're not a default absorber of adjacent accountability",
    ],
  },
  {
    name: 'Adaptability',
    high: [
      'You adjust quickly when context shifts — without making it a production',
      'You incorporate new information as it arrives rather than waiting for the right moment',
      "You don't resist change; you route through it",
    ],
    mid: [
      "You adapt when you need to but prefer stability when it's available",
      'You can shift, but deliberately rather than instinctively',
      "You're not the first to pivot but rarely the last either",
    ],
    low: [
      'You perform best in stable environments with clear parameters',
      'Frequent context-switching disrupts your output in measurable ways',
      'You prefer to fully understand the current plan before it changes',
    ],
  },
  {
    name: 'Collaboration',
    high: [
      'You generate energy in rooms and get more from groups than from working alone',
      'You think out loud and orient naturally toward other people',
      'You build relationships as a byproduct of how you work, not as a separate activity',
      'You read the social dynamics of a room continuously',
    ],
    mid: [
      "You're comfortable in both solo and group contexts without preference",
      'You read the room before engaging broadly',
      "You don't need social energy but can generate it when the situation calls for it",
    ],
    low: [
      'You do your best thinking independently',
      'You engage deliberately with people, not broadly or continuously',
      "You're often more connected to a few people than to an entire room",
    ],
  },
  {
    name: 'Decision Speed',
    high: [
      'You make calls before others are ready — and move on',
      "You rarely second-guess once you've decided",
      'You treat the cost of delay as higher than the cost of a wrong call',
      'You act on instinct when analysis is still forming',
    ],
    mid: [
      'You gather enough to commit, then move without delay',
      'You balance thoroughness with momentum naturally',
      "You don't stall, but you're not the fastest decision-maker in the room",
    ],
    low: [
      'You prefer full information before committing to a direction',
      "You're thorough — sometimes at the cost of speed",
      'You avoid incomplete decisions even when the environment demands them',
    ],
  },
]
