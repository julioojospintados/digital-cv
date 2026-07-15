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
  AiWorkflowItem,
  ValueFlow,
  Feedback,
} from "./cv.js";

export const cvDataEn = {
  // ── Personal info ──────────────────────────────────────────────────────────
  personal: {
    name: "Giulio Occhipinti",
    title: "Digital Innovation Consultant & Technical Partner for businesses of all sizes",
    summary:
      "I support businesses of all sizes across three integrated pillars: Design (UX/UI, IBM and SkillUp certifications), Technology (Angular, Lit, MCP, Node.js) and Method (lean Agile, short sprints, team autonomy). I have designed and built web interfaces for over 6 years in enterprise contexts (Intesa San Paolo, Aruba, Rai Pubblicità). I choose the tool based on the problem and I have worked in 5 countries. I don't deliver slide decks: I get inside the business, understand the real problem, build the solution and run it.",
    location: "Turin, Italy",
    age: 36,
    avatar: "",
    availability: "available" as "available" | "open" | "not-available",
    phone: "+39 373 800 5769",
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
        "I simplified the UX for non-technical operators: –40% training time on new workflows.",
        "I automated the Cursor → GitLab CI/CD → deploy pipeline: zero manual intervention.",
        "–80% average development time with an AI-augmented workflow, project ongoing.",
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
          mode: "management",
          role: "Single Point of Contact",
          description:
            "I managed the project end-to-end as the single point of contact: 1-to-2-week sprints, a backlog built on business goals and impactScore measured at every release. No formal reports: working demos and numbers.",
          highlights: [
            "I closed every sprint with a working demo, not a progress slide.",
            "I built the backlog on business goals, not on the list of features requested out loud.",
            "I made the team autonomous on the new workflows: the knowledge stays in the company, not with the consultant.",
          ],
        },
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
      startDate: "2024-11",
      endDate: "present",
      location: "Turin, Italy",
      remote: true,
      description:
        "I built this interactive CV end-to-end with GitHub Copilot and Claude as operational assistants: architecture, UI, GSAP animations, MCP server and HTTP API with Hono. The site uses Astro and Lit, the MCP server exposes the data as an API for AI agents.",
      highlights: [
        "I developed an MCP server with tools, resources and prompt templates that exposes the CV data to AI agents (VS Code Copilot, Claude Desktop).",
        "I developed the site with Astro, Lit and GSAP animations: narrative preloader, SVG wave hold effect, distortion filter via feTurbulence.",
        "I developed the HTTP server with Hono, OpenAPI spec, Zod validation and Vitest tests: coverage above 80%.",
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
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "present",
      location: "Turin, Italy",
      remote: false,
      description:
        "I develop enterprise systems for Intesa San Paolo and Aruba: design systems, WebComponent libraries and microfrontend architectures used by millions of people.",
      highlights: [
        "I led the Aruba Design System team as Tech Lead and Scrum Master, over 3 years and more than 30 people: a library of over 100 WebComponents adopted cross-product.",
        "I developed enterprise Angular architecture for Intesa San Paolo in a team of over 50 people, with shared standards and code review.",
        "I introduced systematic unit testing with Jest, with direct impact on release stability and coverage.",
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
      facets: [
        {
          mode: "creative",
          role: "Design System Developer — Aruba",
          description:
            "I built the Aruba design system from the side of the people who use it every day: a library of over 100 WebComponents in Lit, designed together with the designers so every component respects the typography, spacing and states defined in Figma.",
          highlights: [
            "I translated the designers' visual specifications into reusable cross-product components, with shared naming and APIs.",
            "I defended typographic consistency, spacing and component states in code reviews, on a team of over 30 people.",
          ],
        },
        {
          mode: "management",
          role: "Tech Lead & Scrum Master — Aruba Design System",
          description:
            "I led the Aruba design system team for over 3 years: more than 30 people across development and design, Agile ceremonies, backlog priorities and shared code review standards. My job was removing friction: fewer dependencies between teams, more predictable releases.",
          highlights: [
            "I coordinated more than 30 people across developers and designers on a library adopted cross-product.",
            "I set code review and testing standards with a direct impact on release stability.",
            "I bridged business, design and development in setting backlog priorities.",
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
        "I doubled the followers with a targeted audience (musicians, labels, promoters): organic growth, not pure volume.",
        "I organised a live event at Arci Bellezza in Milan, from booking to communications.",
        "I coordinated booking and concerts: venue research, promoter negotiation, contracts.",
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
      facets: [
        {
          mode: "management",
          role: "Tour Manager",
          description:
            "I managed the roster's booking and tours independently: venue research, promoter negotiations, contracts and date coordination, all the way to the live event at Arci Bellezza in Milan followed end-to-end.",
          highlights: [
            "I coordinated booking and concerts across the whole roster, independently.",
            "I followed the Arci Bellezza event in Milan from booking to communications.",
            "I negotiated with venues and promoters through to signed contracts.",
          ],
        },
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
        "I assist the lead videographer in video production for high-end international weddings in Tuscany, a sector demanding extreme attention to detail.",
      highlights: [
        "I shot ceremonies with hundreds of international guests as second operator.",
        "I worked on multi-day events in multicultural contexts.",
        "I adapted my role to on-set needs in real time, in high-complexity logistical contexts.",
      ],
      skills: [
        "Videography",
        "Post-production",
        "Color grading",
        "Aesthetic sensibility",
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
        "I developed frontend full remote in a distributed team between Turin and Los Angeles, on a clinical data web application for US hospital facilities: an established React codebase, large-scale CSS refactoring and integration with real-time clinical APIs.",
      highlights: [
        "I developed React dashboards for visualising and monitoring Covid-19 clinical data in US hospitals.",
        "I rewrote the CSS with the BEM pattern on a 20,000-line codebase: –800 duplicate lines.",
        "I integrated REST and GraphQL APIs for real-time clinical data visualisation.",
      ],
      skills: [
        "React",
        "TypeScript",
        "CSS / BEM",
        "GraphQL",
        "REST API",
        "Data Visualization",
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
        "I developed management applications for Rai Pubblicità and Intesa San Paolo, replacing internal processes on legacy systems, with faster workflows for end users.",
      highlights: [
        "I developed internal management applications for Rai Pubblicità with Angular, Spring and Bootstrap.",
        "I developed a document and revision tool for Intesa San Paolo with JSF.",
        "I translated complex business requirements into interfaces usable by non-technical operators.",
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
        "I worked externally with Satispay during a fast-growth phase, inside processes still evolving and with deliveries of immediate impact.",
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
        "I host cultural festivals and live shows across Italy and solve on-stage surprises with theatre improvisation techniques.",
      highlights: [
        "I hosted multidisciplinary cultural festivals (music, art, theatre).",
        "I moderated panels and talks with international guests.",
        "I solved live incidents on stage with my improvisation training.",
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
        "I have worked as a freelance photographer since 2009, alongside my other roles, with projects in Italy, Tanzania and beyond.",
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
        "I wrote local news and cultural events for the Corriere di Chieri. There I learned to turn raw information into readable stories, a skill I still use in copy and technical documentation.",
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
        "I designed visual materials and brand identity for local clients, combining technical graphic design training with an eye built over years of photography.",
      highlights: [
        "I designed graphic materials and brand identity for clients in the local and cultural sector.",
        "I applied visual hierarchy and typography principles to print and digital materials.",
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
        "I worked in sales and customer consultancy at the Mondadori Store in Area 12, Turin, with responsibility for the books section.",
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
      role: "AV Technician and Actor",
      startDate: "2014-10",
      endDate: "2018-02",
      location: "Turin, Italy",
      remote: false,
      description:
        "I ran the audio and lighting for theatre productions. I performed as an actor and improviser in Italy and Luxembourg.",
      highlights: [
        "I performed in theatre improvisation shows in Italy and Luxembourg.",
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
        "I worked across theatre operations, box office and front-of-house at one of Italy's most-visited cinema chains, hundreds of guests a day. That is where my attention to every user touchpoint in UX comes from.",
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
      description:
        "I ran the photography centre of a tourist entertainment facility in Zanzibar.",
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
        "I coordinated entertainment teams and programmes at seasonal beach resorts in Ravenna and Crotone, in highly variable seasonal contexts.",
      highlights: [
        "I coordinated entertainment teams in high-variability, high-pressure seasonal contexts.",
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
        "I worked the counter and supported the kitchen, often on late-night shifts, in a high-pace context with minimal margin for error.",
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
      endDate: "2026-05",
      location: "Italy",
      remote: true,
      description:
        "I designed the interfaces for a client's website for Bambagia Design Lab: research on the client and competitors, wireframes and a prototype, hand-written HTML and CSS and site variants with different palettes, converted into Figma drawings with dedicated plugins.",
      highlights: [
        "I studied the client and the competitors before designing: every interface choice is motivated, not aesthetic.",
        "I produced site variants with different palettes, converted into Figma drawings with dedicated plugins.",
        "I chose the right delivery flow so the client can edit the site independently.",
      ],
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "I built a reusable environment in VS Code with Figma MCP and Wix MCP, instructing the agent with the project's graphic rules to export correct wireframes and prototypes. I verified the limits of Wix MCP and found the right path with the Figma → Wix plugin.",
          highlights: [
            "I built a reusable VS Code environment with Figma MCP and Wix MCP, with the agent instructed on the project's graphic rules.",
            "I found that Wix MCP generates a static frame via Astro: valid only when the client doesn't need to edit the site.",
            "I found the Figma → Wix plugin for modules: the client edits the site on their own after delivery.",
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
        "I have hosted public events for over 10 years, with theatre training behind me: I convey complex messages clearly, calibrated to any type of audience.",
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
        "I build trust with colleagues, clients and counterparts, in high-variability environments: from international customer service to coordinating cross-functional teams.",
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
      name: "Assertiveness",
      description:
        "I express technical and strategic positions clearly and respectfully, even in disagreement. I use dialogue to move the project forward, not to win the argument.",
      links: [
        { target: "Effective communication", type: "conceptual" },
        { target: "Strategic autonomy", type: "conceptual" },
        { target: "Lateral problem solving", type: "cross-domain" },
      ],
    },
    {
      name: "Aesthetic sensibility",
      description:
        "I have been photographing for over 15 years: that eye translates into sharper UI choices, with a direct impact on brand perception and the quality of the user experience.",
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
        "I bridge engineering (frontend), design (UX/UI) and marketing (SEO/SEM): fewer communication silos, faster time-to-market.",
      links: [
        { target: "Lateral problem solving", type: "conceptual" },
        { target: "Strategic autonomy", type: "conceptual" },
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
        "I trained and performed with B-Teatro (2013–2020), with shows in Italy and Luxembourg. Improvisation trains active listening, rapid thinking and the ability to turn failure into a resource.",
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
        "I have won poetry awards in Italy and Australia. Creative writing translates into sharper copy, product storytelling and synthesis.",
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
        "I integrate artificial intelligence as an extension of the cognitive process, not a shortcut. GitHub Copilot for development speed, ChatGPT for rapid conceptual prototyping, Midjourney for visual exploration. The goal is to reduce time on repetitive tasks and expand the solution space during creative phases.",
    },
    {
      name: "T-shaped Problem Solving",
      description:
        "My background spans engineering, design and marketing: I identify solution patterns invisible to mono-disciplinary teams. I don't just execute, I identify the right problem to solve.",
    },
    {
      name: "Framework-Agnostic Thinking",
      description:
        "I have worked with Angular, React, Lit, WebComponents, Astro and heterogeneous creative paradigms: I choose the tool based on the problem, not the other way around. This avoids technological solutionism and produces architectures that stay maintainable in the long run.",
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
        "I built this interactive open source CV with an AI-augmented workflow (GitHub Copilot and Claude). A two-layer system: an Astro and Lit site with GSAP animations and SVG wave effects, plus an MCP server that exposes the CV data as an API for AI agents. It is the live demonstration of the method: on my own I produced in days what a team would need months to deliver.",
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
      slug: "digital-cv",
      primaryMode: "tech",
      role: "AI Workflow Designer & Full-Stack Developer. Solo ideation, UX/UI and development.",
      problem:
        "I had started working with AI, MCP and vibe coding, and I needed a real proving ground, not a tutorial. At the same time my PDF CV couldn't demonstrate a T-shaped profile: it listed skills without showing them in action, forcing three very different readers, recruiter, CTO and art director, into the same flat format. I merged the two needs: building the tool I was missing, using the very method I wanted to prove.",
      process: [
        "Research — I defined the CV's three real readers (generalist recruiter, CTO, art director) and what each must find within the first 3 seconds: reliability and readability, stack and architecture, aesthetics and storytelling. Every later decision answers to one of them: if it can't be defended in an interview, it doesn't ship.",
        "Concept — Knolling: order and variety at once. My skills are heterogeneous (code, design, stage, method) and the most honest way to present them is to lay them on the table like objects in a knolling photograph: everything visible, catalogued, intentional, no closed drawers.",
        "Information architecture — One profile, four perspectives: the /tech /creative /human /management routes change emphasis and accent colour, never structure or content. Readers choose their own point of view; the other sides stay visible as low-opacity whispers, never hidden.",
        "Design system — Fixed teal background with 4 per-mode accents, Lexend + JetBrains Mono typography, a square/glow system for skill levels instead of percentage bars, animations on transform/opacity only with reduced-motion respected. I set the constraints before writing the components.",
        "AI-augmented build — Vibe coding with GitHub Copilot and Claude as operational pairs: architecture, UI, GSAP animations, and an MCP server with tools, resources and prompt templates exposing the CV as an API for AI agents. The site is the proof of the workflow it claims.",
      ],
      decisions: [
        {
          title: "The graph where there's room, cards where there's hurry",
          body: "The most spectacular skills view is a D3 force graph, but graphs are admired, not scanned. On mobile the default is the card view, readable in 5 seconds, and D3 (~130KB) only loads for those who actually open the graph. On desktop, with the space and a mouse to explore it, the graph welcomes you first: the default follows the context of use, not the effect.",
        },
        {
          title: "Whispers, not silences",
          body: "When you pick a mode, off-topic cards don't disappear: they drop to low opacity. Hiding them would have contradicted the site's thesis. Knolling is radical transparency, and anyone assessing a T-shaped profile must be able to see the breadth even while examining the depth.",
        },
        {
          title: "Conventions where the reader is in a hurry",
          body: "Extra experiences are revealed with \"Read 3 more\", the LinkedIn and Medium pattern, instead of the branded CTA I tried first: where readers are in a hurry, convention beats originality. For the same reason the current role sits at the top of the experience cluster: recruiters read reverse-chronologically and look for \"where do they work now\".",
        },
        {
          title: "Accessibility as a constraint, not a polish pass",
          body: "Every accent across the 4 modes has a muted variant recalibrated for WCAG AA contrast (≥4.5:1) on the teal background. Visible focus, skip link and prefers-reduced-motion are design-system rules set at the start, not patches added at the end.",
        },
        {
          title: "Iteration: the wrong scroll",
          body: "The first version of the home used native \"stepped\" scroll-snap: in real testing it felt rigid and inconsistent with the fluid scroll of the CV pages. I scrapped it and replaced it with one smooth scroll across the whole site plus per-section reveals: consistency of gesture is worth more than a single effect.",
        },
      ],
      outcomes: [
        ">80% test coverage (Vitest) on the MCP/HTTP layer.",
        "MCP server with tools, resources and prompt templates: CV data API for AI agents, live demonstration.",
      ],
      learnings: [
        "AI truly accelerates only inside constraints set beforehand: with tokens, animation rules and explicit DO NOTs, vibe coding delivers; without them, it delivers chaos to redo.",
        "Every detail must survive the question \"why?\": if a visual choice has no interview-ready answer, it's decoration.",
        "Test your certainties early: the most \"wow\" ideas, the graph as the only view and the stepped scroll, were the first I scaled back in front of real use.",
      ],
    },
    {
      name: "Product Discovery — UX Research & Product Strategy",
      description:
        "With a technical partner I flipped the ideation process of a digital product: research into people's real needs first, the idea after. A behavioural map on Miro, interviews, competitor analysis: out of 17 concepts one remains, now in development, to be validated with a high-fidelity prototype before writing any code.",
      date: "2026-05",
      tags: [
        "UX Research",
        "Product Strategy",
        "User interviews",
        "Value Proposition Canvas",
        "Miro",
        "Figma",
        "Prototyping",
      ],
      slug: "product-discovery",
      primaryMode: "creative",
      role: "UX Researcher & Product Strategist, ongoing project with a technical partner (2026).",
      problem:
        "Most apps fail because they solve problems people don't feel, or try to manufacture needs that don't exist. With a technical partner I flipped the classic ideation process: no starting idea to defend, first the study of the behaviours, anxieties and everyday desires that digital products fail to intercept. The goal: validate real interest in a product before writing a single line of code.",
      process: [
        "Research — I mapped people's behaviours and deep needs on Miro, organised into macro-areas: identity and status, fear of ageing, need for control, relationships. I classified each need by severity, prevalence and cultural area, grounded in behavioural psychology instead of the usual demographic segmentation.",
        "Validation — A theoretical map is an echo chamber: you end up agreeing with yourself. I verified the needs with 7 quick interviews with people in the target, informal fifteen-minute conversations, and with an analysis of the competitors already trying to answer those needs, studying what works and what doesn't in their flows.",
        "Ideation — From the map, together with my partner, I generated 17 product ideas, each anchored to a precise need. I broke down the most promising ones with the Value Proposition Canvas and stress-tested them with AI in an adversarial role: a sceptical venture capitalist attacking the economics, an analyst hunting for technical and legal blockers.",
        "Prioritisation — With a Value/Effort matrix I crossed user value with design effort: of the 17 ideas 4 survived, and all resources went into a single one, now in development.",
        "PPoC — The final test is a Probabilistic Proof of Concept: a high-fidelity Figma prototype that looks like a real working app, shown to users to measure behaviours, not opinions. The success thresholds are set before launch: over 8% conversion to onboarding, over 2% clicks on the pre-order.",
      ],
      decisions: [
        {
          title: "Needs first, idea later",
          body: "The classic process starts from an idea and looks for confirmation. We started from the needs and let the ideas emerge from the map. It costs more time upfront, but it removes the worst risk: falling in love with a product only its inventors like.",
        },
        {
          title: "Real interviews against the echo chamber",
          body: "Desk research was more comfortable, but it confirms what you already think. Talking to people in the target flipped the picture: many ideas that looked strong on the whiteboard didn't survive a fifteen-minute conversation. The cut from 17 to 4 ideas came almost entirely from there.",
        },
        {
          title: "AI as devil's advocate, not as an oracle",
          body: "I didn't ask AI to generate ideas: the ideas were ours. I instructed it to attack them, in the role of a sceptical venture capitalist and of a technical and legal analyst. A compliant AI confirms anything; an adversarial one finds in a few hours the holes we would have discovered after launch.",
        },
        {
          title: "A fake example to protect the real idea",
          body: "The idea in development stays confidential, so I tell the method through a deliberately silly example: WhatTheHeckDoIEat, an app that decides what you eat for dinner by spinning a wheel. The need is decision anxiety. The Value Proposition Canvas holds up all the same: the user has to pick dinner without losing half an hour, their pains are couple arguments and mental fatigue, the solution lifts the weight of choosing, the wheel decides and there's no arguing. If the framework works on a dumb idea, it works.",
        },
        {
          title: "Measure clicks, not compliments",
          body: "A landing page collecting emails measures declared intent, and people declare one thing and then do another. The PPoC measures behaviours that cost something: completing the preference setup, clicking on a €0.99/month subscription that charges nothing but records the willingness to pay. If nobody clicks, the backend doesn't get written.",
        },
      ],
      outcomes: [
        "From 17 product ideas to a single one, filtered through interviews, competitor analysis and a Value/Effort matrix, now in development.",
        "7 interviews with people in the target before designing a single screen.",
        "Validation thresholds set before the PPoC launch: over 8% conversion to onboarding, over 2% clicks on the pre-order.",
      ],
      learnings: [
        "UX comes before code: technically perfect software that doesn't solve a real need is just a well-written cost.",
        "AI truly accelerates only when you give it an uncomfortable role: as devil's advocate it found in hours the weak points we would have discovered with the product finished.",
        "Talking to real people early costs little and cuts a lot: most of the ideas we liked had no market, and knowing it right away saved months of work.",
      ],
    },
    {
      name: "Music Agency — Tour Management & Digital Strategy",
      description:
        "I organised booking and tours for the roster artists of an Italian music agency and designed the digital communication: from promoter negotiations to organic growth of social channels aimed at an industry audience.",
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
        "The agency's roster needed two things at once: well-organised live dates, across venues, promoters and contracts, and a digital presence that spoke to the industry itself, not just a generic audience. The social channels were growing in volume but opening no doors: followers and the agency's real work were two disconnected worlds.",
      process: [
        "Research — I interviewed the agency's people to understand the work from the inside: how live dates actually come together, who the interlocutors that matter really are, and where contact with musicians, producers and labels breaks down.",
        "Insight — The problem wasn't \"more followers\" but the right followers: communication had to work as a contact channel with the industry, not as a showcase for a generic audience. Every piece of content had to be rethought as an opportunity for a professional relationship.",
        "Ideation — I proposed a curated playlist of emerging artists as a networking tool: every addition opens a direct contact with musicians, producers and labels, mutual discovery instead of passive follows. On the same logic I proposed a radio show format to extend the idea beyond streaming platforms.",
        "Execution — I defined the content strategy on the channels, wrote the copy for the agency's birthday event and carried out the operational work of booking and tour management: venue research, promoter negotiation, contracts, all the way to the live event at Arci Bellezza in Milan, followed end-to-end.",
      ],
      decisions: [
        {
          title: "Listen first, propose later",
          body: "No proposal came before the interviews with the people who work at the agency every day. The ideas that were then embraced, the playlist and the radio format, grew out of needs that had been heard, not out of a marketing playbook applied from the outside: the same principle as user research, taken beyond software.",
        },
        {
          title: "The playlist as a tool, not as content",
          body: "A playlist of emerging artists is not a post to publish: it's a reason to reach out. Every addition opens a concrete conversation with a musician, a producer or a label, mutual discovery instead of passive follows. The radio format proposal extended the same logic beyond streaming platforms.",
        },
        {
          title: "Speak to the industry, not to the crowd",
          body: "Growing in volume would have been easy and useless. I rethought the content for specific professional interlocutors: it's the difference between a shop window and a channel that opens doors, and it's why the +100% follower growth is made of contacts that matter, not numbers.",
        },
      ],
      outcomes: [
        "+100% followers: organic growth, targeted audience (musicians, labels, promoters), not pure volume.",
        "Live event at Arci Bellezza in Milan, from booking to communications.",
        "Concert booking and coordination across the whole roster, independently.",
      ],
      learnings: [
        "Qualitative research works outside software too: interviewing the agency the way you interview users made the proposals relevant on the first try.",
        "A channel's value isn't measured in followers but in conversations opened with the right people.",
      ],
    },
    {
      name: 'Film "Double"',
      description:
        'I played the deuteragonist in the film "Double", produced in Turin by Filmine and presented at the Independent Film Festival in San Francisco in 2022.',
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
        "I created and publicly presented a new word, with its roots, sound and meaning, at the Turin International Book Fair. An extreme exercise in linguistic and poetic synthesis: the same capacity for maximum impact with minimum means that I apply every day in clean code and product communication.",
      date: "2019-05",
      tags: ["Poetry", "Linguistics", "Creativity", "Book Fair"],
    },
    {
      name: "Internationally awarded poetry",
      description:
        "I have written poems awarded in national and international competitions (Italy and Australia). Creative writing and software development share the same root: synthesis, formal precision and meaning within explicit constraints.",
      tags: ["Poetry", "Creative writing", "International awards"],
    },
    {
      name: "The 'Moustache Paper' — featured in La Stampa",
      description:
        "My school paper on moustaches, an involuntary case of marketing and anthropological curiosity, ended up on the pages of La Stampa. Practical proof that originality of thought generates unexpected attention, and that narrative matters more than format.",
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

  // ── AI Workflow ───────────────────────────────────────────────────────────
  aiWorkflow: [
    {
      tool: "GitHub Copilot",
      title: "Angular enterprise development acceleration",
      desc: "I generate NGRX boilerplate, Jest tests and repetitive architectural patterns, with critical validation of the output.",
      impact: "-87% boilerplate",
      tags: "tech",
    },
    {
      tool: "ChatGPT / Claude",
      title: "Prompt Engineering for UX prototyping",
      desc: "I derive user personas, navigation flows and test scenarios from text briefs. I applied it during the IBM UX Research phase.",
      impact: "-90% discovery time",
      tags: "creative tech",
    },
    {
      tool: "Claude / GPT-4",
      title: "Code review and Angular architecture",
      desc: "I analyse code quality issues, refactoring and microfrontend architectures with an LLM as technical reviewer.",
      impact: "-60% debug time",
      tags: "tech",
    },
    {
      tool: "Midjourney",
      title: "Visual exploration for UX/UI briefs",
      desc: "I generate moodboards and visual concepts to align counterparts before wireframing, without costly iterations.",
      impact: "-70% alignment cycles",
      tags: "creative",
    },
    {
      tool: "AI Tools",
      title: "Copywriting and technical documentation",
      desc: "I produce SEO copy, A/B variants for landing pages and technical documentation from annotated code.",
      impact: "+3x content velocity",
      tags: "creative",
    },
    {
      tool: "Figma Make",
      title: "From brief to interactive prototype in minutes",
      desc: "I generate screens and navigation flows directly in Figma from a natural language description. I applied it during rapid prototyping before structured wireframing.",
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
      name: "Team Delivery & Agile Facilitation",
      description:
        "How I take a team from 'operational chaos' to 'conscious autonomy': improvisation as methodology, Agile as structure, communication as the binding agent.",
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
