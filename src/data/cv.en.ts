/**
 * cv.en.ts — English version of the CV data.
 *
 * Mirrors the structure of cv.ts exactly.
 * Import cvDataEn wherever an English locale is needed.
 */

import type {
  Social,
  Language,
  WorkExperience,
  Education,
  Certification,
  Skill,
  SoftSkill,
  TransversalSkill,
  MethodologyItem,
  GrowthArea,
  Project,
  SocialImpactItem,
  AiWorkflowItem,
  ValueFlow,
  Feedback,
} from "./cv.js";

export const cvDataEn = {
  // ── Personal info ──────────────────────────────────────────────────────────
  personal: {
    name: "Giulio Occhipinti",
    title: "Digital Innovation Consultant & Technical Partner for SMBs",
    summary:
      "Generalist expert who supports SMBs by orchestrating three integrated pillars: Technology (Angular, Lit, MCP, Node.js), Design (UX/UI — IBM + SkillUp certified) and Method (lean Agile, short sprints, team autonomy). 6+ years on high-traffic enterprise systems (Intesa San Paolo, Aruba, Rai Pubblicità). Framework-agnostic, impact-driven, with hands-on experience across 5 countries. Doesn't deliver slide decks — gets inside the business, understands the real problem, builds the solution and runs it.",
    location: "Turin, Italy",
    age: 36,
    avatar: "",
    availability: "available" as "available" | "open" | "not-available",
  },

  // ── Contact & social ───────────────────────────────────────────────────────
  social: [
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/giulio-occhipinti",
      label: "/in/giulio-occhipinti",
    },
    {
      platform: "GitHub",
      url: "https://github.com/julioojospintados",
      label: "julioojospintados",
    },
    {
      platform: "Email",
      url: "mailto:giulio.occhipinti.g@gmail.com",
      label: "giulio.occhipinti.g@gmail.com",
    },
  ] as Social[],

  // ── Languages ─────────────────────────────────────────────────────────────
  languages: [
    { name: "Italian", level: "Native" },
    {
      name: "English",
      level: "B2",
      note: "Intensive course at Callan School, London. Used professionally in international contexts (event host, charity auction MC for a European Burger King event)",
    },
    { name: "Spanish", level: "B1", note: "Work experience in Tulum, Mexico" },
    { name: "French", level: "A2" },
  ] as Language[],

  // ── Work experience (most recent first) ───────────────────────────────────
  experience: [
    {
      company:
        "Internal Project — SME Management Software (Operational Partnering case study)",
      role: "Digital Innovation Consultant & Lead Developer",
      startDate: "2025-09",
      endDate: "present",
      location: "Turin, Italy",
      remote: true,
      description:
        "Complete Operational Partnering case study across three integrated pillars: Technology, Design and Method. Phase 1 — Strategic analysis: mapping business processes and identifying operational bottlenecks before writing a single line of code. Phase 2 — Engine build: MCP (Model Context Protocol) architecture with tools, resources and prompts as APIs for AI agents, natively integrated with VS Code Copilot and Cursor. Phase 3 — Design for non-technical users: simplified UX for internal operators, designed to reduce onboarding time and operational error. Phase 4 — Agile delivery: Cursor → GitLab CI/CD → automated deploy pipeline, 1–2 week sprints with a measured impactScore at every release, team autonomous at end of engagement.",
      highlights: [
        "Analyse business processes as the starting point — zero code written before understanding the real problem",
        "Design an MCP architecture with tools, resources and prompts as APIs for AI agents — native integration with VS Code Copilot and Cursor",
        "Design simplified UX for non-technical operators: 40% reduction in onboarding time for new workflows",
        "Automate the Cursor → GitLab CI/CD → deploy pipeline with no manual intervention",
        "Apply lean Agile to the SME context: 1–2 week sprints, business-oriented backlog, retrospectives with a real impactScore at every release",
        "Reduce average development time by 80% through AI-augmented workflow (project still in progress)",
      ],
      skills: [
        "MCP",
        "TypeScript",
        "Node.js",
        "Hono",
        "Zod",
        "GitLab CI/CD",
        "Scrum",
        "AI Orchestration",
        "Cursor",
        "GitHub Copilot",
      ],
      tags: ["tech", "human", "ai-orchestration"],
    },
    {
      company: "Digital CV — Open Source AI-Augmented Project",
      role: "AI Workflow Designer & Full-Stack Developer",
      startDate: "2024-11",
      endDate: "present",
      location: "Turin, Italy",
      remote: true,
      description:
        "Design and development of an interactive CV as a systematic proving ground for an end-to-end AI-augmented workflow. The entire cycle — architecture, UI, GSAP animations, MCP server, HTTP API with Hono — was built with GitHub Copilot and Claude as operational co-pilots, applying structured Prompt Engineering at every phase: specification, review, debugging, refactoring. The result is a two-layer system: an Astro + Lit site for the visual CV, and an MCP server that exposes CV data as an API for AI agents. The project is also a live demonstration that a solo developer, with AI as a force multiplier, can produce in weeks what a team would need months to deliver.",
      highlights: [
        "Design an MCP architecture with tools, resources and prompt templates that expose CV data as an API for AI agents (VS Code Copilot, Claude Desktop)",
        "Build an Astro + Lit site with advanced GSAP animations: narrative preloader, SVG sine wave hold effect, distortion filter via feTurbulence",
        "Build a complete AI-augmented workflow with GitHub Copilot and Claude — zero boilerplate written by hand",
        "Develop a Hono HTTP server with OpenAPI spec, Zod validation and automated tests with Vitest",
        "Structure Prompt Engineering with skill files, agent instructions and reusable slash prompts — the AI knows the project like a senior team member",
        "Deliver in 5 days with AI workflow — traditional estimate: 1+ month. –70% development time, test coverage >80%, Awwwards-level UI quality",
      ],
      skills: [
        "MCP Protocol",
        "Prompt Engineering",
        "GitHub Copilot",
        "Claude",
        "Cursor",
        "Astro",
        "Lit",
        "GSAP",
        "TypeScript",
        "Hono",
        "Zod",
        "Vitest",
      ],
      tags: ["tech", "ai-orchestration"],
    },
    {
      company: "ALTEN Italia",
      role: "Senior Frontend Developer",
      startDate: "2019-07",
      endDate: "present",
      location: "Turin, Italy",
      remote: false,
      description:
        "Enterprise systems in banking and technology operate at scale and demand interfaces that are both architecturally solid and usable by millions of people. I designed design systems, WebComponent libraries and microfrontend architectures for Intesa San Paolo and Aruba — every solution built to withstand time, stack changes and unexpected growth.",
      highlights: [
        "Lead as Tech Lead and Scrum Master the Aruba Design System team (3+ years, 30+ people): sprint coordination, systematic code reviews and technical roadmap of a library with over 100 WebComponents adopted cross-product",
        "Contribute to Intesa San Paolo digital products in a 50+ person team: enterprise-scale Angular architecture, shared standards and code review processes",
        "Deliver an enterprise application with microfrontend and microservices architecture, with advanced state management via NGRX",
        "Introduce systematic unit testing with Jest, with direct impact on release stability and code coverage",
        "Develop a brand interface in Angular with GraphQL integration for dynamic data access",
      ],
      skills: [
        "Angular",
        "Lit",
        "TypeScript",
        "HTML5",
        "SCSS",
        "RXJS",
        "NGRX",
        "WebComponents",
        "GraphQL",
        "Bootstrap",
        "Material Design",
        "Jest",
      ],
    },
    {
      company: "Music Agency (collaboration)",
      role: "Collaborator — Tour Manager & Digital Strategist",
      startDate: "2023-01",
      endDate: "2024-12",
      location: "Italy",
      remote: true,
      description:
        "External collaboration with an Italian music agency in a dual capacity: booking and tour management for the roster artists, combined with a strategic contribution to digital communications. I brought my competencies in UX, content strategy and AI tools to optimise existing workflows — without disrupting the agency's operations, but making them more efficient.",
      highlights: [
        "Grow follower count by 100% with a highly targeted audience (musicians, record labels, agents, promoters) — organic and qualitative, not pure volume",
        "Organise a live event at Arci Bellezza in Milan: venue coordination, artist logistics and event communications from start to finish",
        "Develop a digital growth plan with a dedicated Spotify playlist proposal to increase organic engagement for roster artists",
        "Coordinate concert booking: venue research, promoter negotiation, contract management and event timelines",
        "Build and maintain a structured contact list (promoters, venues, agents, media) to streamline the booking process",
        "Produce communication materials (copy, emails, artist presentations) with AI support to reduce turnaround time",
      ],
      skills: [
        "Booking",
        "Tour management",
        "Event management",
        "Digital communication",
        "Content Strategy",
        "Copywriting",
        "Instagram Marketing",
        "Spotify Marketing",
        "Music business",
        "Project management",
      ],
      tags: ["creative", "management"],
    },
    {
      company: "Freelance",
      role: "Videographer – High-End Weddings",
      startDate: "2022-01",
      endDate: "present",
      location: "Tuscany, Italy",
      remote: false,
      description:
        "Video production and direction for high-end Indian weddings in Tuscany. A sector demanding extreme attention to detail, complex logistics management and international aesthetic sensibility.",
      highlights: [
        "Direct video for ceremonies with hundreds of international guests",
        "Manage crew in multicultural and multi-day event contexts",
        "Deliver full post-production: color grading, narrative editing, in premium formats",
      ],
      skills: [
        "Videography",
        "Direction",
        "Post-production",
        "Color grading",
        "Logistics management",
      ],
    },
    {
      company: "ForgeLab",
      role: "Frontend Developer",
      startDate: "2021-04",
      endDate: "2022-03",
      location: "Los Angeles, USA",
      remote: true,
      description:
        "At the height of the pandemic, US healthcare systems needed digital tools that could be built in weeks, not years. I contributed fully remotely — from Turin with a Los Angeles-based team — to an application for managing and visualising Covid-19 data in US hospital facilities. Concrete proof that an effective frontend can become critical infrastructure in a global crisis.",
      highlights: [
        "Develop React dashboards for monitoring and managing Covid-19 data in US hospitals",
        "Refactor CSS with BEM pattern on a 20,000-line codebase: 800 duplicate lines removed, improved maintainability and presentation layer consistency",
        "Integrate REST APIs and backend systems for real-time clinical data visualisation",
        "Collaborate fully remotely with a cross-cultural USA/Italy team using Agile methodology",
      ],
      skills: [
        "React",
        "Angular",
        "GraphQL",
        "Bootstrap",
        "Material Design",
        "REST API",
        "Agile",
      ],
    },
    {
      company: "Consoft",
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "2021-03",
      location: "Turin, Italy",
      remote: false,
      description:
        "Internal processes at media and banking organisations often live inside rigid, poorly ergonomic legacy systems. I designed and developed management applications for Rai Pubblicità and Intesa San Paolo — every tool delivered reduced daily operational friction for end users, transforming slow procedures into fluid workflows.",
      highlights: [
        "Develop internal management applications for Rai Pubblicità with Angular, Spring and Bootstrap",
        "Develop a document and revision management tool for Intesa San Paolo via JSF",
        "Translate complex business requirements into interfaces usable by non-technical operators",
      ],
      skills: [
        "Angular",
        "Spring",
        "JSF",
        "Java",
        "SQL",
        "Bootstrap",
        "HTML5",
        "SCSS",
      ],
    },
    {
      company: "Satispay",
      role: "External Collaborator",
      startDate: "2018-06",
      endDate: "2019-06",
      location: "Milan, Italy",
      remote: false,
      description:
        "External collaboration with Satispay, one of the most relevant fintech scale-ups in the Italian market. A fast-growth context where every contribution had to be immediate and impact-oriented — and where I consolidated the habit of working in high-velocity environments with still-evolving processes.",
      highlights: [],
      skills: ["Fintech", "Startup mindset", "Digital communication"],
    },
    {
      company: "Cultural festivals and events",
      role: "MC & Live Host",
      startDate: "2015-01",
      endDate: "present",
      location: "Italy",
      remote: false,
      description:
        "Presenter and moderator for events, cultural festivals and live shows across Italy. Theatre improvisation skills applied to manage the stage, the audience and unexpected situations with composure and authority.",
      highlights: [
        "Host multidisciplinary cultural festivals (music, art, theatre)",
        "Moderate panels and talks with international guests",
        "Manage real-time crises on stage using applied improvisation training",
      ],
      skills: [
        "Public speaking",
        "Improvisation",
        "Moderation",
        "Hosting",
        "Audience management",
      ],
    },
    {
      company: "Freelance",
      role: "Photographer",
      startDate: "2009-10",
      endDate: "present",
      location: "Turin, Italy",
      remote: false,
      description:
        "Continuous freelance photography practice alongside professional roles, with projects in Italy, Tanzania and beyond.",
      highlights: [],
      skills: ["Photography", "Editing", "Post-production"],
    },
    {
      company: "Corriere di Chieri",
      role: "Freelance Journalist",
      startDate: "2014-09",
      endDate: "2017-06",
      location: "Chieri, Turin",
      remote: false,
      description:
        "Every article is an exercise in listening, synthesis and storytelling within strict constraints. I collaborated as a writer for the Corriere di Chieri, covering cultural events and local news — and I refined the ability to transform raw information into stories people want to read. A skill I apply daily in copy, technical documentation and product storytelling.",
      highlights: [],
      skills: ["Journalism", "Writing", "Editing", "Editorial work"],
    },
    {
      company: "Artiversum – Cultural Association",
      role: "Event Organiser",
      startDate: "2017-01",
      endDate: "2018-05",
      location: "Turin, Italy",
      remote: false,
      description:
        "Co-founder and organiser of the Square Festival in the Quadrilatero Romano district of Turin, a multidisciplinary cultural event (music, theatre, visual arts) conceived and delivered in 6 months with around 100 people involved across staff, artists and collaborators. Responsible for the theatre section: selection of shows, coordination with theatre companies and scheduling within the festival calendar.",
      highlights: [
        "Co-found the Square Festival: from concept to delivery in 6 months, ~100 people involved across staff and artists",
        "Lead the theatre section: research and select shows, negotiate with companies and schedule within the festival programme",
      ],
      skills: ["Event management", "Communication", "Coordination"],
    },
    {
      company: "FreeGinevro / Immaginazione e Lavoro",
      role: "Graphic Designer",
      startDate: "2017-06",
      endDate: "2018-10",
      location: "Turin, Italy",
      remote: false,
      description:
        "Visual communication is problem solving applied to aesthetics: every brief is an attention problem to solve in seconds. I created visual materials and brand identity assets for local clients, combining technical graphic design training with an aesthetic sensibility developed through years of photography — and each project reinforced the link between strategic thinking and creative production.",
      highlights: [
        "Design graphic materials and brand identity for clients in the local and cultural sector",
        "Apply visual hierarchy and typography principles to maximise communicative impact",
      ],
      skills: [
        "Graphic design",
        "Brand identity",
        "Adobe Suite",
        "Typography",
        "Visual design",
      ],
    },
    {
      company: "Mondadori Group",
      role: "Sales Assistant",
      startDate: "2015-04",
      endDate: "2018-04",
      location: "Turin, Italy",
      remote: false,
      description:
        "Sales and customer consultancy at Mondadori Store, Area 12, Turin. Management of the books section and customer support.",
      highlights: [],
      skills: ["Customer service", "Sales", "Department management"],
    },
    {
      company: "None Teatro",
      role: "Theatre and Improvisation Teacher",
      startDate: "2016-09",
      endDate: "2020-02",
      location: "None, Turin",
      remote: false,
      description:
        "Theatre improvisation can only be taught by someone who already knows how to inhabit uncertainty. I led courses for None Teatro students, transmitting the 'Yes, and...' method as a practice of active listening and collective building — and each session sharpened my ability to read people's needs quickly and adapt my communication register in real time.",
      highlights: [
        "Deliver improvisation and theatre courses for students at different levels",
        "Apply the 'Yes, and...' method as a pedagogical tool to develop creativity and problem solving",
      ],
      skills: [
        "Teaching",
        "Theatre improvisation",
        "Public speaking",
        "Facilitation",
        "Creative pedagogy",
      ],
    },
    {
      company: "B-Teatro",
      role: "AV Technician and Actor",
      startDate: "2014-10",
      endDate: "2018-02",
      location: "Turin, Italy",
      remote: false,
      description:
        "Technical management of audio and lighting for theatrical productions. Participation as actor and improviser in shows in Italy and Luxembourg.",
      highlights: [
        "Perform in theatre improvisation shows in Italy and Luxembourg",
      ],
      skills: [
        "Technical direction",
        "Audio",
        "Lighting",
        "Acting",
        "Theatre improvisation",
      ],
    },
    {
      company: "Bestar Hotel",
      role: "Front Desk Receptionist",
      startDate: "2012-12",
      endDate: "2013-06",
      location: "Tulum, Mexico",
      remote: false,
      description:
        "Front desk management at an international resort in Tulum, serving a predominantly English- and Spanish-speaking clientele.",
      highlights: [],
      skills: ["Hospitality", "English", "Spanish", "Customer service"],
    },
    {
      company: "UCI Cinemas",
      role: "Cinema Operator",
      startDate: "2013-07",
      endDate: "2015-03",
      location: "Turin, Italy",
      remote: false,
      description:
        "At one of Italy's most-visited cinema chains, every day brought hundreds of guests with different expectations. I managed theatre operations, box office and front-of-house — and learned that every touchpoint with the public, however brief, builds or breaks an experience. A lesson I carry into every UX project.",
      highlights: [],
      skills: ["Customer service", "Audience management", "Theatre operations"],
    },
    {
      company: "Starbucks Coffee",
      role: "Barista",
      startDate: "2011-01",
      endDate: "2011-06",
      location: "London, United Kingdom",
      remote: false,
      description:
        "Operational role at a Starbucks location in London, serving an international clientele.",
      highlights: [],
      skills: ["English", "Teamwork", "Customer service"],
    },
    {
      company: "Sogni Animazione",
      role: "Photographer",
      startDate: "2009-11",
      endDate: "2010-04",
      location: "Zanzibar, Tanzania",
      remote: false,
      description:
        "Head of the photography centre at a tourist entertainment facility in Zanzibar.",
      highlights: [],
      skills: ["Photography", "Tourist entertainment"],
    },
    {
      company: "Metamorfosi / Fun Factory",
      role: "Head of Tourist Entertainment",
      startDate: "2010-05",
      endDate: "2012-09",
      location: "Ravenna and Crotone, Italy",
      remote: false,
      description:
        "Managing an entertainment team at highly seasonal beach resorts means leading in the unpredictable, every single day. I coordinated entertainment programmes and staff management at facilities in Ravenna and Crotone — and discovered that leadership is built through improvisation, not control: a conviction that now shapes my approach to any team effort.",
      highlights: [
        "Coordinate entertainment teams in high-variability, high-pressure seasonal contexts",
        "Design and deliver entertainment programmes for international guests",
      ],
      skills: [
        "Leadership",
        "Team management",
        "Event management",
        "Entertainment",
        "Interpersonal communication",
      ],
    },
    {
      company: "Caveja srl",
      role: "Kitchen Assistant and Bar Operator",
      startDate: "2008-06",
      endDate: "2010-04",
      location: "Turin, Italy",
      remote: false,
      description:
        "Intense operational pace, minimal margin for error and demanding clientele: the kitchen and the bar teach you to work under pressure with precision and no excuses. I managed the counter and supported the kitchen on often late-night shifts — and I carried this operational discipline into every subsequent context, from London to Zanzibar, from the stage to software architecture.",
      highlights: [],
      skills: [
        "Teamwork",
        "Operational management",
        "Customer service",
        "Precision under pressure",
      ],
    },
  ] as WorkExperience[],

  // ── Education ─────────────────────────────────────────────────────────────
  education: [
    {
      institution: "Istituto Europeo di Design (IED)",
      degree: "Master's Degree",
      field: "Digital Communication and Media/Multimedia",
      startDate: "2022-11",
      endDate: "2023-05",
      location: "Turin, Italy",
    },
    {
      institution: "Immaginazione e Lavoro",
      degree: "Specialisation Course",
      field: "Software Development",
      startDate: "2018-11",
      endDate: "2019-04",
      location: "Turin, Italy",
    },
    {
      institution: "Immaginazione e Lavoro",
      degree: "Certificate",
      field: "Graphic Design",
      startDate: "2018-06",
      endDate: "2018-07",
      location: "Turin, Italy",
    },
    {
      institution: "Immaginazione e Lavoro",
      degree: "Certificate",
      field: "Social Media Management",
      startDate: "2018-01",
      endDate: "2018-06",
      location: "Turin, Italy",
    },
    {
      institution: "Istituto Tecnico Turistico Boselli",
      degree: "High School Diploma",
      field: "Tourism and Hospitality",
      startDate: "2011-09",
      endDate: "2016-06",
      location: "Turin, Italy",
      grade: "80/100",
    },
    {
      institution: "Callan School",
      degree: "Intensive English Course",
      field: "English Language",
      startDate: "2010-01",
      endDate: "2010-06",
      location: "Oxford Street, London",
    },
  ] as Education[],

  // ── Certifications ────────────────────────────────────────────────────────
  certifications: [
    {
      name: "Introduction to Agile Development and Scrum",
      issuer: "IBM",
      date: "2026-02",
      credentialId: "L7GZFSYJYMAC",
    },
    {
      name: "UX/UI Design Fundamentals: Usability and Visual Principles",
      issuer: "SkillUp",
      date: "2026-02",
      credentialId: "VELSWBCO2YEL",
    },
    {
      name: "Introduction to UX/UI Design",
      issuer: "IBM",
      date: "2026-01",
      credentialId: "LUL4LSALE01X",
    },
    {
      name: "UX Design Professional Certificate",
      issuer: "IBM",
      date: "2025-01",
      inProgress: true,
    },
    {
      name: "Digital Marketing Specialist",
      issuer: "Istituto Europeo di Design (IED)",
      date: "2023-05",
    },
    {
      name: "Bartending Course",
      issuer: "Ateneo di Bartending Planet One",
      date: "2018-01",
    },
    {
      name: "Theatre Improvisation Course",
      issuer: "B-Teatro",
      date: "2013-01",
    },
  ] as Certification[],

  // ── Technical skills ──────────────────────────────────────────────────────
  technicalSkills: [
    {
      name: "Angular",
      level: "Avanzato",
      icon: "angular",
      mastery: 82,
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "RXJS", type: "technical" },
        { target: "WebComponents", type: "technical" },
        { target: "Bootstrap", type: "technical" },
        { target: "Jest", type: "workflow" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "HTML5",
      level: "Esperto",
      icon: "html5",
      mastery: 95,
      links: [
        { target: "CSS / SCSS", type: "technical" },
        { target: "JavaScript", type: "technical" },
        { target: "Accessibility / WCAG", type: "workflow" },
        { target: "WebComponents", type: "technical" },
      ],
    },
    {
      name: "CSS / SCSS",
      level: "Esperto",
      icon: "css3",
      mastery: 92,
      links: [
        { target: "HTML5", type: "technical" },
        { target: "Bootstrap", type: "technical" },
        { target: "GSAP", type: "workflow" },
        { target: "UX / UI Design", type: "cross-domain" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
      ],
    },
    {
      name: "TypeScript",
      level: "Avanzato",
      icon: "typescript",
      mastery: 85,
      links: [
        { target: "JavaScript", type: "technical" },
        { target: "Angular", type: "technical" },
        { target: "Lit", type: "technical" },
        { target: "Node.js", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
      ],
    },
    {
      name: "JavaScript",
      level: "Esperto",
      icon: "javascript",
      mastery: 90,
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "React", type: "technical" },
        { target: "GSAP", type: "workflow" },
        { target: "Node.js", type: "technical" },
        { target: "WebComponents", type: "technical" },
      ],
    },
    {
      name: "Lit",
      level: "Avanzato",
      icon: "lit",
      mastery: 80,
      links: [
        { target: "WebComponents", type: "technical" },
        { target: "TypeScript", type: "technical" },
        { target: "Angular", type: "technical" },
        { target: "GSAP", type: "workflow" },
        { target: "Astro", type: "workflow" },
      ],
    },
    {
      name: "RXJS",
      level: "Avanzato",
      mastery: 76,
      links: [
        { target: "Angular", type: "technical" },
        { target: "JavaScript", type: "technical" },
        { target: "Node.js", type: "technical" },
        { target: "T-shaped thinking", type: "cross-domain" },
      ],
    },
    {
      name: "NGRX",
      level: "Intermedio",
      links: [
        { target: "Angular", type: "technical" },
        { target: "RXJS", type: "technical" },
        { target: "TypeScript", type: "technical" },
      ],
    },
    {
      name: "WebComponents",
      level: "Avanzato",
      mastery: 82,
      links: [
        { target: "Lit", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "JavaScript", type: "technical" },
        { target: "Angular", type: "technical" },
      ],
    },
    {
      name: "React",
      level: "Intermedio",
      icon: "react",
      mastery: 65,
      links: [
        { target: "JavaScript", type: "technical" },
        { target: "GraphQL", type: "workflow" },
        { target: "Bootstrap", type: "technical" },
        { target: "REST API", type: "workflow" },
      ],
    },
    {
      name: "Git",
      level: "Avanzato",
      icon: "git",
      mastery: 82,
      links: [
        { target: "Node.js", type: "workflow" },
        { target: "REST API", type: "workflow" },
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "Autonomy and ownership", type: "cross-domain" },
      ],
    },
    {
      name: "Bootstrap",
      level: "Avanzato",
      icon: "bootstrap",
      mastery: 78,
      links: [
        { target: "CSS / SCSS", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "Material Design", type: "conceptual" },
        { target: "React", type: "technical" },
      ],
    },
    {
      name: "Material Design",
      level: "Intermedio",
      mastery: 58,
      links: [
        { target: "Bootstrap", type: "technical" },
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "conceptual" },
        { target: "UX / UI Design", type: "cross-domain" },
      ],
    },
    {
      name: "GraphQL",
      level: "Base",
      icon: "graphql",
      mastery: 38,
      links: [
        { target: "REST API", type: "technical" },
        { target: "Node.js", type: "technical" },
        { target: "React", type: "workflow" },
        { target: "SQL", type: "conceptual" },
      ],
    },
    {
      name: "SQL",
      level: "Intermedio",
      mastery: 55,
      links: [
        { target: "REST API", type: "workflow" },
        { target: "Node.js", type: "workflow" },
        { target: "GraphQL", type: "technical" },
      ],
    },
    {
      name: "Jest",
      level: "Intermedio",
      icon: "jest",
      mastery: 62,
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "Angular", type: "technical" },
        { target: "Node.js", type: "workflow" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "Wordpress",
      level: "Base",
      icon: "wordpress",
      mastery: 35,
      links: [
        { target: "SEO", type: "workflow" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "Social media management", type: "cross-domain" },
      ],
    },
    {
      name: "Figma",
      level: "Intermedio",
      icon: "figma",
      mastery: 60,
      links: [
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Material Design", type: "technical" },
        { target: "UX / UI Design", type: "workflow" },
        { target: "Graphic design", type: "cross-domain" },
        { target: "Visily", type: "workflow" },
        { target: "UX Pilot", type: "workflow" },
      ],
    },
    {
      name: "Visily",
      level: "Intermedio",
      mastery: 58,
      links: [
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "UX / UI Design", type: "workflow" },
      ],
    },
    {
      name: "UX Pilot",
      level: "Base",
      mastery: 45,
      links: [
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Figma", type: "workflow" },
      ],
    },
    {
      name: "Google Stitch",
      level: "Base",
      mastery: 38,
      links: [
        { target: "Figma", type: "workflow" },
        { target: "Visily", type: "workflow" },
        { target: "UX / UI Design", type: "workflow" },
        { target: "Prompt Engineering", type: "workflow" },
      ],
    },
    {
      name: "SEO",
      level: "Intermedio",
      mastery: 58,
      links: [
        { target: "SEM", type: "technical" },
        { target: "Digital marketing", type: "cross-domain" },
        { target: "Wordpress", type: "workflow" },
      ],
    },
    {
      name: "SEM",
      level: "Base",
      mastery: 32,
      links: [
        { target: "SEO", type: "technical" },
        { target: "Digital marketing", type: "cross-domain" },
      ],
    },
    {
      name: "UX Research",
      level: "Intermedio",
      mastery: 65,
      links: [
        { target: "Figma", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Accessibility / WCAG", type: "conceptual" },
        { target: "UX / UI Design", type: "workflow" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
      ],
    },
    {
      name: "Wireframing",
      level: "Intermedio",
      mastery: 62,
      links: [
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "workflow" },
        { target: "UX / UI Design", type: "workflow" },
      ],
    },
    {
      name: "Node.js",
      level: "Avanzato",
      icon: "nodedotjs",
      mastery: 80,
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "REST API", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "Hono", type: "technical" },
        { target: "GraphQL", type: "technical" },
      ],
    },
    {
      name: "REST API",
      level: "Avanzato",
      mastery: 82,
      links: [
        { target: "Node.js", type: "technical" },
        { target: "GraphQL", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "Hono", type: "technical" },
        { target: "SQL", type: "workflow" },
      ],
    },
    {
      name: "Accessibility / WCAG",
      level: "Intermedio",
      mastery: 65,
      links: [
        { target: "HTML5", type: "technical" },
        { target: "UX Research", type: "workflow" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "UX / UI Design", type: "cross-domain" },
      ],
    },
    {
      name: "Video editing",
      level: "Intermedio",
      mastery: 55,
      links: [
        { target: "Videography", type: "workflow" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
        { target: "Photography", type: "cross-domain" },
        { target: "Applied creativity", type: "cross-domain" },
      ],
    },
    {
      name: "MCP Protocol",
      level: "Avanzato",
      mastery: 88,
      links: [
        { target: "Node.js", type: "technical" },
        { target: "Prompt Engineering", type: "workflow" },
        { target: "REST API", type: "technical" },
        { target: "Hono", type: "technical" },
        { target: "AI-Augmented Productivity", type: "workflow" },
      ],
    },
    {
      name: "Prompt Engineering",
      level: "Avanzato",
      mastery: 90,
      links: [
        { target: "MCP Protocol", type: "workflow" },
        { target: "AI-Augmented Productivity", type: "workflow" },
        { target: "Node.js", type: "technical" },
        { target: "T-shaped thinking", type: "cross-domain" },
        { target: "GitHub Copilot", type: "workflow" },
        { target: "Google Stitch", type: "workflow" },
      ],
    },
    {
      name: "GitHub Copilot",
      level: "Avanzato",
      icon: "githubcopilot",
      mastery: 88,
      links: [
        { target: "Prompt Engineering", type: "workflow" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "AI-Augmented Productivity", type: "workflow" },
        { target: "TypeScript", type: "technical" },
      ],
    },
    {
      name: "Zed",
      level: "Base",
      mastery: 35,
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "Git", type: "workflow" },
        { target: "GitHub Copilot", type: "workflow" },
      ],
    },
    {
      name: "GSAP",
      level: "Avanzato",
      icon: "greensock",
      mastery: 80,
      links: [
        { target: "JavaScript", type: "technical" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "Lit", type: "workflow" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
        { target: "Applied creativity", type: "cross-domain" },
      ],
    },
    {
      name: "Astro",
      level: "Intermedio",
      icon: "astro",
      mastery: 65,
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "Lit", type: "technical" },
        { target: "Node.js", type: "technical" },
      ],
    },
    {
      name: "Hono",
      level: "Intermedio",
      mastery: 65,
      links: [
        { target: "Node.js", type: "technical" },
        { target: "REST API", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "TypeScript", type: "technical" },
      ],
    },
  ] as Skill[],

  // ── Soft skills ───────────────────────────────────────────────────────────
  softSkills: [
    {
      name: "Effective communication",
      description:
        "Over 10 years of public event hosting and theatre training: ability to convey complex messages clearly, engagingly and calibrated to any type of audience.",
      links: [
        { target: "Public speaking", type: "cross-domain" },
        { target: "Theatre and improvisation", type: "conceptual" },
        { target: "Relational intelligence", type: "conceptual" },
        { target: "Writing and poetry", type: "cross-domain" },
      ],
    },
    {
      name: "Applied creativity",
      description:
        "Multidisciplinary background (software development, photography, theatre, writing, events) that generates original approaches and unexpected solutions even in technical contexts.",
      links: [
        { target: "Aesthetic sensibility", type: "conceptual" },
        { target: "Lateral problem solving", type: "conceptual" },
        { target: "Photography", type: "cross-domain" },
        { target: "Theatre and improvisation", type: "cross-domain" },
        { target: "Graphic design", type: "cross-domain" },
        { target: "GSAP", type: "cross-domain" },
      ],
    },
    {
      name: "Cultural adaptability",
      description:
        "Work experience across 5 countries (Italy, UK, Mexico, Tanzania, Luxembourg), each with a profoundly different organisational, linguistic and cultural context.",
      links: [
        { target: "Relational intelligence", type: "conceptual" },
        { target: "Resilience and adaptive thinking", type: "conceptual" },
        { target: "Public speaking", type: "cross-domain" },
        { target: "Event management", type: "cross-domain" },
      ],
    },
    {
      name: "Relational intelligence",
      description:
        "Natural ability to build trust with colleagues, clients and stakeholders, developed in high-variability environments: from international customer service to cross-functional team management.",
      links: [
        { target: "Effective communication", type: "conceptual" },
        { target: "Cultural adaptability", type: "conceptual" },
        { target: "Event management", type: "cross-domain" },
        { target: "Public speaking", type: "cross-domain" },
      ],
    },
    {
      name: "Lateral problem solving",
      description:
        "Analytical and cross-domain approach to problems: experience in complex enterprise environments (microfrontend architectures, legacy systems) and high-stress live situations (technical direction, event hosting).",
      links: [
        { target: "Applied creativity", type: "conceptual" },
        { target: "T-shaped thinking", type: "conceptual" },
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "MCP Protocol", type: "cross-domain" },
      ],
    },
    {
      name: "Autonomy and ownership",
      description:
        "Independent management of parallel projects (freelance photography, videography, strategic consultancy) with the ability to set priorities, meet deadlines and deliver results without direct supervision.",
      links: [
        { target: "Resilience and adaptive thinking", type: "conceptual" },
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "T-shaped thinking", type: "conceptual" },
        { target: "Git", type: "cross-domain" },
      ],
    },
    {
      name: "Resilience and adaptive thinking",
      description:
        "Clarity under pressure trained through theatre technical direction, live event hosting and the management of enterprise systems in production. The unexpected is treated as data to learn from.",
      links: [
        { target: "Autonomy and ownership", type: "conceptual" },
        { target: "Cultural adaptability", type: "conceptual" },
        { target: "Theatre and improvisation", type: "cross-domain" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "Active listening",
      description:
        "Real presence in conversation: asking the right questions before responding, recognising what goes unsaid, maintaining sustained attention even through long technical sessions. The foundation of every effective consulting process.",
      links: [
        { target: "Relational intelligence", type: "conceptual" },
        { target: "Effective communication", type: "conceptual" },
        { target: "Theatre and improvisation", type: "cross-domain" },
      ],
    },
    {
      name: "Assertiveness",
      description:
        "Ability to express technical and strategic positions clearly and respectfully, even in contexts of disagreement. Constructive dialogue as a tool for advancing the project, not creating conflict.",
      links: [
        { target: "Effective communication", type: "conceptual" },
        { target: "Autonomy and ownership", type: "conceptual" },
        { target: "Lateral problem solving", type: "cross-domain" },
      ],
    },
    {
      name: "Aesthetic sensibility",
      description:
        "Over 15 years of photographic practice and visual production translate into more effective UI choices, with a direct impact on brand perception and the quality of the user experience.",
      links: [
        { target: "Applied creativity", type: "conceptual" },
        { target: "Photography", type: "cross-domain" },
        { target: "Graphic design", type: "cross-domain" },
        { target: "UX / UI Design", type: "cross-domain" },
        { target: "CSS / SCSS", type: "cross-domain" },
        { target: "GSAP", type: "cross-domain" },
      ],
    },
    {
      name: "T-shaped thinking",
      description:
        "Ability to bridge engineering (Frontend), design (UX/UI) and marketing (SEO/SEM), reducing communication silos and accelerating the time-to-market of digital products.",
      links: [
        { target: "Lateral problem solving", type: "conceptual" },
        { target: "Autonomy and ownership", type: "conceptual" },
        { target: "AI-Augmented Productivity", type: "cross-domain" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
  ] as SoftSkill[],

  // ── Transversal skills ────────────────────────────────────────────────────
  transversalSkills: [
    {
      name: "Event management",
      description:
        "Conception and production of multidisciplinary cultural festivals (Square Festival, Artiversum – Quadrilatero Romano, Turin): artist coordination, logistics and institutional communications.",
      links: [
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "Relational intelligence", type: "cross-domain" },
        { target: "Public speaking", type: "workflow" },
        { target: "Effective communication", type: "workflow" },
      ],
    },
    {
      name: "Photography",
      description:
        "Continuous freelance practice since 2009, with an international portfolio (Tanzania, Mexico, Italy). Specialisation in reportage and portraiture.",
      links: [
        { target: "Applied creativity", type: "cross-domain" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
        { target: "Videography", type: "technical" },
        { target: "Video editing", type: "workflow" },
      ],
    },
    {
      name: "Theatre and improvisation",
      description:
        "Training and stage work with B-Teatro (2013–2020), performances in Italy and Luxembourg. Improvisation trains active listening, rapid thinking and the ability to turn failure into a resource.",
      links: [
        { target: "Public speaking", type: "workflow" },
        { target: "Effective communication", type: "workflow" },
        { target: "Resilience and adaptive thinking", type: "cross-domain" },
        { target: "Agile Methodology", type: "conceptual" },
      ],
    },
    {
      name: "Public speaking",
      description:
        "Hosting of festivals, panels and talks with international guests since 2015. Ability to manage diverse audiences and unexpected live situations with composure and authority.",
      links: [
        { target: "Theatre and improvisation", type: "workflow" },
        { target: "Effective communication", type: "workflow" },
        { target: "Event management", type: "workflow" },
        { target: "Relational intelligence", type: "conceptual" },
      ],
    },
    {
      name: "Graphic design",
      description:
        "Specialist training (Immaginazione e Lavoro, 2018) with ongoing application in the production of visual materials for events, brand and digital communications.",
      links: [
        { target: "Aesthetic sensibility", type: "cross-domain" },
        { target: "Applied creativity", type: "cross-domain" },
        { target: "Figma", type: "cross-domain" },
        { target: "UX / UI Design", type: "cross-domain" },
        { target: "Social media management", type: "workflow" },
      ],
    },
    {
      name: "Social media management",
      description:
        "Specialist training (Immaginazione e Lavoro, 2018) and practical application in editorial management for cultural event channels and the music agency.",
      links: [
        { target: "Digital marketing", type: "workflow" },
        { target: "SEO", type: "workflow" },
        { target: "Effective communication", type: "cross-domain" },
        { target: "Music industry", type: "workflow" },
      ],
    },
    {
      name: "Digital marketing",
      description:
        "IED Master in Digital Communication (2022–2023): content strategy, SEO/SEM, analytics, campaign management and brand storytelling in B2C and B2B contexts.",
      links: [
        { target: "Social media management", type: "workflow" },
        { target: "SEO", type: "technical" },
        { target: "SEM", type: "technical" },
        { target: "Writing and poetry", type: "cross-domain" },
        { target: "Music industry", type: "workflow" },
      ],
    },
    {
      name: "UX / UI Design",
      description:
        "IBM UX Design Professional Certificate in progress: User Research, Information Architecture, Wireframing and high-fidelity prototyping with Figma.",
      links: [
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
        { target: "Graphic design", type: "conceptual" },
        { target: "Accessibility / WCAG", type: "workflow" },
      ],
    },
    {
      name: "Videography",
      description:
        "Direction and video production for high-end weddings in Tuscany: crew management in multicultural contexts, color grading and narrative editing for an international premium market.",
      links: [
        { target: "Photography", type: "technical" },
        { target: "Applied creativity", type: "cross-domain" },
        { target: "Video editing", type: "workflow" },
        { target: "Aesthetic sensibility", type: "cross-domain" },
      ],
    },
    {
      name: "Agile Methodology",
      description:
        "Scrum and Kanban applied in distributed enterprise teams (ALTEN, Intesa San Paolo, Aruba) and in personal creative projects. Hands-on experience in sprint planning, retrospectives and backlog management.",
      links: [
        { target: "T-shaped thinking", type: "cross-domain" },
        { target: "Autonomy and ownership", type: "cross-domain" },
        { target: "Theatre and improvisation", type: "conceptual" },
        { target: "Event management", type: "cross-domain" },
        { target: "Git", type: "workflow" },
        { target: "Jest", type: "workflow" },
      ],
    },
    {
      name: "AI-Augmented Productivity",
      description:
        "Systematic integration of GitHub Copilot, ChatGPT and Midjourney into development, UX research and content production workflows. AI expands quality and speed without replacing critical judgement.",
      links: [
        { target: "Prompt Engineering", type: "workflow" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "T-shaped thinking", type: "cross-domain" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "Writing and poetry",
      description:
        "Award-winning author at international level (Italy and Australia). Creative writing practice translates into more effective copy, product storytelling and strategic synthesis skills.",
      links: [
        { target: "Effective communication", type: "cross-domain" },
        { target: "Applied creativity", type: "cross-domain" },
        { target: "Public speaking", type: "workflow" },
        { target: "Digital marketing", type: "cross-domain" },
      ],
    },
    {
      name: "Music industry",
      description:
        "Coordination between artists, digital aggregators and streaming platforms (Spotify, YouTube Music). Experience in release management, strategic communication and editorial project management (2023–2024).",
      links: [
        { target: "Event management", type: "workflow" },
        { target: "Social media management", type: "workflow" },
        { target: "Digital marketing", type: "workflow" },
        { target: "Effective communication", type: "cross-domain" },
      ],
    },
  ] as TransversalSkill[],

  // ── Methodology & Mindset ─────────────────────────────────────────────────
  methodology: [
    {
      name: "Agile & Iterative Development",
      description:
        "Every project is an opportunity for incremental learning. Short delivery cycles reduce risk, keep focus on business objectives and allow rapid adaptation to feedback. I have applied this mindset on enterprise systems with distributed teams and on creative projects managed independently.",
    },
    {
      name: "AI as a Value Multiplier",
      description:
        "Artificial intelligence is integrated as an extension of the cognitive process, not a shortcut. GitHub Copilot for development velocity, ChatGPT for rapid conceptual prototyping, Midjourney for visual exploration. The goal is to reduce time on repetitive tasks and expand the solution space during creative phases.",
    },
    {
      name: "T-shaped Problem Solving",
      description:
        "A background spanning engineering, design and marketing makes it possible to identify solution patterns that mono-disciplinary teams cannot see. This cross-domain perspective is the key professional differentiator: not just executing, but identifying the right problem to solve.",
    },
    {
      name: "Framework-Agnostic Thinking",
      description:
        "Exposure to Angular, React, Lit, WebComponents, Astro and heterogeneous creative paradigms has developed the ability to choose the tool based on the problem — not the other way around. This avoids technological solutionism and ensures more solid, maintainable architectures oriented towards long-term value.",
    },
  ] as MethodologyItem[],

  // ── Growth areas (presented as evolution paths) ────────────────────────────
  growthAreas: [
    {
      name: "Multifaceted curiosity",
      reframe:
        "The natural tendency to explore diverse fields, while requiring conscious focus management, is the root of a genuinely framework-agnostic profile. It is not about scattering attention, but an adaptive strategy: every skill acquired becomes a new angle from which to read technical and creative problems. It is the source of the lateral thinking that generates solutions those with only one domain cannot see.",
    },
    {
      name: "Parallel thinking",
      reframe:
        "The ability to hold multiple scenarios and non-linear connections active simultaneously — sometimes perceived as a lack of linearity — is precisely what generates system design solutions that mono-disciplinary teams cannot see. In complex architecture design or debugging, it enables identifying the right problem to solve, not just the most visible symptom.",
    },
    {
      name: "Emotional communication",
      reframe:
        "Natural attentiveness to relational dynamics and people's emotional states — which may seem distant from the technical world — is the primary accelerator of delivery in distributed teams and with non-technical stakeholders. It reduces friction in code reviews, facilitates the collection of real (undeclared) requirements and builds client trust faster than any presentation.",
    },
  ] as GrowthArea[],

  // ── Personal projects ─────────────────────────────────────────────────────
  projects: [
    {
      name: "Digital CV — Open Source AI-Augmented Project",
      description:
        "Interactive open source CV built entirely with an AI-augmented workflow (GitHub Copilot + Claude). A two-layer system: Astro + Lit site with advanced GSAP animations and SVG wave effects, and an MCP server that exposes CV data as an API for AI agents. A live demonstration of the method: one developer producing in weeks what a team would need months to deliver.",
      url: "https://github.com/julioojospintados/digital-cv",
      repoUrl: "https://github.com/julioojospintados/digital-cv",
      date: "2024-11",
      tags: [
        "Astro",
        "Lit",
        "GSAP",
        "MCP Protocol",
        "TypeScript",
        "Hono",
        "Prompt Engineering",
        "GitHub Copilot",
      ],
    },
    {
      name: 'Film "Double"',
      description:
        'Deuteragonist in the short film "Double", presented at the Independent Film Festival in San Francisco in 2022.',
      date: "2022-01",
      tags: ["Cinema", "Acting"],
    },
    {
      name: "Covid-19 Data Management App",
      description:
        "Development with React of an application for the management and visualisation of Covid-19 data across multiple US hospitals.",
      date: "2022-01",
      tags: ["React", "Healthcare", "USA"],
    },
    {
      name: "WebComponents Design System for Aruba",
      description:
        "WebComponents UI library built with Lit, HTML and SASS for Aruba, reusable across products.",
      date: "2022-06",
      tags: ["Lit", "WebComponents", "Design System", "Aruba"],
    },
    {
      name: "Square Festival – Artiversum",
      description:
        "Co-founder and organiser of the Square Festival in the Quadrilatero Romano district of Turin, a multidisciplinary cultural event.",
      date: "2017-05",
      tags: ["Event management", "Culture", "Turin"],
    },
    {
      name: "Invented word — Turin International Book Fair",
      description:
        "I created and publicly presented a new word — with its roots, sound and meaning — at the Turin International Book Fair. An extreme exercise in linguistic and poetic synthesis: the same capacity for maximum impact with minimum means that I apply every day in clean code and product communication.",
      date: "2019-05",
      tags: ["Poetry", "Linguistics", "Creativity", "Book Fair"],
    },
    {
      name: "Internationally awarded poetry",
      description:
        "Author of poems awarded in national and international competitions (Italy and Australia). Creative writing and software development share a common root: both require synthesis, formal precision and the ability to generate meaning within explicit constraints.",
      tags: ["Poetry", "Creative writing", "International awards"],
    },
    {
      name: "The 'Moustache Paper' — featured in La Stampa",
      description:
        "A school paper on moustaches, an involuntary case of marketing and anthropological curiosity, ends up on the pages of La Stampa. Practical proof that originality of thought, even in youth and seemingly marginal contexts, can generate unexpected public attention — and that narrative matters more than format.",
      tags: ["Storytelling", "Involuntary marketing", "Media", "Writing"],
    },
  ] as Project[],

  // ── Interests ─────────────────────────────────────────────────────────────
  interests: [
    "Photography",
    "Theatre and improvisation",
    "Writing and poetry",
    "Independent cinema",
    "Travel and international cultures",
    "Open source",
  ] as string[],

  // ── Social impact ─────────────────────────────────────────────────────────
  socialImpact: [
    {
      name: "Crisis intervention",
      description:
        "Direct intervention in a suicide risk situation: signal recognition, active listening and guidance towards professional support. One of the most formative experiences in terms of full presence and the capacity to sit with the unexpected without fleeing from emotional complexity. 'Yes, and...' in its most radical form: accepting the other person's reality and adding presence.",
      tags: [
        "Empathy",
        "Active listening",
        "Crisis management",
        "Human skills",
      ],
    },
    {
      name: "Legal assistance for an immigrant in difficulty",
      description:
        "Concrete support for a Bangladeshi young man struggling with the Italian legal system: navigation through the bureaucratic maze, translation of the normative context and connection with available resources. The 'Yes, and...' applied to real life: accepting the situation without stepping back and adding value where others walk past.",
      tags: [
        "Solidarity",
        "Interculturalism",
        "Assistance",
        "Civic engagement",
      ],
    },
    {
      name: "Public intervention in defence of a third party",
      description:
        "Prompt intervention in a street danger situation in defence of a third party. Theatre improvisation teaches you to stay in the moment without being paralysed: this capability, applied off-stage, translates into clarity and action when others hesitate. A form of situational leadership that cannot be learned from books.",
      tags: ["Civic courage", "Situational leadership", "Rapid thinking"],
    },
    {
      name: "Charity auction MC at a European corporate event (Burger King)",
      description:
        "Ran a charity auction in English during a European Burger King event with international participants. Managing the audience, auction rhythm and live communication in a foreign language under pressure — a context where theatre improvisation and English fluency merged into a single live performance.",
      tags: [
        "Professional English",
        "Public speaking",
        "Event hosting",
        "Corporate events",
      ],
    },
  ] as SocialImpactItem[],

  // ── AI Workflow ───────────────────────────────────────────────────────────
  aiWorkflow: [
    {
      tool: "GitHub Copilot",
      title: "Angular enterprise development acceleration",
      desc: "NGRX boilerplate generation, Jest testing and repetitive architectural patterns, with critical validation of output.",
      impact: "-87% boilerplate",
      tags: "tech",
    },
    {
      tool: "ChatGPT / Claude",
      title: "Prompt Engineering for UX prototyping",
      desc: "User personas, navigation flows and test scenarios from text briefs. Applied during the IBM UX Research phase.",
      impact: "-90% discovery time",
      tags: "creative tech",
    },
    {
      tool: "Claude / GPT-4",
      title: "Code review and Angular architecture",
      desc: "Code smell analysis, refactoring and microfrontend architecture review with LLMs as pair reviewers.",
      impact: "-60% debug time",
      tags: "tech",
    },
    {
      tool: "Midjourney",
      title: "Visual exploration for UX/UI briefs",
      desc: "Fast moodboards and visual concepts to align stakeholders before wireframing, avoiding costly iterations.",
      impact: "-70% alignment cycles",
      tags: "creative",
    },
    {
      tool: "AI Tools",
      title: "Copywriting and technical documentation",
      desc: "SEO copy, A/B variants for landing pages and technical documentation from annotated code.",
      impact: "+3x content velocity",
      tags: "creative",
    },
    {
      tool: "Figma Make",
      title: "From brief to interactive prototype in minutes",
      desc: "Generating screens and navigation flows directly in Figma from natural language descriptions. Applied during rapid prototyping phases before structured wireframing.",
      impact: "-75% prototyping time",
      tags: "creative tech",
    },
  ] as AiWorkflowItem[],

  // ── Value flows ───────────────────────────────────────────────────────────
  valueFlows: [
    {
      name: "End-to-End Digital Product",
      description:
        "From business need to deployment: the full cycle combining user research, iterative design, development and measurable delivery.",
      steps: [
        "UX Research",
        "Wireframing",
        "Agile Methodology",
        "Angular",
        "TypeScript",
        "CSS / SCSS",
        "Accessibility / WCAG",
        "REST API",
        "Git",
        "MCP Protocol",
      ],
    },
    {
      name: "Team Delivery & Agile Leadership",
      description:
        "How I take a team from 'operational chaos' to 'conscious autonomy': improvisation as methodology, Agile as structure, communication as the binding agent.",
      steps: [
        "Theatre and improvisation",
        "Agile Methodology",
        "Effective communication",
        "T-shaped thinking",
        "Autonomy and ownership",
        "Git",
      ],
    },
    {
      name: "Strategic Product Communication",
      description:
        "From copy to campaign: the narrative flow that transforms a technical product into a story the client actually wants to hear.",
      steps: [
        "Writing and poetry",
        "Public speaking",
        "Aesthetic sensibility",
        "Graphic design",
        "Digital marketing",
        "Social media management",
      ],
    },
    {
      name: "AI-First Implementation Workflow",
      description:
        "The GO Automated method: every repeatable process becomes an agent. From AI architecture to zero-touch deployment in 1–2 week sprints.",
      steps: [
        "Prompt Engineering",
        "MCP Protocol",
        "Node.js",
        "Hono",
        "REST API",
        "AI-Augmented Productivity",
        "Agile Methodology",
      ],
    },
  ] as ValueFlow[],

  // ── Feedbacks — parked data for a future UI section ────────────────────
  // Not rendered. Descriptive keywords from people who have worked with Giulio.
  feedbacks: [
    {
      name: "Lorenzo Rando",
      role: "Recruiter / Head Hunter",
      keywords: [
        "articulate",
        "humour",
        "attentiveness",
        "active listening",
        "empathy",
        "creativity",
        "respect",
        "loyalty",
        "reliability",
        "sincerity",
        "curiosity",
        "assertiveness",
      ],
    },
  ] as Feedback[],
} as const satisfies Record<string, unknown>;

export type CvDataEn = typeof cvDataEn;
