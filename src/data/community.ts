export type ResidentProfile = {
  unitId: string
  unitLabel: string
  names: string
  work: string
  stage: 'new' | 'friendly' | 'close' | 'host'
  relationship: number
  lastTouch: string
  note: string
  nextMove: string
  preferredContact: string
  socialStyle: string
  interests: string[]
  sourceLabel?: string
  profileUrl?: string
  links?: ProfileLink[]
  dataFilled?: boolean
}

export type ProfileLink = {
  label: string
  url: string
  detail: string
}

type ResidentSeed = {
  names: string
  apartments: string[]
  sourceLabel: string
  profileUrl?: string
  work: string
  detail: string
  interests: string[]
  relationship?: number
  stage?: ResidentProfile['stage']
  links?: ProfileLink[]
}

const unitIdsByApartment: Record<string, string> = {
  '110': '651475',
  '208': '651491',
  '211': '651493',
  '213': '651495',
  '215': '651497',
  '220': '651499',
  '221': '651500',
  '231': '651504',
  '247': '651512',
  '261': '651519',
  '301': '651523',
  '302': '651524',
  '303': '651525',
  '305': '651527',
  '306': '651528',
  '311': '651532',
  '315': '651536',
  '325': '651543',
  '343': '651549',
  '349': '651552',
  '351': '651553',
  '357': '651556',
  '445': '651588',
  '447': '651589',
  '457': '651594',
  '461': '651596',
  '659': '651647',
  '732': '651658',
  '734': '651660',
  '735': '651661',
  '741': '651667',
  '747': '651673',
  '748': '651674',
  '754': '651680',
  '758': '651684',
  '835': '651698',
  '844': '651706',
  '845': '651707',
  '850': '651711',
  '852': '651713',
  '854': '651715',
  '855': '651716',
  '858': '651719',
  '861': '651722',
  '868': '651727',
}

