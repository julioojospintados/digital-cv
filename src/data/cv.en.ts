/**
 * cv.en.ts — English version of the CV data.
 *
 * Mirrors the structure of cv.ts exactly.
 * Import cvDataEn wherever an English locale is needed.
 */

import { cvData } from "./cv.js";
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
  AiWorkflowItem,
  ValueFlow,
  Feedback,
} from "./cv.js";

/**
 * Skill metadata that is NOT translatable — it describes the skill itself, not
 * how it is worded: which domain it belongs to, how much visual weight it
 * carries, the mastery score, the graph role, the level and the icon.
 *
 * It lives in cv.ts only. Re-typing it here is what broke the English CV:
 * every entry below had lost `domain`, `weight` and `role`, so the site
 * dropped all soft and transversal skills from the grid (the filter keys on
 * `domain`), rendered every square at the smallest size (`weight` defaulted to
 * 1) and marked 86% of skills as active in every mode. The counts still
 * matched, so the parity test stayed green.
 */
const INHERITED_SKILL_META = ["domain", "weight", "mastery", "role", "level", "icon"] as const;

/**
 * Merge the Italian metadata into the English entries, matching by position.
 *
 * English wins on everything it defines — name, description and links are
 * genuinely translated (link targets point at translated skill names, so they
 * must NOT be inherited). Italian only fills the fields English leaves out.
 *
 * Position is the join key because soft and transversal skill names are
 * translated; the length guard turns a misalignment into a build failure
 * instead of a silently wrong CV.
 */
function inheritSkillMeta<T extends { name: string }>(
  translated: readonly T[],
  italian: readonly object[],
  section: string,
): T[] {
  if (translated.length !== italian.length) {
    throw new Error(
      `cv.en.ts — ${section}: ${translated.length} entries against ${italian.length} in cv.ts. ` +
        `The two lists are merged by position, so they must stay aligned.`,
    );
  }
  return translated.map((entry, i) => {
    const source = italian[i] as Record<string, unknown> | undefined;
    const meta: Record<string, unknown> = {};
    for (const key of INHERITED_SKILL_META) {
      const value = source?.[key];
      if (value !== undefined) meta[key] = value;
    }
    // English last: name, description and links are genuinely translated and
    // must never be overwritten by the Italian source.
    return { ...meta, ...entry } as T;
  });
}