const residentSeeds: ResidentSeed[] = [
  {
    names: 'Namanyay Goel',
    apartments: ['311'],
    sourceLabel: 'YC profile',
    profileUrl: 'https://www.ycombinator.com/companies/gigacatalyst',
    work: 'Founder & CEO at Gigacatalyst',
    detail: 'YC Spring 2026 founder building an embedded AI customization layer that lets B2B SaaS customers create missing workflows inside existing products.',
    interests: ['enterprise AI', 'B2B SaaS', 'product customization', 'YC'],
    relationship: 48,
    stage: 'friendly',
    links: [
      {
        label: 'YC',
        url: 'https://www.ycombinator.com/companies/gigacatalyst',
        detail: 'Gigacatalyst company profile and founder bio.',
      },
      {
        label: 'Personal site',
        url: 'https://nmn.gl/',
        detail: 'Personal site and writing archive.',
      },
      {
        label: 'Company',
        url: 'https://gigacatalyst.com/',
        detail: 'Official Gigacatalyst product site.',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/namanyayg',
        detail: 'Public professional profile.',
      },
    ],
  },
  {
    names: 'Wyatt Marshall',
    apartments: ['231'],
    sourceLabel: 'YC profile',
    profileUrl: 'https://www.ycombinator.com/companies/halluminate',
    work: 'Co-Founder & CTO at Halluminate',
    detail: 'YC Summer 2025 founder building realistic data, sandboxes, evals, and benchmarks for browser and computer-use AI agents.',
    interests: ['agent evaluation', 'computer-use AI', 'RL environments', 'YC'],
    relationship: 45,
    stage: 'friendly',
    links: [
      {
        label: 'YC',
        url: 'https://www.ycombinator.com/companies/halluminate',
        detail: 'Halluminate company profile and founder bio.',
      },
      {
        label: 'Company',
        url: 'https://halluminate.ai/',
        detail: 'Official Halluminate site.',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/wyatt-marshall-a40797198',
        detail: 'Public professional profile.',
      },
      {
        label: 'Investor profile',
        url: 'https://antigravity.capital/portfolio/halluminate',
        detail: 'Portfolio page identifying Wyatt as CTO.',
      },
    ],
  },
  {
    names: 'Dhruv Roongta',
    apartments: ['215'],
    sourceLabel: 'YC profile',
    profileUrl: 'https://www.ycombinator.com/companies/slashy',
    work: 'Co-Founder at Slashy',
    detail: 'YC Summer 2025 founder working on AI agents that connect to apps, understand cross-tool context, and take actions across knowledge-work workflows.',
    interests: ['email agents', 'workflow automation', 'cross-tool context', 'YC'],
    relationship: 45,
    stage: 'friendly',
    links: [
      {
        label: 'YC',
        url: 'https://www.ycombinator.com/companies/slashy',
        detail: 'Slashy company profile and founder listing.',
      },
      {
        label: 'Company',
        url: 'https://www.slashy.com/',
        detail: 'Official Slashy site.',
      },
      {
        label: 'Forbes',
        url: 'https://councils.forbes.com/profile/Dhruv-Roongta-CTO-%40-Dash-Slashy/cfc7e562-6b0a-444e-85f2-35b7e8de772c',
        detail: 'Professional profile for Dash / Slashy.',
      },
      {
        label: 'Launch HN',
        url: 'https://news.ycombinator.com/item?id=45129031',
        detail: 'Launch discussion describing Slashy product direction.',
      },
    ],
  },
  {
    names: 'Shourya Vir Jain',
    apartments: ['213'],
    sourceLabel: 'YC profile',
    profileUrl: 'https://www.ycombinator.com/companies/ramain',
    work: 'Co-Founder & CEO at RamAIn',
    detail: 'YC Winter 2026 founder building enterprise computer-use agents that automate repetitive browser and desktop workflows through UI interaction.',
    interests: ['computer-use agents', 'UI automation', 'enterprise workflows', 'YC'],
    relationship: 45,
    stage: 'friendly',
    links: [
      {
        label: 'YC',
        url: 'https://www.ycombinator.com/companies/ramain',
        detail: 'RamAIn company profile and founder bio.',
      },
      {
        label: 'Company',
        url: 'https://ramain.ai/',
        detail: 'Official RamAIn product site.',
      },
      {
        label: 'Forbes',
        url: 'https://councils.forbes.com/profile/Shourya-Vir-Jain-Co-founder-CEO-RamAIn/0c5aea3f-8da4-4f7d-8858-8a731ef56e1e',
        detail: 'Professional profile identifying him as Co-founder & CEO.',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/SveeJ',
        detail: 'Public GitHub profile from the original dataset.',
      },
    ],
  },
  {
    names: 'Alisa Wu',
    apartments: ['343', '754'],
    sourceLabel: 'YC profile',
    profileUrl: 'https://www.ycombinator.com/companies/bluma',
    work: 'Co-Founder at Bluma',
    detail: 'YC Fall 2025 founder building an AI short-form content engine for cloning, templating, and scaling organic and paid video ads.',
    interests: ['short-form video', 'AI UGC', 'marketing automation', 'YC'],
    relationship: 43,
    stage: 'friendly',
    links: [
      {
        label: 'YC',
        url: 'https://www.ycombinator.com/companies/bluma',
        detail: 'Bluma company profile and founder bio.',
      },
      {
        label: 'Company',
        url: 'https://www.getbluma.com/',
        detail: 'Official Bluma product site.',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/wu-alisa',
        detail: 'Public professional profile.',
      },
      {
        label: 'YC launch',
        url: 'https://www.ycombinator.com/launches/Osw-bluma-the-ai-short-form-content-engine',
        detail: 'Launch post with product and team context.',
      },
      {
        label: 'Forbes article',
        url: 'https://www.forbes.com/councils/forbesbusinesscouncil/2026/02/19/storytelling-as-a-moat-in-a-commoditized-world/',
        detail: 'Article source from the original dataset.',
      },
    ],
  },
  {
    names: 'Milind Sagaram',
    apartments: ['261'],
    sourceLabel: 'YC profile',
    profileUrl: 'https://www.ycombinator.com/companies/helonic',
    work: 'Founder at Articulate / Helonic',
    detail: 'YC Fall 2025 founder building AI construction drawing analysis to detect clashes, callouts, discrepancies, and draft RFIs before field rework.',
    interests: ['construction AI', 'drawing analysis', 'RFIs', 'YC'],
    relationship: 38,
    links: [
      {
        label: 'YC',
        url: 'https://www.ycombinator.com/companies/helonic',
        detail: 'Helonic / Articulate company profile and founder bio.',
      },
      {
        label: 'Company',
        url: 'https://helonic.com/',
        detail: 'Official Helonic product site.',
      },
      {
        label: 'Personal site',
        url: 'https://www.milindsagaram.com/',
        detail: 'Personal site and background.',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/milind-sagaram',
        detail: 'Public professional profile.',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/milinds2403',
        detail: 'Public GitHub profile.',
      },
    ],
  },
  {
    names: 'Kimia Koochakzadeh-Yazdi',
    apartments: ['325'],
    sourceLabel: 'Search: Kimia Koochakzadeh-Yazdi',
    work: 'Doctoral Candidate at Stanford University',
    detail: 'Acclaimed electroacoustic music composer, tech performer, and instrument designer.',
    interests: ['electroacoustic music', 'Stanford', 'instrument design'],
    relationship: 40,
  },
  {
    names: 'Albin Cassirer',
    apartments: ['302'],
    sourceLabel: 'View Publications',
    profileUrl: 'https://www.semanticscholar.org/author/Albin-Cassirer/51042571',
    work: 'AI & Reinforcement Learning Researcher',
    detail: 'Deep learning frameworks, scaling laws, and AI verification code systems.',
    interests: ['reinforcement learning', 'scaling laws', 'AI verification'],
    relationship: 42,
    stage: 'friendly',
  },
  {
    names: 'Jovanka Gencel-Augusto',
    apartments: ['221'],
    sourceLabel: 'View Research Profile',
    profileUrl: 'https://ohns.ucsf.edu/headneckcancerlab/people',
    work: 'Postdoctoral Fellow at UCSF',
    detail: 'Lead scientific investigator specializing in Otolaryngology, Epigenetics, and Cancer Biology.',
    interests: ['UCSF', 'cancer biology', 'epigenetics'],
    relationship: 42,
    stage: 'friendly',
  },
  {
    names: 'Chengyu Dong',
    apartments: ['854'],
    sourceLabel: 'Search: Chengyu Dong SF',
    work: 'Software Engineer / Machine Learning Researcher',
    detail: 'Active in the local San Francisco artificial intelligence ecosystem.',
    interests: ['machine learning', 'AI ecosystem', 'software'],
  },
  {
    names: 'Faizan Chishtie',
    apartments: ['844'],
    sourceLabel: 'Search: Faizan Chishtie',
    work: 'Technology Operations & Product Builder',
    detail: 'Focused on platform automation and CRM software solutions.',
    interests: ['platform automation', 'CRM', 'product'],
  },
  {
    names: 'Parris Moore',
    apartments: ['110'],
    sourceLabel: 'Search: Parris Moore SF',
    work: 'San Francisco area professional',
    detail: 'Local professional profile to enrich as you learn more.',
    interests: ['San Francisco', 'local network'],
  },
  {
    names: 'Semen Hrozian',
    apartments: ['659'],
    sourceLabel: 'Search: Semen Hrozian',
    work: 'Technical systems engineer',
    detail: 'Technical systems engineer / Bay Area professional.',
    interests: ['systems engineering', 'Bay Area tech'],
  },
  {
    names: 'Chrissy Riualdes',
    apartments: ['732'],
    sourceLabel: 'Search: Chrissy Riualdes',
    work: 'San Francisco resident and local professional',
    detail: 'Local professional profile to enrich as you learn more.',
    interests: ['San Francisco', 'local network'],
  },
  {
    names: 'David Szprynski',
    apartments: ['748', '758'],
    sourceLabel: 'Search: David Szprynski',
    work: 'High-frequency package recipient',
    detail: 'Multiple shipments logged across floors.',
    interests: ['building logistics', 'local network'],
  },
  {
    names: 'Jakob Salazar & Daniel Schneider',
    apartments: ['315'],
    sourceLabel: 'Search: Jakob Salazar SF; Daniel Schneider SF',
    work: 'Bay Area technical and software infrastructure professionals',
    detail: 'Jakob is noted as a Bay Area technical or creative ecosystem professional. Daniel is noted as a Silicon Valley software engineer / tech infrastructure professional.',
    interests: ['software infrastructure', 'creative tech', 'Bay Area tech'],
  },
  {
    names: 'Danny Tran',
    apartments: ['351'],
    sourceLabel: 'Search: Danny Tran SF',
    work: 'Broad local match',
    detail: 'Multiple software developers and startup investors share this name in San Francisco.',
    interests: ['software', 'startups', 'local match'],
  },
  {
    names: 'Sakura Aggarwal',
    apartments: ['301'],
    sourceLabel: 'Search: Sakura Aggarwal SF',
    work: 'Tech operations professional',
    detail: 'Tech operations professional / software ecosystem resident.',
    interests: ['tech operations', 'software ecosystem'],
  },
  {
    names: 'Wye Yew Ho',
    apartments: ['247'],
    sourceLabel: 'Search: Wye Yew Ho',
    work: 'San Francisco-based tech ecosystem professional',
    detail: 'Local tech ecosystem profile to enrich as you learn more.',
    interests: ['tech ecosystem', 'San Francisco'],
  },
  {
    names: 'Cat Cao',
    apartments: ['303'],
    sourceLabel: 'Search: Cat Cao SF',
    work: 'Design, product, or UI/UX tech professional',
    detail: 'Localized design, product, or UI/UX tech professional.',
    interests: ['design', 'product', 'UI/UX'],
  },
  {
    names: 'Delijeh Snyder',
    apartments: ['349'],
    sourceLabel: 'Search: Delijeh Snyder',
    work: 'SF Bay Area local professional',
    detail: 'Local professional profile to enrich as you learn more.',
    interests: ['Bay Area', 'local network'],
  },
  {
    names: 'Veronica Ramirez',
    apartments: ['357'],
    sourceLabel: 'Search: Veronica Ramirez SF',
    work: 'Broad local match',
    detail: 'Highly common Bay Area technical/operations name.',
    interests: ['technical operations', 'local match'],
  },
  {
    names: 'Vishnu Sampathkumar',
    apartments: ['305', '734'],
    sourceLabel: 'Search: Vishnu Sampathkumar',
    work: 'Software engineer and data infrastructure specialist',
    detail: 'Software engineer and data infrastructure specialist in the San Francisco area.',
    interests: ['data infrastructure', 'software engineering'],
  },
  {
    names: 'Yan Wen Chong-Lin',
    apartments: ['211'],
    sourceLabel: 'Search: Yan Wen Chong-Lin',
    work: 'Technical layout designer / blueprint drafting specialist',
    detail: 'Technical layout designer / blueprint drafting specialist.',
    interests: ['layout design', 'blueprints', 'drafting'],
  },
  {
    names: 'Jay Nguyen',
    apartments: ['220'],
    sourceLabel: 'Search: Jay Nguyen SF',
    work: 'Broad local match',
    detail: 'Multiple San Francisco software engineers and product managers share this name.',
    interests: ['software', 'product', 'local match'],
  },
  {
    names: 'Srinath Manikanti',
    apartments: ['447'],
    sourceLabel: 'Search: Srinath Manikanti',
    work: 'Software development engineer and tech operations engineer',
    detail: 'Local software development engineer and tech operations engineer.',
    interests: ['software development', 'tech operations'],
  },
  {
    names: 'Catherine Di',
    apartments: ['457'],
    sourceLabel: 'Search: Catherine Di SF',
    work: 'Technical data analyst',
    detail: 'Technical data analyst / tech ecosystem professional.',
    interests: ['data analysis', 'tech ecosystem'],
  },
  {
    names: 'Aimie Lim',
    apartments: ['445'],
    sourceLabel: 'Search: Aimie Lim',
    work: 'San Francisco creative or startup operations profile',
    detail: 'Local San Francisco creative or startup operations profile.',
    interests: ['creative operations', 'startup operations'],
  },
  {
    names: 'Clara Starkweather',
    apartments: ['208'],
    sourceLabel: 'Search: Clara Starkweather',
    work: 'Bay Area life sciences or technology operations manager',
    detail: 'Bay Area life sciences or technology operations manager.',
    interests: ['life sciences', 'technology operations'],
  },
  {
    names: 'Diego Morales Rojas',
    apartments: ['306'],
    sourceLabel: 'Search: Diego Morales Rojas',
    work: 'Local software engineer and systems builder',
    detail: 'Local software engineer and systems builder.',
    interests: ['software engineering', 'systems'],
  },
  {
    names: 'Hunter Wiese',
    apartments: ['461'],
    sourceLabel: 'Search: Hunter Wiese SF',
    work: 'SF-based technical builder',
    detail: 'SF-based technical builder / engineering professional.',
    interests: ['engineering', 'technical building'],
  },
  {
    names: 'Ivy G Rivero',
    apartments: ['747'],
    sourceLabel: 'Search: Ivy Rivero',
    work: 'San Francisco local professional',
    detail: 'Local professional profile to enrich as you learn more.',
    interests: ['San Francisco', 'local network'],
  },
  {
    names: 'Krylov Volodymyr',
    apartments: ['741'],
    sourceLabel: 'Search: Volodymyr Krylov',
    work: 'Technical software engineer / system security specialist',
    detail: 'Technical software engineer / system security specialist.',
    interests: ['system security', 'software engineering'],
  },
  {
    names: 'Kevin Chiu',
    apartments: ['735'],
    sourceLabel: 'Search: Kevin Chiu SF',
    work: 'Broad local match',
    detail: 'Multiple Bay Area software developers share this name.',
    interests: ['software development', 'local match'],
  },
  {
    names: 'Vanessa Quijas Olsen',
    apartments: ['855'],
    sourceLabel: 'Search: Vanessa Quijas Olsen',
    work: 'San Francisco area professional',
    detail: 'Local professional profile to enrich as you learn more.',
    interests: ['San Francisco', 'local network'],
  },
  {
    names: 'Kylan Boehlke',
    apartments: ['868'],
    sourceLabel: 'Search: Kylan Boehlke',
    work: 'SF local engineering builder',
    detail: 'SF local engineering builder / technical profile.',
    interests: ['engineering', 'technical building'],
  },
  {
    names: 'Alex Kostelnik',
    apartments: ['835'],
    sourceLabel: 'Search: Alex Kostelnik',
    work: 'Local tech ecosystem professional',
    detail: 'Local tech ecosystem profile to enrich as you learn more.',
    interests: ['tech ecosystem', 'local network'],
  },
  {
    names: 'Jennifer Song',
    apartments: ['850'],
    sourceLabel: 'Search: Jennifer Song SF',
    work: 'Broad local match',
    detail: 'Highly common name for local tech designers and engineers.',
    interests: ['design', 'engineering', 'local match'],
  },
  {
    names: 'Erik Charpentier',
    apartments: ['852'],
    sourceLabel: 'Search: Erik Charpentier',
    work: 'Technical engineer / software developer',
    detail: 'Technical engineer / software developer.',
    interests: ['software development', 'engineering'],
  },
  {
    names: 'Andy Zhou',
    apartments: ['858'],
    sourceLabel: 'Search: Andy Zhou SF',
    work: 'Broad local match',
    detail: 'Multiple San Francisco-based software engineers share this name.',
    interests: ['software engineering', 'local match'],
  },
  {
    names: 'Soami Kapadia',
    apartments: ['845'],
    sourceLabel: 'Search: Soami Kapadia',
    work: 'Technology infrastructure and operations professional',
    detail: 'San Francisco technology infrastructure and operations professional.',
    interests: ['technology infrastructure', 'operations'],
  },
  {
    names: 'Chanan',
    apartments: ['861'],
    sourceLabel: 'Search: Chanan SF',
    work: 'Local software engineering specialist',
    detail: 'Local software engineering specialist.',
    interests: ['software engineering', 'local network'],
  },
]