export const cvDataEn = {
  // ── Personal info ──────────────────────────────────────────────────────────
  personal: {
    name: "Giulio Occhipinti",
    title: "Digital Innovation Consultant & Technical Partner for businesses of all sizes",
    // Rendered ONLY in the application PDF (generate-cv-pdf.ts): the reader
    // is a recruiter, not a client. Voice chosen by the user on 2026-07-16:
    // the person first, the proof after (posizionamento-ux-ui-first).
    summary:
      "I came to design by a route no manual describes: theatre, stages, photography, 5 countries and over 6 years of enterprise frontend (Intesa San Paolo, Aruba, Rai Pubblicità). Today I design interfaces with IBM and SkillUp certifications in UX/UI, work in short sprints and use AI inside the workflow. I can build what I design: that is the difference between a mockup and a product.",
    location: "Turin, Italy",
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
      url: "https://github.com/julioojospintados/digital-cv",
      label: "julioojospintados/digital-cv",
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
      note: "Intensive course at Callan School, London. I have used it professionally as an event host and charity auction MC for a European Burger King event.",
    },
    { name: "Spanish", level: "B1", note: "I learned it working in Tulum, Mexico." },
    { name: "French", level: "A2" },
  ] as Language[],

  // ── Work experience (most recent first) ───────────────────────────────────
  experience: [
    {
      company:
        "Internal Project — Business Management Software (Operational Partnering case study)",
      role: "Digital Innovation Consultant & Lead Developer",
      startDate: "2025-09",
      endDate: "present",
      location: "Turin, Italy",
      remote: true,
      description:
        "I designed and developed internal business management software, from process analysis to deploy: MCP architecture with tools, resources and prompts as APIs for AI agents, integrated with VS Code Copilot and Cursor, simplified UX for non-technical operators and an automated Cursor → GitLab CI/CD → deploy pipeline. I work in 1 to 2 week sprints and measure impactScore at every release.",
      highlights: [
        "I designed the workflows for people who do not know the software, not for the person who wrote it.",
        "I automated the Cursor → GitLab CI/CD → deploy pipeline: zero manual intervention.",
        "I put Copilot and Cursor inside the development loop, not next to it.",
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
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "I designed the AI layer of the management software: an MCP architecture with tools, resources and prompts exposed as APIs for agents, integrated with VS Code Copilot and Cursor. AI here is not a demo: it is the daily workflow the project is built with.",
          highlights: [
            "I designed MCP tools, resources and prompts that expose the software's data to AI agents.",
            "I instructed the agents with explicit rules and constraints: AI only accelerates inside rails set beforehand.",
            "I automated the Cursor → GitLab CI/CD → deploy pipeline: zero manual intervention.",
          ],
        },
      ],
    },
    {
      company: "Digital CV — Open Source AI-Augmented Project",
      role: "AI Workflow Designer & Full-Stack Developer",
      startDate: "2026-04",
      endDate: "present",
      location: "Turin, Italy",
      remote: true,
      description:
        "I built this interactive CV end-to-end with GitHub Copilot and Claude as operational assistants: architecture, UI, GSAP animations, MCP server and HTTP API with Hono. The site uses Astro and Lit, the MCP server exposes the data as an API for AI agents.",
      highlights: [
        "I developed an MCP server with tools, resources and prompt templates exposing CV data to AI agents (VS Code Copilot, Claude Desktop).",
        "I developed the site with Astro, Lit and GSAP animations: narrative preloader, SVG wave hold effect, distortion filter via feTurbulence.",
        "I developed the HTTP server with Hono, OpenAPI spec, Zod validation and Vitest tests.",
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
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "This site is the public demonstration of my AI workflow: an MCP server with tools, resources and prompt templates exposing the CV data to agents (VS Code Copilot, Claude Desktop), and AI-augmented development with GitHub Copilot and Claude inside constraints set beforehand.",
          highlights: [
            "I designed the MCP server that turns the CV into an API for AI agents.",
            "I set the vibe-coding rules before the components: tokens, animation rules, explicit DO NOTs.",
            "I documented the method in the site's case study: every choice can be defended in an interview.",
          ],
        },
      ],
    },
    {
      company: "ALTEN Italia",
      role: "Frontend Developer & UX/UI Design System",
      startDate: "2021-04",
      endDate: "present",
      location: "Turin, Italy",
      remote: false,
      description: "Frontend, UX/UI, Agile method and AI augmentation consulting.",
      // Three client engagements, one job — see ClientEngagement in cv.ts.
      clients: [
        {
          client: "Internal project",
          role: "AI-Augmented Frontend Developer",
          ai: true,
          description:
            "Development built on advanced AI pair programming, writing agents, dedicated skills and context instructions over the Model Context Protocol (MCP). AI agents and MCP servers reshaped and sped up the workflow, making rapid prototyping and the handover between interface and code far simpler. Agile pipeline automation on GitLab, Playwright tests, and direct ownership of layout and UX/UI design.",
        },
        {
          client: "Aruba",
          role: "Tech Lead · UX/UI & Design System Developer",
          description:
            "Design and development of the Web Components library in Lit (100+ components used to build the company's applications). Continuous alignment with the UX/UI teams on Figma, care for accessibility principles (WCAG) and Storybook integration for documentation. Ownership of code reviews, modular SCSS architecture with BEM, and unit tests with Jest and later Vitest. As Tech Lead I ran the Agile team, bridging design and development to speed up onboarding and component delivery.",
        },
        {
          client: "Intesa Sanpaolo",
          role: "Frontend Developer",
          description:
            "Angular frontend development on complex architectures within a distributed team of 30+ people. Reactive programming with RxJS and close collaboration with backend teams in Agile sprints.",
        },
      ],
      highlights: [
        "I led the Aruba Design System team as Tech Lead and Scrum Master, over 3 years and more than 30 people: a library of over 100 WebComponents adopted cross-product.",
        "I worked on the UX/UI side of the Aruba design system: component states, accessibility (WCAG) and visual consistency, aligned with the designers in Figma.",
        "I developed enterprise Angular architecture for Intesa San Paolo in a team of over 30 people, with shared standards and code review.",
        "I introduced systematic unit testing with Jest, to make releases more stable.",
      ],
      skills: [
        "Angular",
        "TypeScript",
        "Lit (Web Components)",
        "Node.js",
        "RxJS",
        "HTML5",
        "CSS3/SCSS",
        "BEM pattern",
        "Storybook",
        "Playwright",
        "Jest",
        "Vitest",
        "Cross-Device Testing",
        "Usability Testing",
        "WCAG (Accessibility)",
        "Model Context Protocol (MCP)",
        "AI Agents",
        "AI Workflow Design",
        "Prompt Engineering",
        "GitHub Copilot",
        "Design System",
        "UX/UI Design",
        "Rapid Prototyping",
        "Figma-to-Code",
        "REST API",
        "GitLab",
        "Agile",
        "Scrum",
      ],
      facets: [
        {
          mode: "creative",
          role: "UX/UI & Design System Developer — Aruba",
          description:
            "I built the Aruba design system from the side of the people who use it every day: a library of over 100 WebComponents in Lit, designed together with the designers so every component respects the typography, spacing and states defined in Figma.",
          highlights: [
            "I translated the designers' visual specifications into reusable cross-product components, with shared naming and APIs.",
            "I defended typographic consistency, spacing and component states in code reviews, on a team of over 30 people.",
          ],
        },
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "I brought AI into everyday consulting work, not into a side experiment: pair programming with Copilot and Claude on code that ships, and development environments prepared up front — agents, context instructions over MCP, Agile-cycle automation on GitLab. The project's rules reach the AI before the first prompt, so the speed-up stays inside decided boundaries instead of producing code that has to be read back in full.",
          highlights: [
            "I wrote agents, context instructions and reusable environments over the Model Context Protocol, instead of starting from an empty prompt every session.",
            "I automated the Agile-cycle flows on GitLab and the Playwright tests, keeping direct ownership of layout and UX/UI.",
          ],
        },
      ],
    },
    {
      company: "Music Agency (collaboration)",
      role: "Tour Manager & Digital Strategist",
      startDate: "2023-01",
      endDate: "2024-12",
      location: "Italy",
      remote: true,
      description:
        "I organised booking and tours for the roster artists of an Italian music agency and designed their digital communication and content strategy.",
      highlights: [
        "I rewrote the agency's communication to speak to labels, promoters and artists instead of a generic audience: followers doubled.",
        "I devised a playlist of emerging artists as a direct channel into the industry, and a monthly radio format to tell their tracks.",
        "I contacted partners one by one, with emails written by hand rather than generated by software.",
        "I wrote the speeches and hosted the agency's festival evenings on stage.",
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
      tags: ["creative"],
      facets: [
        {
          mode: "human",
          role: "Digital Strategist",
          description:
            "I designed the agency's digital presence to speak to the industry, not to a generic audience: content strategy, a playlist as a networking tool and channels grown with contacts that matter.",
          highlights: [
            "I doubled the followers with a targeted audience: musicians, labels, promoters.",
            "I conceived a playlist of emerging artists as a direct contact channel with the industry.",
          ],
        },
      ],
    },
    {
      company: "Freelance",
      role: "Assistant Videographer – High-End Weddings",
      startDate: "2022-01",
      endDate: "present",
      location: "Tuscany, Italy",
      remote: false,
      description:
        "I assist the lead videographer in video production for high-end international weddings in Tuscany. A wedding cannot be reshot: every moment has to be captured right the first time.",
      highlights: [
        "I shot ceremonies with hundreds of international guests as second operator.",
        "I worked on multi-day events in multicultural contexts.",
        "I adapted my role to on-set needs in real time, in high-complexity logistical contexts.",
      ],
      skills: ["Videography", "Post-production", "Color grading", "Aesthetic sensibility"],
    },
    {
      company: "Forge Lab",
      role: "Frontend Developer",
      startDate: "2021-04",
      endDate: "2022-03",
      location: "Los Angeles, USA",
      remote: true,
      description:
        "Full-remote frontend development within a team distributed between Turin and Los Angeles, focusing on the user interface, code quality and product integration for the US market.",
      highlights: [
        "Digivax: I built the corporate health compliance platform, with separate dashboards for employers, employees and medical staff.",
        "Digivax: I rewrote the SCSS architecture with the BEM pattern and cut the codebase from 8,000 to 3,000 lines.",
        "And 1: I handled evolutionary maintenance and built new product features.",
      ],
      skills: ["React", "TypeScript", "SCSS / BEM", "REST API", "Trello", "Agile"],
    },
    {
      company: "Consoft",
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "2021-03",
      location: "Turin, Italy",
      remote: false,
      description:
        "I developed management applications for Rai Pubblicità and Intesa San Paolo, replacing internal processes on legacy systems, with faster workflows for end users.",
      highlights: [
        "I developed internal management applications for Rai Pubblicità with Angular, Spring and Bootstrap.",
        "I developed a document and revision tool for Intesa San Paolo with JSF.",
        "I translated complex business requirements into interfaces usable by non-technical operators.",
      ],
      skills: ["Angular", "Spring", "JSF", "Java", "SQL", "Bootstrap", "HTML5", "SCSS"],
    },
    {
      company: "Satispay",
      role: "External Collaborator",
      startDate: "2018-06",
      endDate: "2019-06",
      location: "Milan, Italy",
      remote: false,
      description:
        "I worked externally with Satispay during a fast-growth phase: processes changing week to week and deliveries going straight to production.",
      highlights: [],
      skills: ["Fintech", "Startup mindset", "Digital communication"],
    },
    {
      company: "Cultural festivals and events",
      role: "MC & Live Host",
      startDate: "2015-01",
      endDate: "2024-12",
      location: "Italy",
      remote: false,
      description:
        "I hosted cultural festivals and live shows around Italy, on and off: rarely for a contract, mostly for the pleasure of being on stage. On-stage surprises got solved with theatre improvisation.",
      highlights: [
        "I hosted multidisciplinary cultural festivals (music, art, theatre).",
        "I moderated panels and talks with international guests.",
        "I solved live incidents on stage with my improvisation training.",
      ],
      skills: ["Public speaking", "Improvisation", "Moderation", "Hosting", "Audience management"],
    },
    {
      company: "Freelance",
      role: "Photographer",
      startDate: "2009-10",
      endDate: "present",
      location: "Turin, Italy",
      remote: false,
      description:
        "First shots in 2008, photographer in Tanzania in 2009, then years of solo travel with a camera around my neck and a backpack on my shoulders. Between one passport stamp and the next, I even found myself capturing the complexity and colour of luxury Indian weddings in the Tuscan hills. More an attitude than a full-time job, but it was my real first laboratory in Visual Design. Photography taught me visual hierarchy, composition and empathy of the eye: understanding where the gaze lands and what a person is looking for before they even press the shutter. An obsession with detail that today carries straight into designing layouts, interfaces and digital stories.",
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
        "I wrote local news and cultural events for the Corriere di Chieri: raw information to turn into readable pieces, on a weekly paper's deadlines.",
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
        "I co-founded the Square Festival in the Quadrilatero Romano district of Turin: a multidisciplinary cultural event (music, theatre, visual arts), conceived and delivered in 6 months with around 100 people across staff and artists. I directed the theatre section.",
      highlights: [
        "I co-founded the Square Festival: from concept to delivery in 6 months, with around 100 people across staff and artists.",
        "I coordinated the theatre section: research and selection of shows, negotiation with companies, scheduling integrated with the festival programme.",
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
        "I designed visual materials and brand identity for local clients. Graphic design training gave me the method, photography gave me the eye.",
      highlights: [
        "I designed graphic materials and brand identity for clients in the local and cultural sector.",
        "I applied visual hierarchy and typography principles to print and digital materials.",
      ],
      skills: ["Graphic design", "Brand identity", "Adobe Suite", "Typography", "Visual design"],
    },
    {
      company: "Mondadori Group",
      role: "Sales Assistant",
      startDate: "2015-04",
      endDate: "2018-04",
      location: "Turin, Italy",
      remote: false,
      description:
        "I worked in sales and customer consultancy at the Mondadori Store in Area 12, Turin, with responsibility for the books section.",
      highlights: [],
      skills: ["Customer service", "Sales", "Department management"],
    },
    {
      company: "None Teatro",
      role: "Theatre and Improvisation Teacher",
      startDate: "2016-01",
      endDate: "2016-12",
      location: "None, Turin",
      remote: false,
      description:
        "I taught theatre improvisation to None Teatro students, using the 'Yes, and...' method as a practice of active listening and collective building.",
      highlights: [
        "I delivered improvisation and theatre courses for students at different levels.",
        "I applied the 'Yes, and...' method as a teaching tool to develop creativity and problem solving.",
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
      role: "AV Technician",
      startDate: "2014-01",
      endDate: "2018-12",
      location: "Turin, Italy",
      remote: false,
      description:
        "I ran the audio and lighting for theatre productions: scene changes in the dark, comic timing to hit to the second and no replay available.",
      highlights: [
        "Audio Technique & Live Sound: Managed sound support and audio engineering for the school's theatre productions and shows, handling audio during live performances.",
      ],
      skills: ["Technical direction", "Audio", "Lighting"],
    },
    {
      company: "Bestar Hotel",
      role: "Front Desk Receptionist",
      startDate: "2012-12",
      endDate: "2013-06",
      location: "Tulum, Mexico",
      remote: false,
      description:
        "I worked the front desk of an international resort in Tulum, with an English- and Spanish-speaking clientele.",
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
        "I worked across theatre operations, box office and front-of-house at one of Italy's most-visited cinema chains: hundreds of guests a day, each with a different problem to solve on the spot.",
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
        "I worked as a barista at a Starbucks location in London, with international customers every day.",
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
      description: "I ran the photography centre of a tourist entertainment facility in Zanzibar.",
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
        "I coordinated entertainment teams and programmes at seasonal beach resorts in Ravenna and Crotone: new staff every season, new guests every week.",
      highlights: [
        "I coordinated entertainment teams under peak-season pressure.",
        "I designed and delivered entertainment programmes for international guests.",
      ],
      skills: [
        "Coordination",
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
        "I worked the counter and supported the kitchen, often on late-night shifts: fast pace, no margin for error.",
      highlights: [],
      skills: [
        "Teamwork",
        "Operational management",
        "Customer service",
        "Precision under pressure",
      ],
    },
    {
      company: "Bambagia Design Lab (collaboration)",
      role: "UX/UI Designer",
      startDate: "2026-04",
      endDate: "present",
      location: "Italy",
      remote: true,
      description:
        "I designed the interfaces for a client's website for Bambagia Design Lab: research on the client and competitors, wireframes and a prototype, hand-written HTML and CSS and site variants with different palettes, converted into Figma drawings with dedicated plugins.",
      highlights: [
        "I analysed the client and competitors to define the interface architecture: every choice is motivated, not aesthetic.",
        "I produced site variants with different palettes, converted into Figma drawings with dedicated plugins.",
        "I chose the right delivery flow so the client can edit the site independently.",
      ],
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "I built a reusable environment in VS Code with Figma MCP and Wix MCP, with the agent instructed on the project's graphic rules, to manage a two-way Figma ⇄ Code flow and apply MCP to Wix too, speeding up setup and defining a handoff that leaves the client full autonomy over the site.",
          highlights: [
            "Figma-to-Code: I turned prototypes and wireframes into production-ready HTML and CSS.",
            "Code-to-Figma: I converted code and chromatic/palette variants back into Figma components, to keep the Design System in sync.",
            "I chose the Figma → Wix plugin over Wix MCP, which generates a static frame: the client edits the site alone after delivery.",
          ],
        },
      ],
      skills: [
        "Figma",
        "MCP",
        "Wix",
        "HTML5",
        "CSS",
        "AI Orchestration",
        "Prompt Engineering",
        "UX Research",
        "Prototyping",
      ],
      tags: ["creative", "ai-orchestration"],
    },
    // Appended like Bambagia: adding here keeps the indices referenced by
    // exp-clusters.ts (ClusterRef → index into this array) stable.
    {
      company: "B-Teatro",
      role: "Actor and Improviser",
      startDate: "2013-01",
      endDate: "2019-12",
      location: "Turin, Italy",
      remote: false,
      description:
        "I performed as an actor and improviser with B-Teatro, in Italy and Luxembourg. On a stage with no script you learn something that holds everywhere: whatever happens is not up for debate, it is material to use.",
      highlights: [
        "Acting & Theatre: A path focused on comedic improv and scripted theatre, with tours in Italy and abroad and participation in national and international workshops.",
        'Cinema: Deuteragonist (co-lead) in the film "Double", produced in Turin by Filmine. The feature film premiered at the San Francisco Independent Film Festival (2022) and screened at Cinema Massimo for its Italian premiere.',
      ],
      skills: ["Acting", "Theatre improvisation"],
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
      name: "Generative AI: The Future of UX UI Design",
      issuer: "SkillUp",
      date: "2026-06",
      credentialId: "QL8LAMVW92AG",
    },
    {
      name: "UI/UX Wireframing and Prototyping with Figma",
      issuer: "SkillUp",
      date: "2026-06",
      credentialId: "1ZVQMN0YTP2Y",
    },
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
    },
    {
      name: "Master in Digital Communication",
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
      endDate: "2019-12",
    },
  ] as Certification[],

  // ── Technical skills ──────────────────────────────────────────────────────
  // domain / weight / mastery / role / level / icon are inherited from cv.ts —
  // see inheritSkillMeta above. Only translated strings belong here.
  technicalSkills: inheritSkillMeta(
    [
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
          { target: "Strategic autonomy", type: "cross-domain" },
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
          { target: "SQL", type: "workflow" },
        ],
      },
      {
        name: "Accessibility / WCAG",
        shortName: "A11y / WCAG",
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
        name: "PostHog",
        level: "Intermedio",
        icon: "posthog",
        mastery: 62,
        links: [
          { target: "Astro", type: "technical" },
          { target: "Agile Methodology", type: "cross-domain" },
          {
            target: "UX Research",
            type: "cross-domain",
            description:
              "Session replay and heatmaps turn real site usage into design decisions, without interviewing every user.",
          },
          { target: "Vercel", type: "workflow" },
        ],
      },
      {
        name: "Vercel",
        level: "Intermedio",
        icon: "vercel",
        mastery: 60,
        links: [
          { target: "Astro", type: "technical" },
          { target: "PostHog", type: "workflow" },
        ],
      },
    ],
    cvData.technicalSkills,
    "technicalSkills",
  ) as Skill[],

  // ── Soft skills ───────────────────────────────────────────────────────────
  softSkills: inheritSkillMeta(
    [
      {
        name: "Effective communication",
        description:
          "I have hosted public events for over 10 years, with theatre training behind me: I can explain complex things to very different people without changing the substance.",
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
          "Software development, photography, theatre, writing and events: this background produces solutions that linear paths cannot see, even in technical contexts.",
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
          "I have worked in 5 countries (Italy, UK, Mexico, Tanzania, Luxembourg), each with a different organisational, linguistic and cultural context.",
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
          "I build trust with colleagues, clients and counterparts: from international customer service to coordinating cross-functional teams.",
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
          "I have solved problems in enterprise environments (microfrontend architectures, legacy systems) and in high-stress live situations (technical direction, event hosting): two different gyms, the same method.",
        links: [
          { target: "Applied creativity", type: "conceptual" },
          { target: "T-shaped thinking", type: "conceptual" },
          { target: "Agile Methodology", type: "cross-domain" },
          { target: "MCP Protocol", type: "cross-domain" },
        ],
      },
      {
        name: "Strategic autonomy",
        description:
          "I run parallel projects on my own (freelance photography, videography, strategic consultancy): I set priorities, meet deadlines and deliver without direct supervision.",
        links: [
          { target: "Resilience and adaptive thinking", type: "conceptual" },
          { target: "Agile Methodology", type: "cross-domain" },
          { target: "T-shaped thinking", type: "conceptual" },
          { target: "Git", type: "cross-domain" },
        ],
      },
      {
        name: "Resilience and adaptive thinking",
        shortName: "Adaptive resilience",
        description:
          "I trained clarity under pressure through theatre technical direction, live event hosting and enterprise systems in production. I treat the unexpected as data to learn from.",
        links: [
          { target: "Strategic autonomy", type: "conceptual" },
          { target: "Cultural adaptability", type: "conceptual" },
          { target: "Theatre and improvisation", type: "cross-domain" },
          { target: "Agile Methodology", type: "cross-domain" },
        ],
      },
      {
        name: "Active listening",
        description:
          "I ask the right questions before responding, recognise what goes unsaid and hold attention through long technical sessions. It is the foundation of any consulting that works.",
        links: [
          { target: "Relational intelligence", type: "conceptual" },
          { target: "Effective communication", type: "conceptual" },
          { target: "Theatre and improvisation", type: "cross-domain" },
        ],
      },
      {
        name: "Aesthetic sensibility",
        description:
          "I have been photographing for over 15 years: that eye goes straight into interface choices, where a pixel out of place shows.",
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
          "I bridge engineering (frontend), design (UX/UI) and marketing (SEO/SEM): fewer misunderstandings between departments, faster deliveries.",
        links: [
          { target: "Lateral problem solving", type: "conceptual" },
          { target: "Strategic autonomy", type: "conceptual" },
          { target: "AI-Augmented Productivity", type: "cross-domain" },
          { target: "Agile Methodology", type: "cross-domain" },
        ],
      },
    ],
    cvData.softSkills,
    "softSkills",
  ) as SoftSkill[],

  // ── Transversal skills ────────────────────────────────────────────────────
  transversalSkills: inheritSkillMeta(
    [
      {
        name: "Event management",
        description:
          "I conceived and produced multidisciplinary cultural festivals (Square Festival, Artiversum, Quadrilatero Romano in Turin): artist coordination, logistics and institutional communications.",
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
          "I have worked as a freelance photographer since 2009, with an international portfolio (Tanzania, Mexico, Italy). Reportage and portraiture.",
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
          "I trained and performed with B-Teatro (2013–2019), with shows in Italy and Luxembourg. Improvisation trains listening and speed: when a scene collapses you learn to build on it, not to redo it.",
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
          "I have hosted festivals, panels and talks with international guests since 2015. I hold diverse audiences and solve live surprises without losing the rhythm.",
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
          "I specialised with Immaginazione e Lavoro (2018) and have produced visual materials for events, brands and digital communications ever since.",
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
        shortName: "Social media",
        description:
          "I trained with Immaginazione e Lavoro (2018) and built the editorial plan for cultural event channels and the music agency.",
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
          "I completed the IED Master in Digital Communication (2022–2023): content strategy, SEO/SEM, analytics, campaign management and brand storytelling in B2C and B2B contexts.",
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
          "I am completing the IBM UX Design Professional Certificate: user research, information architecture, wireframing and high-fidelity prototyping with Figma.",
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
          "I assist the lead videographer on high-end weddings in Tuscany: shooting, color grading and narrative editing in multicultural contexts.",
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
          "I applied Scrum and Kanban in distributed enterprise teams (ALTEN, Intesa San Paolo, Aruba) and in personal creative projects: sprint planning, retrospectives and backlog.",
        links: [
          { target: "T-shaped thinking", type: "cross-domain" },
          { target: "Strategic autonomy", type: "cross-domain" },
          { target: "Theatre and improvisation", type: "conceptual" },
          { target: "Event management", type: "cross-domain" },
          { target: "Git", type: "workflow" },
          { target: "Jest", type: "workflow" },
        ],
      },
      {
        name: "AI-Augmented Productivity",
        description:
          "I integrated GitHub Copilot, ChatGPT and Midjourney into development, UX research and content production workflows. AI expands quality and speed, the critical judgement stays mine.",
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
          "I have won poetry awards in Italy and Australia, and one of my poems was read on Radio Capital. At work that writing becomes copy and documentation: the text on this site is mine.",
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
          "I coordinated artists, digital aggregators and streaming platforms (Spotify, YouTube Music): release management, communications and editorial project management (2023–2024).",
        links: [
          { target: "Event management", type: "workflow" },
          { target: "Social media management", type: "workflow" },
          { target: "Digital marketing", type: "workflow" },
          { target: "Effective communication", type: "cross-domain" },
        ],
      },
    ],
    cvData.transversalSkills,
    "transversalSkills",
  ) as TransversalSkill[],

  // ── Methodology & Mindset ─────────────────────────────────────────────────
  methodology: [
    {
      name: "Agile & Iterative Development",
      description:
        "I work in short cycles: they reduce risk, keep the focus on business objectives and leave room for feedback before it gets expensive. It holds on enterprise systems with distributed teams as well as on projects I run alone.",
    },
    {
      name: "AI as a Value Multiplier",
      description:
        "I use AI every day, each tool with a precise role: GitHub Copilot for development speed, ChatGPT for conceptual prototyping, Midjourney for visual exploration. The time saved on repetitive tasks goes into the creative phases, where it matters more.",
    },
    {
      name: "T-shaped Problem Solving",
      description:
        "My background spans engineering, design and marketing: I see patterns that mono-disciplinary teams miss. Before solving a problem, I check it is the right one.",
    },
    {
      name: "Framework-Agnostic Thinking",
      description:
        "I have worked with Angular, React, Lit, WebComponents and Astro: I choose the tool based on the problem, not the other way around. Architectures age better when nobody has bent them to the framework of the moment.",
    },
    {
      name: "Analytics as a Product Compass",
      description:
        "I integrated PostHog and Vercel Analytics into this project to close the build-measure-learn loop. As Product Manager I read funnels and 30/90-day retention to see which features actually matter. As a designer I use session replay, heatmaps and rage clicks to find friction in the interface without interviewing every user. As a developer I use feature flags to ship without risking an all-or-nothing deploy, and A/B tests to decide with real data instead of opinions.",
    },
  ] as MethodologyItem[],

  // ── Growth areas (presented as evolution paths) ────────────────────────────
  growthAreas: [
    {
      name: "Multifaceted curiosity",
      reframe:
        "I explore different fields out of a restlessness that does not stop. I refuse to be boxed into one field, and every new stimulus becomes another angle to read a problem from.",
    },
    {
      name: "Parallel thinking",
      reframe:
        "I work out solutions across multiple mental tracks at once. I find connections between distant elements that a linear reading of the problem would miss.",
    },
    {
      name: "Emotional communication",
      reframe:
        "I express moods and doubts directly, without defensive masks. It cuts friction in teams and speeds up trust with whoever I am working with.",
    },
    {
      name: "Intellectual honesty",
      reframe:
        "I recognize facts for what they are, even when they contradict my beliefs or bruise my ego. On a technical project that means admitting a mistake before it costs someone else weeks.",
    },
    {
      name: "Stepping into others' shoes",
      reframe:
        "I simulate the other person's perspective to read their motivations and needs, beyond my own judgement. In distributed teams I catch objections before they turn into blockers.",
    },
    {
      name: "Assertiveness",
      reframe:
        "I set my own boundaries and hold my positions firmly, without folding to avoid conflict and without attacking the other side. Technical decisions stay contestable on merit, not on tone.",
    },
  ] as GrowthArea[],

  // ── Personal projects ─────────────────────────────────────────────────────
  projects: [
    {
      name: "Digital CV — Open Source AI-Augmented Project",
      description:
        "I built this CV on my own, open source, working with GitHub Copilot and Claude. It is made of two parts, the site in Astro and Lit with GSAP animations and an MCP server that exposes the CV data to AI agents. PostHog shows me how real people use it, and when the numbers contradict one of my ideas, I change the idea.",
      url: "https://github.com/julioojospintados/digital-cv",
      repoUrl: "https://github.com/julioojospintados/digital-cv",
      date: "2026-04",
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
      slug: "digital-cv",
      primaryMode: "tech",
      role: "AI Workflow Designer & Full-Stack Developer. Idea, UX/UI and development, on my own.",
      problem:
        "I had started working with AI, MCP and vibe coding, and I needed a real project to try them on, not yet another tutorial. Meanwhile my PDF CV did the opposite of what I wanted: it listed skills without showing them, and gave the same sheet to a recruiter, a CTO and an art director, who look for three different things. I put the two needs together and built the CV I was missing with the method I wanted to prove.",
      process: [
        "Research — I started from the reader. A recruiter wants to understand quickly who I am, a CTO looks at the stack and the architecture, an art director looks at the aesthetics and at how I tell things. From then on every choice had to serve at least one of the three, and I had to be able to explain it in an interview.",
        "Concept — Knolling, the top-down photo where objects lie in order on the table, one next to the other. My skills are very different from each other, code, design, stage, method, and laying them on the table like that felt like the most honest way to show them: everything in view, nothing in the drawers.",
        "Information architecture — One profile, read through three lenses: /design, /tech and /ai. The lens changes the accent colour and what comes to the front, never the structure or the content, and what it does not concern stays on the table with less light on it.",
        "Design system — I set the rules before the components: the teal background that never changes, one accent per lens, Lexend and JetBrains Mono, animations on transform and opacity only, still for anyone who asks for less motion. Every component of the site sits in a showcase, and if one is missing a check stops the push to main.",
        "AI-augmented build — I wrote the code in pair with GitHub Copilot and Claude, from the architecture to the interface, from the GSAP animations to the MCP server with tools, resources and prompts that exposes the CV to AI agents. If the site says I work this way, it has to be the proof.",
      ],
      decisions: [
        {
          title: "The graph was beautiful, I removed it",
          body: "The skills were a D3 force graph, the most spectacular part of the site. On phones I had already moved it after the cards, because a graph is something you look at, not something you read in a hurry. Then I removed it altogether, and now a skill appears inside the job where I used it, which says much more than a logo floating among the others.",
        },
        {
          title: "Whispers, not silences",
          body: "When you pick a lens, what it does not concern does not disappear, it is toned down and stays readable, by keyboard and screen reader too. Hiding it would have contradicted knolling, where everything is on the table.",
        },
        {
          title: "Measuring on real screens",
          body: "I checked the site on comfortable windows, 1280 by 900. PostHog said the most common laptop among visitors opens a 1366 by 610 window, and there the buttons of the entry cards ended up below the edge, and whoever arrived could not see where to click. Now every page is measured at the sizes visitors actually use, phones included, before a change goes live.",
        },
        {
          title: "Accessibility decided at the start",
          body: "I measure contrast on the brightest pixel behind each line of text, because on top of an image the background colour written in the CSS says little. Each accent has a version for small text that passes 4.5:1 on the teal. Visible focus, skip link and reduced motion have been design system rules since day one, the 44 pixel touch targets came later, together with the check that measures them on every page.",
        },
      ],
      outcomes: [
        "An MCP server with tools, resources and prompts, which lets an AI agent read my CV like an API.",
        "PostHog and Vercel Analytics measure how the site is used, and real changes came out of those numbers, like the entry cards redone to fit the window of the most common laptop.",
        "Checks on the built site before every push to main, on every page and in both languages. The showcase's first run found 91 live classes nobody had documented.",
      ],
      learnings: [
        "AI is fast only inside rules decided beforehand: the tokens, how things move, what not to do, written down in black and white. Without them it quickly produces work to redo.",
        "Every detail has to survive the question «why?». If a visual choice has no answer I could give in an interview, it is decoration.",
        "The ideas I liked most, the graph and the step scroll, were the first I had to scale back in front of real use. Better to test them early, while changing them costs little.",
      ],
      automationsIntro:
        "The site is also where I try out automation: agents, skills and an MCP server, plus the checks that stop a defect before it goes live. Rows with the AI badge use a language model.",
      automations: [
        {
          name: "cv-recruiter agent",
          kind: "AI agent · Claude Code",
          what: "Reads a job ad, tells me what my profile is missing, works out how good a match I am and generates the targeted CV as a PDF, in a designed version and one for ATS.",
          ai: true,
        },
        {
          name: "ux-reviewer agent",
          kind: "AI agent · Claude Code",
          what: "Reviews the site without touching it, at the screen sizes of real visitors, in Italian and English, and hands me the problems in order of severity.",
          ai: true,
        },
        {
          name: "CV generator from the phone",
          kind: "AI · Gemini API",
          what: "From the job ad, even a photo of it, to the targeted CV, the cover letter and a salary estimate, with the PDFs generated on the server.",
          ai: true,
        },
        {
          name: "MCP server",
          kind: "AI · Model Context Protocol",
          what: "Exposes my CV to AI agents with tools, resources and prompts, including CV generation and the applications log.",
          ai: true,
        },
        {
          name: "Eight project skills",
          kind: "AI · Claude Code and GitHub Copilot",
          what: "Instructions the AI loads when it needs them: project context, design system, the way I write, method, architecture, positioning.",
          ai: true,
        },
        {
          name: "Verification loop",
          kind: "AI skill",
          what: "Build, measure, critique. The work is judged by a reviewer who did not do it, never by whoever wrote it.",
          ai: true,
        },
        {
          name: "Applications log",
          kind: "Vercel Blob",
          what: "The status of every application, which I update from the phone or from an agent: sent, reply received, CV confirmed, outcome.",
          ai: false,
        },
        {
          name: "Checks before the push",
          kind: "Husky · Playwright",
          what: "Before every push to main: lint, build and five checks on the built site, namely the component showcase, Italian and English parity, links, contrast and real screen sizes.",
          ai: false,
        },
        {
          name: "PDF CV generators",
          kind: "Node · Playwright",
          what: "Four versions from the same data, with links in the document's language. A role that does not fit on the page moves to the next one, whole.",
          ai: false,
        },
      ],
    },
    {
      name: "Bambagia — UX/UI Design for a B2B Cosmetics Brand",
      description:
        "For Bambagia Design Lab I designed the website of a cosmetics brand that sells to professionals, from wireframes to design system. The studio, which works in Wix Studio, would then maintain the site, so I used AI to set up a working environment that only produces pages that can be rebuilt in Wix, with the agent's instructions and the Figma and Wix MCPs.",
      date: "2026-05",
      tags: [
        "UX/UI Design",
        "Wireframing",
        "Prototyping",
        "Design System",
        "Figma",
        "Wix Studio",
        "MCP",
        "GitHub Copilot",
        "HTML5",
        "CSS",
      ],
      slug: "bambagia",
      primaryMode: "creative",
      role: "UX/UI Designer & AI Workflow Designer, collaboration with Bambagia Design Lab (2026).",
      problem:
        "Bambagia Design Lab asked me for the website of a cosmetics brand that sells to beauticians, wellness centres and pharmacies, a showcase site with no cart, with product lines on three levels, courses and personalisation requests. The real constraint came after delivery, though, because the studio would be the one maintaining the site, in Wix Studio, and if a page cannot be rebuilt in Wix, or lands there as a static block, every change needs someone who writes code again. Meaning me.",
      process: [
        "Research — Before drawing anything I studied the client and its competitors, who buys, what a professional looks for when opening a cosmetics brand's site, how the product lines are organised. The result was a brief with the pages, the features and the products split into lines, sub-lines and single products.",
        "Wireframes — I hand-wrote the low-fi prototype in HTML and CSS, nine pages with a sitemap as the entry point. It opens straight in the browser, with no server, so the studio clicks through it as it would with a real site.",
        "Visual direction — On the same content I designed three different home pages, and the one I called Nature Professional won. On that one I built all the other pages, in desktop and mobile versions.",
        "Wix-friendly rules — I wrote twelve rules so every page moves into Wix Studio as it is. Each section is a block of its own, which becomes a Section in Wix, spacing follows the 8-point grid Wix uses and colours come from variables that become the theme colours.",
        "AI environment — In VS Code I set up an environment the studio can reuse with every client, with GitHub Copilot instructions that switch on client by client, an agent that knows the way from brief to site and the Figma, Wix and Playwright MCPs. I wrote the design rules and the Wix rules once, and from there the agent applies them to every page.",
      ],
      decisions: [
        {
          title: "The Figma → Wix plugin, not the Wix MCP",
          body: "With the Wix MCP the design reached the site faster, but as a static frame, nice to look at and impossible to edit for anyone who does not write code. I went for the plugin that exports from Figma and creates native Wix Studio sections, containers and theme styles. It costs me one extra step, and saves the studio a phone call every time it needs to change a line of text.",
        },
        {
          title: "A design made to be redone",
          body: "The HTML design is a guide, because the studio rebuilds the real pages inside Wix, so I left out everything Wix cannot redo, like complicated absolute positioning, masks or animation libraries such as GSAP. Animations use three standard classes that become native interactions in Wix, while forms and menus I only drew, since in Wix they are rebuilt with its own components.",
        },
        {
          title: "Three home pages on the same content",
          body: "When there is a single proposal, the review turns into a list of corrections. With three, the client picks the atmosphere first and corrects later. The two that lost stayed in the brief's internal folder, and the client only received the prototype.",
        },
        {
          title: "The atmosphere yes, the colours no",
          body: "Nature Professional had a gold accent and two Google Fonts, but the brand already had a palette of its own, terracotta, beige and sage. From my proposal I kept the structure, the rhythm and the animations, and put the brand's colours and fonts into it, loaded locally because Wix imports them as custom fonts.",
        },
      ],
      outcomes: [
        "Three home pages proposed, one chosen, and on it nine pages designed for desktop and mobile.",
        "A reusable environment, where every new client of the studio starts from the same folder structure, the same rules and the same agent.",
        "Eleonora D'Agostino, who runs the studio, wrote a recommendation about this work, and you can find it among the voices on my CV.",
      ],
      learnings: [
        "The question to ask at the start was who would get their hands on the site after me, and everything else came from that answer, starting with the first wireframe.",
        "The rules written for the agent, it follows on every page and in every session. The ones I kept in my head, I followed when I remembered them.",
      ],
      automationsIntro:
        "The environment I built for the studio, so that AI works inside Wix's rules instead of making up its own. Rows with the AI badge use a language model.",
      automations: [
        {
          name: "Wix Builder agent",
          kind: "AI agent · GitHub Copilot",
          what: "Knows the way from brief to site, reads the brief, updates the prototype, checks it in the browser and asks for confirmation before touching a Wix site that is already live.",
          ai: true,
        },
        {
          name: "Per-client instructions",
          kind: "AI · GitHub Copilot",
          what: "Switch on only for that client's files, with its audience, its preferences and the structure of its products. The next client has its own, and they never mix.",
          ai: true,
        },
        {
          name: "Wix and Velo rules",
          kind: "AI · GitHub Copilot",
          what: "The twelve Wix-friendly rules and the limits of the Figma export, which the agent applies to every page it writes.",
          ai: true,
        },
        {
          name: "Figma and Wix MCPs",
          kind: "AI · Model Context Protocol",
          what: "Give the agent the Figma files and the Wix and Velo documentation, so code and design do not drift apart.",
          ai: true,
        },
        {
          name: "Browser review",
          kind: "Playwright · MCP",
          what: "Screenshots every version of the prototype before the client sees it.",
          ai: false,
        },
      ],
    },
    {
      name: "Looking for Flights — Flight Price Monitor",
      description:
        "For my September 2026 trip, which ended up in Sri Lanka, I built a program that keeps an eye on flight prices for me. Twice a week a GitHub Action looks for the cheapest flight, works out how many days I can stay on the ground with the budget I have and writes to me on Telegram only when there is something to know. The whole trip lives in one configuration file, and the budget stays private even though the repository is public.",
      url: "https://github.com/julioojospintados/looking-for-flights",
      repoUrl: "https://github.com/julioojospintados/looking-for-flights",
      date: "2026-07",
      tags: [
        "Node.js",
        "GitHub Actions",
        "Telegram Bot API",
        "Cloudflare Workers",
        "SerpApi",
        "Claude Code",
      ],
      slug: "looking-for-flights",
      primaryMode: "tech",
      figures: [
        {
          kind: "bars",
          title: "The cheapest flight does not win",
          caption:
            "What 21 days cost with the prices of 31 July. The lowest flight was to Jakarta, but India came first, where a day on the ground cost 7 euros less.",
          source: "Prices from the search of 31 July 2026, from the project README.",
          columns: [
            "Destination",
            "Return flight",
            "21 days on the ground and fixed costs",
            "Total",
          ],
          rows: [
            { label: "India", a: 506.4, b: 420, note: "lowest total" },
            { label: "Indonesia", a: 468.8, b: 637, note: "cheapest flight" },
            { label: "Vietnam", a: 502.95, b: 627 },
            { label: "Malaysia", a: 512.53, b: 693 },
            { label: "Thailand", a: 546.43, b: 685 },
          ],
        },
      ],
      role: "Creator and only user, personal project built with Claude Code (2026).",
      problem:
        "For September 2026 I had a fixed budget and one precise question, where can I go and for how many days without going over it. The cheapest flight was not enough to answer it, because on the ground every country costs something different, and I had no wish to spend the summer opening Google Flights every morning to find out nothing had changed.",
      process: [
        "The maths — For each destination the program takes the cheapest return flight, subtracts the flight and the fixed costs from the budget, divides what is left by what a day costs at the destination and caps the result at the trip's maximum length. In the ranking days come first, then the total cost. With the prices of 31 July the cheapest flight was to Jakarta, and yet India came first, where a day on the ground cost 7 euros less.",
        "Engine and configuration — The trip's logic lives entirely in one file, with the dates, the length, the departure airports and the destinations with their daily spend, so changing trip does not touch the code. New destinations go in a text file, one per line, and a script syncs them.",
        "Notifications — The bot stays quiet until it has something to say. It writes on Telegram the first time it runs, when the destination at the top of the ranking changes or when a flight drops by at least 15 euros, and for each destination it sends a table with airline, times, door-to-door duration and layovers, including the one that eats up a night. Two flights at the same price can be two very different trips.",
        "On demand — With the /cerca command the bot runs the same search when I decide. At first a workflow checked messages every 15 minutes, at least on paper, because once I measured it GitHub was running it every 26 minutes, sometimes 42. I replaced it with a Cloudflare Worker, which receives the message from Telegram as soon as it arrives and starts the search straight away.",
        "Sri Lanka — The list started with five destinations in Asia. On 2 August I added Sri Lanka, then narrowed the search to it alone, leaving between 12 and 15 September and back by the end of the month, and on 12 September, with the departure window open, I switched the monitor off.",
      ],
      decisions: [
        {
          title: "The budget is not in the repository",
          body: "The repository is public, my budget is not. It reaches the program while it runs, from a GitHub secret, and neither the notifications nor the history show the days before the cap or the money left over, because next to the daily spend and the flight price, which are public, one subtraction would give away the exact budget.",
        },
        {
          title: "225 searches out of 250 in two days",
          body: "The SerpApi plan gives 250 searches a month. Each round used 60, the cron started twice a day, and as soon as /cerca became instant I launched it three times in an hour. I found out from a warning email. Now there is a cap that counts every run together, over a rolling 30-day window, with a reserve the cron cannot touch, because if the cron skips a round nobody notices, while behind a /cerca there is a person waiting. Each round now costs 15 searches instead of 60.",
        },
        {
          title: "Turin next to Milan",
          body: "The ranking uses the lowest price, which almost always departs from Malpensa or Orio. Every notification also carries the best price from Turin, though, so I can decide whether the saving is worth the trip to Milan, and it costs no extra searches, because the prices of the single airports already come in the same response.",
        },
        {
          title: "No budget, still the prices",
          body: "When a secret does not exist, GitHub passes it as an empty string, and the budget check mistook it for a wrong value. Four failed runs in a row. Now empty and missing count the same, and without a budget the program ranks the destinations by flight price only, with a warning at the top of the notification. A mistyped value, like «1500 EUR», still stops everything, as it should.",
        },
        {
          title: "Zero dependencies, with one exception",
          body: "The project uses only Node's standard library, so no installs in CI and no supply chain to keep an eye on. The only piece outside GitHub is the Cloudflare Worker, which is exactly the road I had ruled out at the start. Then I measured how long a /cerca waited for an answer, up to forty minutes, and I had to admit it was not «on demand», it was a cron in disguise. I gave in.",
        },
      ],
      outcomes: [
        "From 31 July to 12 September the monitor ran on its own twice a week, and the GitHub Action saved the price history in 18 automatic commits.",
        "Each run went from 60 to 15 searches, with a monthly cap that keeps the scheduled checks apart from the ones I launch myself.",
        "Sri Lanka joined the list on 2 August, and that is where I left for in September.",
        "The calculation engine became the base of trip-runway, the web app that asks the same question for anyone who travels.",
      ],
      learnings: [
        "I decided first when the bot should keep quiet, and only then when it should write. Those three conditions are the UX part of the project, even if nobody sees them.",
        "Free quotas needed counting before writing the cron. I counted them afterwards, at the kind request of a warning email.",
        "A monitor that has stopped in silence looks like a price that has not changed. That is why every failed run now writes to me on Telegram, with the link to the logs.",
      ],
    },
    {
      name: "Trip-Runway — Travel Budget Yield App",
      description:
        "I turned looking-for-flights, my script for keeping an eye on flight prices, into trip-runway: a web app that puts together the cost of the flight and what it costs to live at the destination, and works out how many days you can travel on a fixed budget. It is built with Next.js, Supabase and Prisma. Prices are updated once per route, however many users follow it, and the revenue comes from flight affiliate links.",
      url: "https://trip-runway.vercel.app",
      repoUrl: "https://github.com/julioojospintados/trip-runway",
      date: "2026-08",
      tags: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Supabase",
        "Prisma",
        "Clerk",
        "Travelpayouts API",
        "Vercel",
      ],
      slug: "trip-runway",
      primaryMode: "tech",
      figures: [
        {
          kind: "flow",
          title: "One call per route",
          caption:
            "Six users save three routes, and at night three calls go to the flights API instead of six. Users and routes are an example, the mechanism is the real one.",
          columns: ["Users", "Saved routes", "Flights API"],
          links: [0, 0, 1, 1, 1, 2],
          nodes: ["MXP → CMB", "MXP → DEL", "TRN → BKK"],
          target: "Flights API",
          targetNote: "3 calls",
        },
      ],
      role: "Full-Stack Developer & Product Owner, personal project in development (2026).",
      problem:
        "looking-for-flights worked, but I was the only one using it. The question it answers, how many days can I afford on this budget, is one anybody asks when they travel with a spending cap. I decided to make it a product, free for whoever tries the calculation and paid by affiliate links when someone books, without rewriting the engine that already worked.",
      process: [
        "Origin — I brought the calculation over from looking-for-flights as it was: the budget minus the flight, divided by the daily spend, capped at the trip's maximum length. I had already tried it on a real trip, mine. The new work was all around it.",
        "Business model — Freemium, with revenue from flight affiliate links through Travelpayouts and the Aviasales network. No subscription for now, so getting in costs nothing and meanwhile I find out whether the demand exists outside my own circle.",
        "Anti-abuse architecture — The frontend never calls the flights API. Users save a route, at night a cron takes the saved routes, makes a single call for each one and updates the price for everyone following it. Free quotas are low, and I designed this deduplication before the first feature, not after the first block.",
        "Stack and security — Next.js with the App Router, PostgreSQL on Supabase through Prisma, login with Clerk. Every Server Action that edits or deletes data checks that the caller owns the record. Without that check a user could change the routes saved by someone else.",
      ],
      decisions: [
        {
          title: "One call per route",
          body: "One real-time call for each user would have used up the free quota in a few hours. Routes live in the database with no duplicates, and one call goes out for each route, whether one person follows it or many.",
        },
        {
          title: "Amadeus ruled out, not by choice",
          body: "I wanted Amadeus prices, but in mid-2026 it closed its self-service developer portal and only the Enterprise channel is left, which is not a road for a project that has just started. I took Travelpayouts, free and with affiliate links ready to use, and I keep Duffel as plan B in case a live GDS price is needed one day.",
        },
        {
          title: "The calculation free first",
          body: "A subscription from day one would have shut out anyone who just wants to try the calculation. With affiliate links I earn when someone books, and I do not ask for a credit card from anyone still looking.",
        },
        {
          title: "Authorization from the first Server Action",
          body: "The record ownership check has been an architecture rule from the start. Leaving it for last, as a security task to do before launch, would have meant going back over every action already written by hand.",
        },
      ],
      outcomes: [
        "The app is live on Vercel, at trip-runway.vercel.app, and it grew out of a personal tool that already worked.",
        "The calculation engine comes from looking-for-flights without being rewritten.",
        "Per-route call deduplication and an ownership check on every Server Action, decided before writing the first features.",
      ],
      learnings: [
        "A tool I use myself for a real problem is the cheapest market check I know of: the need was there before the product.",
        "The price provider was chosen by the closing of the Amadeus portal, not by comparing features. Constraints that come from outside decide the architecture more than my own taste.",
      ],
    },
    {
      name: "Product Discovery — UX Research & Product Strategy",
      description:
        "With a technical partner I turned around the way a digital product usually starts: first research into what people actually need, then the idea. Design Thinking and Effectuation, a map of behaviours on Miro read through the Four Forces, interviews, competitor analysis. Out of 17 ideas one is left, now in development, which we will validate with the pPoC Engine before writing code.",
      date: "2026-05",
      tags: [
        "UX Research",
        "Product Strategy",
        "Design Thinking",
        "Effectuation",
        "Four Forces (Jobs to Be Done)",
        "User interviews",
        "Value Proposition Canvas",
        "pPoC Engine",
        "Miro",
        "Figma",
        "Prototyping",
      ],
      slug: "product-discovery",
      primaryMode: "creative",
      figures: [
        {
          kind: "funnel",
          title: "From 17 ideas to one",
          caption:
            "Each step removed ideas with a different filter: first the map of needs, then the interviews and the competitors, finally the Value/Effort matrix.",
          steps: [
            { value: 17, label: "ideas out of the map of needs" },
            { value: 4, label: "left after interviews and competitors" },
            { value: 1, label: "in development" },
          ],
        },
      ],
      role: "UX Researcher & Product Strategist, ongoing project with a technical partner (2026).",
      problem:
        "Plenty of apps solve problems nobody feels, or try to invent one. My partner and I did the opposite of the usual: no starting idea to defend, first the study of everyday behaviours, anxieties and wishes that digital products miss. We wanted to know whether anyone is interested in a product before writing a line of it.",
      process: [
        "Research — I mapped people's behaviours and needs on Miro with the Four Forces of Jobs to Be Done: what pushes someone to change, what draws them to the new solution, the anxiety of change, the pull of habit. I grouped the needs into areas, from identity to the fear of ageing, from the need for control to relationships, and weighed them by severity, spread and cultural area. Instead of age brackets I used behavioural psychology.",
        "Validation — A map made at the desk agrees with whoever made it. I tested the needs with 7 informal chats of a quarter of an hour with people in the target, and against the competitors already trying to answer those needs, looking at where their flows work and where they do not.",
        "Ideation — From the map, with my partner, came 17 ideas, each tied to a precise need. The logic is effectuation: you start from the means and the needs you already have in hand, instead of from a fixed goal to defend at all costs. I took the most promising ones apart with the Value Proposition Canvas and then fed them to AI in an adversarial role: a venture capitalist sceptical about the numbers, an analyst hunting for technical and legal blocks.",
        "Prioritisation — A Value/Effort matrix crossed how much an idea is worth to whoever uses it with how much it costs to design. Of the 17, 4 were left, and we put everything on one, the one in development now.",
        "pPoC Engine — The last test is our pPoC Engine, a Probabilistic Proof of Concept: a high-fidelity Figma prototype that looks like a real app, put in front of people to measure what they do, not what they say. We set the thresholds beforehand: over 8% conversion at onboarding, over 2% clicks on the pre-order.",
      ],
      decisions: [
        {
          title: "Needs first, then the idea",
          body: "Usually you start from an idea and look for confirmation. We started from the needs and let the ideas come out of the map. It takes longer at the beginning, and in exchange you avoid falling in love with a product that only its inventors like.",
        },
        {
          title: "The whiteboard against a quarter of an hour of chat",
          body: "Desk research was more comfortable, and it confirms what you already think. The chats with people in the target turned the picture around: many ideas that looked strong on the whiteboard did not survive a quarter of an hour of conversation. The cut from 17 to 4 comes almost entirely from there.",
        },
        {
          title: "AI as devil's advocate",
          body: "The ideas were ours, I did not ask AI for any. I instructed it to attack them, as a sceptical venture capitalist and as a technical and legal analyst. An agreeable AI says you are right about everything, set against you it found in a few hours the holes we would have discovered after launch.",
        },
        {
          title: "A fake example to protect the real idea",
          body: "The idea in development is confidential, so I tell the method on a deliberately silly example: CheCaspitaMangio, an app that decides dinner by spinning a wheel. The need is decision anxiety, and the Value Proposition Canvas holds up anyway: the user wants to pick dinner without losing half an hour, their pains are couple arguments and mental fatigue, the wheel takes the weight of the choice off them, and what the wheel decides is not up for discussion. If the method works on a stupid idea, it works.",
        },
        {
          title: "Measuring clicks, not compliments",
          body: "A landing page that collects emails measures what people declare, and people declare one thing and do another. The pPoC measures actions that cost something: completing the preference setup, clicking on a €0.99 a month subscription that charges nothing but records the willingness to pay. If nobody clicks, we do not write the backend.",
        },
      ],
      outcomes: [
        "From 17 ideas to one, filtered through interviews, competitor analysis and a Value/Effort matrix, now in development.",
        "7 interviews with people in the target before drawing a single screen.",
        "Validation thresholds set before the pPoC launch: over 8% conversion at onboarding, over 2% clicks on the pre-order.",
      ],
      learnings: [
        "UX comes before code. Perfect software that does not solve a real need is just a well-written cost.",
        "Talking to real people early costs little and cuts a lot. Most of the ideas we liked had no market, and we found out before writing code.",
      ],
    },
    {
      name: "Music Agency — Tour Management & Digital Strategy",
      description:
        "I organised booking and tours for the artists of an Italian music agency and designed its online communication: from the negotiations with promoters to the social channels, grown towards people who work in music rather than towards the general public.",
      date: "2023-01",
      tags: [
        "Tour management",
        "Booking",
        "Content Strategy",
        "Digital marketing",
        "Event management",
      ],
      slug: "music-agency",
      primaryMode: "creative",
      role: "Tour Manager & Digital Strategist, remote collaboration (2023–2024).",
      problem:
        "The agency's roster needed two things at once: live dates organised well, across venues, promoters and contracts, and an online presence that spoke to people who work in music. The social channels were growing, but the followers and the agency's real work never met.",
      process: [
        "Research — Before proposing anything I interviewed the people at the agency: how a date comes about, who really matters among the contacts, where the contact with musicians, producers and labels gets stuck.",
        "Insight — It needed the right followers, more than many followers. The channels had to become a way to get in touch with the industry, and every post a chance to open a working relationship.",
        "Ideation — I proposed a playlist of emerging artists as a way to meet people: every artist added is a direct contact with a musician, a producer or a label, and people discover each other instead of just following each other. On the same logic I proposed a radio format, to take the idea beyond the streaming platforms.",
        "Execution — I wrote the content strategy and the copy for the agency's birthday party, and meanwhile I did the booking and tour management work: finding venues, negotiating with promoters, closing contracts. All the way to the night at Arci Bellezza in Milan, which I followed from start to finish.",
      ],
      decisions: [
        {
          title: "Listen first, then propose",
          body: "No proposal came before the interviews with the people who work at the agency every day. The playlist and the radio format, the ideas later taken up, came from there and not from a marketing manual. It is what I do with the users of a piece of software, only outside software.",
        },
        {
          title: "The playlist as an excuse to get in touch",
          body: "I thought of a playlist of emerging artists as a reason to contact someone, before thinking of it as content to publish. Every addition opens a conversation with whoever makes or produces that music, and the radio format took the same idea where streaming does not reach.",
        },
        {
          title: "Speaking to the industry",
          body: "Growing the numbers would have been easy, and useless. I rewrote the content for people who work in the sector: musicians, producers, labels, promoters.",
        },
      ],
      outcomes: [
        "Followers doubled with no advertising, towards an industry audience: musicians, labels, promoters.",
        "The night at Arci Bellezza in Milan, from booking to communication.",
        "Booking and coordination of concerts for the whole roster, on my own.",
      ],
      learnings: [
        "Qualitative research works outside software too. I interviewed the agency the way you interview users, and the proposals hit the mark the first time.",
        "A channel is worth the conversations it opens with the right people. Followers come after.",
      ],
    },
    {
      name: 'Film "Double"',
      description:
        'I played the deuteragonist in the film "Double", produced in Turin by Filmine and presented at the Independent Film Festival in San Francisco in 2022 and at the Cinema Massimo in Italy.',
      date: "2022-01",
      tags: ["Cinema", "Acting"],
    },
    {
      name: "Covid-19 Data Management App",
      description:
        "I developed with React an application for visualising Covid-19 data used across multiple US hospitals.",
      date: "2022-01",
      tags: ["React", "Healthcare", "USA"],
    },
    {
      name: "WebComponents Design System for Aruba",
      description:
        "I built with Lit, HTML and SASS the WebComponents UI library for Aruba, reusable across products.",
      date: "2022-06",
      tags: ["Lit", "WebComponents", "Design System", "Aruba"],
    },
    {
      name: "Square Festival – Artiversum",
      description:
        "I co-founded and organised the Square Festival in the Quadrilatero Romano district of Turin, a multidisciplinary cultural event.",
      date: "2017-05",
      tags: ["Event management", "Culture", "Turin"],
    },
    {
      name: "Veni Vidi Vinyl",
      description:
        "I created Veni Vidi Vinyl with a friend, a listening-session night built around vinyl records brought by the people who showed up. I designed it to give weight to material listening: every playback wears the vinyl down, so every listen is unrepeatable. I did it purely for the fun of doing it.",
      date: "2017-01",
      tags: ["Event management", "Music", "Vinyl"],
    },
    {
      name: "Invented word — Turin International Book Fair",
      description:
        "I created and publicly presented a new word, with its roots, sound and meaning, at the Turin International Book Fair. Inventing a word that holds up is the most serious language game I know.",
      date: "2019-05",
      tags: ["Poetry", "Linguistics", "Creativity", "Book Fair"],
    },
    {
      name: "Poetry",
      description:
        "I have written poems awarded in competitions in Italy and Australia, and one was chosen and read on a Radio Capital programme. I write in free verse, no schemes: it is the part of my writing that answers to no one.",
      tags: ["Poetry", "Creative writing", "International awards"],
    },
    {
      name: "The 'Moustache Paper' — featured in La Stampa",
      description:
        "My school paper on moustaches ended up on the pages of La Stampa. There was no strategy: just moustaches, taken very seriously, and a newspaper deciding that was news.",
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
      name: "Stepping in to protect others in a public space",
      description:
        "I stepped into a dangerous situation on the street to protect other people. Improvisation teaches you to stay in the moment without freezing, and off stage it works exactly the same.",
      tags: ["Civic courage", "Composure under pressure", "Quick thinking"],
    },
    {
      name: "Auctioneer at a European charity gala (Burger King)",
      description:
        "I hosted a charity auction in English during a European Burger King event with international guests. The pace of an auction, a live audience and a foreign language all at once: the kind of evening where theatre helps more than vocabulary.",
      tags: ["Professional English", "Public speaking", "Event hosting", "Corporate events"],
    },
  ],

  // ── AI Workflow ───────────────────────────────────────────────────────────
  aiWorkflow: [
    {
      tool: "Claude",
      title: "Development, code review and site copy",
      desc: "I write and review code on Angular and Astro architectures, analyse bugs and refactors, and generate the site copy in my own voice.",
      impact: "Coding · Debug · Copy",
      tags: "tech creative human",
    },
    {
      tool: "GitHub Copilot",
      title: "Autocomplete in Angular enterprise development",
      desc: "I generate NGRX boilerplate, Jest tests and repetitive architectural patterns, with critical validation of the output.",
      impact: "Daily coding",
      tags: "tech",
    },
    {
      tool: "Claude Code Skills",
      title: "Writing, style and vocabulary rules applied everywhere",
      desc: "I built skills dedicated to writing, syntax rules and tone of voice: every text on the site follows them without repeated manual review.",
      impact: "Writing · Rules · Style",
      tags: "tech human",
    },
    {
      tool: "MCP",
      title: "MCP servers for GitLab, Jira and Playwright",
      desc: "I connect GitLab, Jira and Playwright as MCP tools: I open and close issues, merge requests and end-to-end tests directly from the AI chat.",
      impact: "GitLab · Jira · Playwright",
      tags: "tech",
    },
    {
      tool: "Figma AI",
      title: "From brief to interactive prototype in minutes",
      desc: "I generate screens and navigation flows in Figma from a text description, as a base for structured wireframing.",
      impact: "UX/UI prototyping",
      tags: "creative tech",
    },
    {
      tool: "Miro AI",
      title: "Workshop and brainstorming synthesis",
      desc: "I turn sticky notes and workshop maps into thematic clusters and next steps, without rewriting every session by hand.",
      impact: "Facilitation · Workshops",
      tags: "human",
    },
    {
      tool: "NotebookLM",
      title: "Research and document synthesis",
      desc: "I load technical documentation and UX research into NotebookLM to query it and find cross-references fast.",
      impact: "Research · Documentation",
      tags: "tech creative",
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
      name: "Team Delivery & Agile Facilitation",
      description:
        "How a team goes from operational chaos to autonomy: the method comes from improvisation, the structure from Agile, and in between a lot of communication.",
      steps: [
        "Theatre and improvisation",
        "Agile Methodology",
        "Effective communication",
        "T-shaped thinking",
        "Strategic autonomy",
        "Git",
      ],
    },
    {
      name: "Strategic Product Communication",
      description:
        "From copy to campaign: how a technical product finds the words to be understood, and bought.",
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
        "The GO Automated method: every repeatable process becomes an agent. From AI architecture to deployment with no manual steps, in 1–2 week sprints.",
      steps: [
        "Prompt Engineering",
        "MCP Protocol",
        "Node.js",
        "REST API",
        "AI-Augmented Productivity",
        "Agile Methodology",
      ],
    },
    {
      name: "Build → Measure → Learn",
      description:
        "From release to decision: I use product data to see what actually works, before spending weeks of development on it.",
      steps: ["PostHog", "Vercel", "Agile Methodology", "UX Research"],
    },
  ] as ValueFlow[],

  // ── Feedbacks — testimonials from people who have worked with Giulio ───────
  feedbacks: [
    {
      name: "Fabio Cencetti",
      role: "Design System Architect & Manager",
      quote:
        "Giulio has a remarkable range of skills: when I needed a video edited, he did it himself, and together we built the Design System, covering a lot of ground side by side. He has human qualities that are rare in the workplace, and that is exactly what makes him a rare professional: a unicorn.",
      keywords: [],
    },
    {
      name: "Lorenzo Rando",
      role: "Recruiter / Head Hunter",
      quote:
        "I met Giulio during an interview that was meant to last thirty minutes and ended up running for almost two hours, because every question opened up a real train of thought, never a rehearsed answer. He listens before he responds, and he's one of the few people who can be direct without ever making the other person uncomfortable. He has a genuine curiosity about people, not just about the role to fill: you can feel it from the first question.",
      keywords: [],
    },
    {
      name: "Eleonora D'Agostino",
      role: "Owner, Bambagia Lab Design",
      quote:
        "Giulio is a highly capable and, above all, versatile professional. He supported me on a project where he fully understood my needs and delivered exactly what I was after, adapting his work along the way to requests as they came in, with great speed and precision. I recommend him without reservation.",
      keywords: [],
    },
  ] as Feedback[],
} as const satisfies Record<string, unknown>;

export type CvDataEn = typeof cvDataEn;