export const residentProfiles: ResidentProfile[] = residentSeeds.flatMap((seed) =>
  seed.apartments.map((unitLabel) => ({
    unitId: unitIdsByApartment[unitLabel],
    unitLabel,
    names: seed.names,
    work: seed.work,
    stage: seed.stage ?? 'new',
    relationship: seed.relationship ?? 34,
    lastTouch: 'Imported resident data',
    note: seed.detail,
    nextMove: `Ask about ${seed.interests[0]}.`,
    preferredContact: seed.profileUrl ? 'Professional profile linked' : seed.sourceLabel,
    socialStyle: 'Professional context',
    interests: seed.interests,
    sourceLabel: seed.sourceLabel,
    profileUrl: seed.profileUrl,
    links: seed.links,
    dataFilled: true,
  })),
)

export const starterTouchpoints = [
  {
    id: 'touch-1',
    unitId: '651532',
    label: 'Resident data imported',
    detail: 'Namanyay Goel added from the provided apartment list.',
  },
  {
    id: 'touch-2',
    unitId: '651504',
    label: 'Founder profile linked',
    detail: 'Wyatt Marshall profile includes a company source link.',
  },
  {
    id: 'touch-3',
    unitId: '651715',
    label: 'Floor 8 data filled',
    detail: 'Chengyu Dong added to Apt 854.',
  },
]

export const buildPlan = [
  {
    phase: '01',
    title: 'Map foundation',
    detail: 'Use the public floor geometry as a base layer, then keep resident data separate and editable.',
  },
  {
    phase: '02',
    title: 'Private profiles',
    detail: 'Store only consented notes: names, professional context, source links, and relationship history.',
  },
  {
    phase: '03',
    title: 'Relationship memory',
    detail: 'Track touches, introductions, and suggested next moves without turning it into a cold CRM.',
  },
  {
    phase: '04',
    title: 'Import and ownership',
    detail: 'Add encrypted export, CSV import, and a way to replace the building map if the source changes.',
  },
]
