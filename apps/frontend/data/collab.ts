// =============================================================================
// VivaExcel Collab – Mock Data
// Social collaboration feed (X/Twitter-style) for the Collab page
// =============================================================================

import type {
  CollabUser,
  CollabPost,
  TrendingTopic,
  LiveEvent,
  NewsItem,
} from "@/types/collab";

// -----------------------------------------------------------------------------
// 1. Users
// -----------------------------------------------------------------------------

export const collabUsers: CollabUser[] = [
  {
    id: "user-1",
    name: "VivaExcel",
    username: "vivaexcel",
    avatar: "https://picsum.photos/seed/vivaexcel/80/80",
    bio: "The all-in-one platform for spreadsheets, data analytics & collaboration. Building the future of productivity. 🚀",
    isVerified: true,
    isPremium: true,
    followerCount: 128400,
    followingCount: 312,
  },
  {
    id: "user-2",
    name: "Dr. Priya Sharma",
    username: "datasciencepro",
    avatar: "https://picsum.photos/seed/datasciencepro/80/80",
    bio: "Data scientist @ Google | PhD in ML | Sharing tips on stats, Python & everything data. Opinions are my own.",
    isVerified: true,
    isPremium: true,
    followerCount: 94200,
    followingCount: 1043,
  },
  {
    id: "user-3",
    name: "Marcus Chen",
    username: "excelguru",
    avatar: "https://picsum.photos/seed/excelguru/80/80",
    bio: "20+ years of Excel. MVP awardee. I turn messy spreadsheets into works of art. DMs open for consulting.",
    isVerified: true,
    isPremium: false,
    followerCount: 67800,
    followingCount: 587,
  },
  {
    id: "user-4",
    name: "AI Frontiers",
    username: "aifrontiers",
    avatar: "https://picsum.photos/seed/aifrontiers/80/80",
    bio: "Covering the latest in artificial intelligence, LLMs, and generative AI. Newsletter with 200K+ subscribers.",
    isVerified: true,
    isPremium: true,
    followerCount: 214500,
    followingCount: 420,
  },
  {
    id: "user-5",
    name: "CyberSec News",
    username: "cybersecnews",
    avatar: "https://picsum.photos/seed/cybersecnews/80/80",
    bio: "Breaking cybersecurity news, threat intel & analysis. Protecting the digital world one headline at a time. 🔒",
    isVerified: true,
    isPremium: false,
    followerCount: 156300,
    followingCount: 892,
  },
  {
    id: "user-6",
    name: "Elena Rodriguez",
    username: "blockchaindev",
    avatar: "https://picsum.photos/seed/blockchaindev/80/80",
    bio: "Solidity dev | Building on Ethereum & L2s | Web3 educator. Not financial advice. 🧱⛓️",
    isVerified: false,
    isPremium: true,
    followerCount: 31400,
    followingCount: 1290,
  },
  {
    id: "user-7",
    name: "SpreadsheetPro",
    username: "spreadsheetpro",
    avatar: "https://picsum.photos/seed/spreadsheetpro/80/80",
    bio: "Google Sheets & Excel tutorials every day. From VLOOKUP to LAMBDA — I've got you covered. 📊",
    isVerified: false,
    isPremium: false,
    followerCount: 19700,
    followingCount: 643,
  },
  {
    id: "user-8",
    name: "Tech Insights",
    username: "techinsights",
    avatar: "https://picsum.photos/seed/techinsights/80/80",
    bio: "Senior tech journalist @ Wired. Covering SaaS, enterprise software & the future of work. Bookworm.",
    isVerified: true,
    isPremium: false,
    followerCount: 87600,
    followingCount: 1105,
  },
];

// Shorthand helpers so post definitions stay readable
const [vivaexcel, datasciencepro, excelguru, aifrontiers, cybersecnews, blockchaindev, spreadsheetpro, techinsights] =
  collabUsers;

// -----------------------------------------------------------------------------
// 2. Posts
// -----------------------------------------------------------------------------

export const mockPosts: CollabPost[] = [
  // ---- Pinned announcement from VivaExcel ----
  {
    id: "post-1",
    author: vivaexcel,
    content:
      "📢 Big news! VivaExcel 3.0 is officially live.\n\nWhat's new:\n• Real-time multiplayer editing (up to 50 users)\n• AI-powered formula suggestions\n• 200+ new chart templates\n• Enterprise SSO & audit logs\n\nUpgrade today — free for all existing Pro users.\n\n#VivaExcel #Productivity #Spreadsheets",
    media: [
      {
        id: "media-1",
        type: "image",
        url: "https://picsum.photos/seed/vivaexcel3/600/400",
        alt: "VivaExcel 3.0 launch banner",
        width: 600,
        height: 400,
      },
    ],
    likeCount: 4872,
    repostCount: 1903,
    commentCount: 641,
    viewCount: 1_240_000,
    bookmarkCount: 2340,
    publishedAt: "2026-02-10T08:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
    isPinned: true,
    tags: ["vivaexcel", "productivity", "spreadsheets"],
  },

  // ---- Data science thought-piece ----
  {
    id: "post-2",
    author: datasciencepro,
    content:
      "Hot take: Most companies don't need a \"data lake.\" They need a clean spreadsheet and someone who actually understands the business.\n\nThe infra obsession is real. Sometimes a well-structured Excel model beats a $500K Snowflake setup.\n\nFight me. 👇",
    likeCount: 7231,
    repostCount: 2104,
    commentCount: 1482,
    viewCount: 2_870_000,
    bookmarkCount: 3900,
    publishedAt: "2026-02-09T18:32:00Z",
    isLiked: true,
    isReposted: false,
    isBookmarked: false,
    tags: ["data", "excel", "analytics"],
  },

  // ---- Excel tip with image ----
  {
    id: "post-3",
    author: excelguru,
    content:
      "Excel tip of the day 💡\n\nStop using VLOOKUP for everything. Here's why XLOOKUP is superior:\n\n✅ No more column index numbers\n✅ Searches right-to-left natively\n✅ Built-in error handling\n✅ Can return entire rows/columns\n\nSwipe through for examples ➡️\n\n#ExcelTips #XLOOKUP",
    media: [
      {
        id: "media-2",
        type: "image",
        url: "https://picsum.photos/seed/xlookup-demo/600/400",
        alt: "XLOOKUP vs VLOOKUP comparison",
        width: 600,
        height: 400,
      },
      {
        id: "media-3",
        type: "image",
        url: "https://picsum.photos/seed/xlookup-example/600/400",
        alt: "XLOOKUP formula example in Excel",
        width: 600,
        height: 400,
      },
    ],
    likeCount: 3456,
    repostCount: 1287,
    commentCount: 312,
    viewCount: 890_000,
    bookmarkCount: 4120,
    publishedAt: "2026-02-09T14:15:00Z",
    isLiked: false,
    isReposted: true,
    isBookmarked: true,
    tags: ["excel", "exceltips", "xlookup"],
  },

  // ---- AI breaking news ----
  {
    id: "post-4",
    author: aifrontiers,
    content:
      "🚨 BREAKING: Anthropic just released Claude Opus 4.6 — and it's a monster.\n\nBenchmarks:\n• 94.2% on MMLU-Pro (new SOTA)\n• 89.7% on HumanEval+\n• 2M token context window\n• Native tool use & agentic workflows\n\nFull analysis in our newsletter (link in bio).\n\n#AI #Claude #Anthropic #LLM",
    likeCount: 18420,
    repostCount: 6730,
    commentCount: 2841,
    viewCount: 8_430_000,
    bookmarkCount: 7200,
    publishedAt: "2026-02-08T22:05:00Z",
    isLiked: true,
    isReposted: true,
    isBookmarked: true,
    tags: ["ai", "claude", "anthropic", "llm"],
  },

  // ---- Cybersecurity alert ----
  {
    id: "post-5",
    author: cybersecnews,
    content:
      "🔴 ALERT: Critical zero-day vulnerability found in popular npm package `event-stream-utils` (CVE-2026-1847).\n\nAffects 14M+ weekly downloads. Allows remote code execution through crafted payloads.\n\nPatch available: v3.4.2\nAction: Update immediately.\n\n#CyberSecurity #NodeJS #ZeroDay",
    likeCount: 5612,
    repostCount: 8940,
    commentCount: 743,
    viewCount: 4_120_000,
    bookmarkCount: 2100,
    publishedAt: "2026-02-08T16:48:00Z",
    isLiked: false,
    isReposted: true,
    isBookmarked: false,
    tags: ["cybersecurity", "nodejs", "zeroday"],
  },

  // ---- Blockchain dev journal ----
  {
    id: "post-6",
    author: blockchaindev,
    content:
      "Just deployed my first smart contract using the new Solidity 0.9 syntax and wow — the developer experience has improved so much.\n\nNative account abstraction, built-in reentrancy guards, and the new `try/revert` patterns are 🤌\n\nWeb3 is quietly getting really good.",
    likeCount: 892,
    repostCount: 234,
    commentCount: 87,
    viewCount: 67_400,
    bookmarkCount: 310,
    publishedAt: "2026-02-08T11:20:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["blockchain", "solidity", "web3", "ethereum"],
  },

  // ---- Poll post ----
  {
    id: "post-7",
    author: spreadsheetpro,
    content:
      "Settling this once and for all.\n\nWhat's the BEST spreadsheet tool in 2026? 🗳️\n\n#Spreadsheets #Excel #GoogleSheets #VivaExcel",
    poll: {
      id: "poll-1",
      options: [
        { label: "Microsoft Excel", votes: 4821 },
        { label: "Google Sheets", votes: 3104 },
        { label: "VivaExcel", votes: 5672 },
        { label: "Airtable / Notion Tables", votes: 1203 },
      ],
      totalVotes: 14800,
      endsAt: "2026-02-12T00:00:00Z",
    },
    likeCount: 2104,
    repostCount: 873,
    commentCount: 1567,
    viewCount: 1_450_000,
    bookmarkCount: 420,
    publishedAt: "2026-02-07T20:00:00Z",
    isLiked: true,
    isReposted: false,
    isBookmarked: false,
    tags: ["spreadsheets", "excel", "googlesheets", "vivaexcel"],
  },

  // ---- Tech journalist analysis ----
  {
    id: "post-8",
    author: techinsights,
    content:
      "I spent a week testing every major AI coding assistant:\n\n• Claude Code — best for complex refactors & architecture\n• GitHub Copilot — fastest inline completions\n• Cursor — nicest IDE integration\n• Cody — surprisingly good for large codebases\n\nFull comparison article drops tomorrow. Stay tuned.\n\n#DevTools #AI #Coding",
    likeCount: 9340,
    repostCount: 3210,
    commentCount: 2104,
    viewCount: 5_670_000,
    bookmarkCount: 8100,
    publishedAt: "2026-02-07T15:30:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
    tags: ["devtools", "ai", "coding"],
  },

  // ---- VivaExcel tutorial ----
  {
    id: "post-9",
    author: vivaexcel,
    content:
      "Did you know? You can use natural language to write formulas in VivaExcel.\n\nJust type: \"Calculate the average sales for Q4 excluding returns\"\n\nOur AI translates it into:\n=AVERAGEIFS(Sales,Quarter,\"Q4\",Type,\"<>Return\")\n\nTry it today 👉 vivaexcel.com/ai-formulas\n\n#VivaExcel #AIFormulas",
    media: [
      {
        id: "media-4",
        type: "gif",
        url: "https://picsum.photos/seed/ai-formula-demo/600/400",
        alt: "AI formula generation demo in VivaExcel",
        width: 600,
        height: 400,
      },
    ],
    likeCount: 2890,
    repostCount: 1120,
    commentCount: 456,
    viewCount: 780_000,
    bookmarkCount: 3200,
    publishedAt: "2026-02-07T10:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["vivaexcel", "ai", "formulas"],
  },

  // ---- Data science meme-ish post ----
  {
    id: "post-10",
    author: datasciencepro,
    content:
      "Stages of a data science project:\n\n1. \"This will be easy\" — 5 min\n2. Cleaning the data — 3 weeks\n3. Building the model — 2 hours\n4. Explaining to stakeholders why 85% accuracy is actually good — forever\n\nEvery. Single. Time. 😭",
    likeCount: 14200,
    repostCount: 5430,
    commentCount: 987,
    viewCount: 6_210_000,
    bookmarkCount: 1800,
    publishedAt: "2026-02-06T21:45:00Z",
    isLiked: true,
    isReposted: true,
    isBookmarked: false,
    tags: ["datascience", "data", "machinelearning"],
  },

  // ---- Excel advanced ----
  {
    id: "post-11",
    author: excelguru,
    content:
      "The LAMBDA function changed Excel forever, but most people still aren't using it.\n\nHere's a custom LAMBDA that recursively flattens any nested array:\n\nFLATTEN = LAMBDA(arr,\n  IF(TYPE(arr)<>64, arr,\n    REDUCE(\"\", arr,\n      LAMBDA(a,b, VSTACK(a, FLATTEN(b))))))\n\nName it in Name Manager → use it like a built-in. 🔥\n\n#Excel #LAMBDA #Advanced",
    likeCount: 4210,
    repostCount: 1876,
    commentCount: 534,
    viewCount: 1_100_000,
    bookmarkCount: 5670,
    publishedAt: "2026-02-06T13:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
    tags: ["excel", "lambda", "advanced"],
  },

  // ---- AI ethics discussion ----
  {
    id: "post-12",
    author: aifrontiers,
    content:
      "The EU AI Act enforcement begins next month.\n\nHere's what it means for developers:\n\n• High-risk AI systems need conformity assessments\n• Generative AI must disclose training data sources\n• Fines up to €35M or 7% of global turnover\n• Biometric surveillance banned in public spaces\n\nThe era of \"move fast and break things\" in AI is officially over.\n\n#AI #Regulation #EUAIAct",
    likeCount: 6780,
    repostCount: 3450,
    commentCount: 1230,
    viewCount: 3_890_000,
    bookmarkCount: 4100,
    publishedAt: "2026-02-05T19:15:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["ai", "regulation", "euaiact"],
  },

  // ---- Cybersecurity tip ----
  {
    id: "post-13",
    author: cybersecnews,
    content:
      "Passkeys have officially surpassed passwords in adoption at major tech companies.\n\nGoogle: 78% of logins now passwordless\nApple: 82% on iCloud\nMicrosoft: 65% on Entra ID\n\nIf you're still relying solely on passwords + SMS 2FA in 2026, you're already behind.\n\nSwitch to passkeys. It's time.\n\n#Passkeys #CyberSecurity #ZeroTrust",
    media: [
      {
        id: "media-5",
        type: "image",
        url: "https://picsum.photos/seed/passkey-stats/600/400",
        alt: "Passkey adoption statistics 2026",
        width: 600,
        height: 400,
      },
    ],
    likeCount: 3450,
    repostCount: 2870,
    commentCount: 412,
    viewCount: 2_340_000,
    bookmarkCount: 1950,
    publishedAt: "2026-02-05T10:30:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["cybersecurity", "passkeys", "zerotrust"],
  },

  // ---- Blockchain market observation ----
  {
    id: "post-14",
    author: blockchaindev,
    content:
      "Ethereum L2 TVL just crossed $80B for the first time.\n\nThe \"L2 summer\" everyone predicted is finally here — just two years late lol.\n\nBase, Arbitrum, and Optimism are handling more TPS than Visa at peak. Wild times.\n\n#Ethereum #L2 #DeFi",
    likeCount: 1540,
    repostCount: 672,
    commentCount: 198,
    viewCount: 230_000,
    bookmarkCount: 410,
    publishedAt: "2026-02-04T17:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["ethereum", "l2", "defi", "blockchain"],
  },

  // ---- Spreadsheet humor ----
  {
    id: "post-15",
    author: spreadsheetpro,
    content:
      "Client: \"Can you make this spreadsheet a little more... dynamic?\"\n\nMe: *adds conditional formatting*\n\nClient: \"No, I mean like an app.\"\n\nMe: *adds 47 macros, 12 UserForms, and a REST API call from VBA*\n\nClient: \"Perfect.\"\n\nExcel is the world's most popular programming language and no one can convince me otherwise.",
    likeCount: 8760,
    repostCount: 3210,
    commentCount: 1045,
    viewCount: 3_450_000,
    bookmarkCount: 1200,
    publishedAt: "2026-02-04T12:20:00Z",
    isLiked: true,
    isReposted: false,
    isBookmarked: false,
    tags: ["excel", "humor", "vba"],
  },

  // ---- Tech Insights investigative ----
  {
    id: "post-16",
    author: techinsights,
    content:
      "THREAD: I interviewed 50 CTOs about their 2026 tech stack priorities.\n\nTop 5 themes:\n1. AI-augmented development (not replacing devs)\n2. Platform engineering over raw DevOps\n3. Spreadsheet-based internal tools (yes, really)\n4. Zero-trust architecture everywhere\n5. Sustainability metrics in cloud infra\n\nThe spreadsheet renaissance is real. More below 👇",
    likeCount: 5430,
    repostCount: 2100,
    commentCount: 876,
    viewCount: 2_980_000,
    bookmarkCount: 4300,
    publishedAt: "2026-02-03T14:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
    tags: ["techtrends", "enterprise", "2026"],
  },

  // ---- VivaExcel community highlight ----
  {
    id: "post-17",
    author: vivaexcel,
    content:
      "Community spotlight 🌟\n\n@excelguru just published an incredible 40-page guide on financial modeling in VivaExcel.\n\nIt covers:\n• DCF models from scratch\n• Sensitivity analysis with data tables\n• Monte Carlo simulations using our Python integration\n• Dashboard creation with live data feeds\n\nFree to download for all users. Link in the replies!",
    likeCount: 1890,
    repostCount: 743,
    commentCount: 312,
    viewCount: 420_000,
    bookmarkCount: 2100,
    publishedAt: "2026-02-03T09:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["vivaexcel", "financialmodeling", "community"],
  },

  // ---- Reply post (data science replying to AI post) ----
  {
    id: "post-18",
    author: datasciencepro,
    content:
      "This is exactly right. I've been using Claude for data pipeline debugging and it catches issues that would take me hours to find manually.\n\nThe key is treating AI as a collaborator, not a replacement. My workflow:\n1. Write the logic myself\n2. Have Claude review edge cases\n3. Pair on tests\n\nProductivity is up ~40%.",
    replyTo: {
      author: aifrontiers,
      id: "post-4",
    },
    likeCount: 2340,
    repostCount: 567,
    commentCount: 189,
    viewCount: 870_000,
    bookmarkCount: 1450,
    publishedAt: "2026-02-08T23:12:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["ai", "datascience", "productivity"],
  },

  // ---- Quick observation post ----
  {
    id: "post-19",
    author: excelguru,
    content:
      "People sleeping on Excel's new Python integration.\n\nYou can now run pandas, matplotlib, and scikit-learn DIRECTLY in cells. No external IDE needed.\n\n=PY(\"import pandas as pd; pd.read_sql(conn, query)\")\n\nExcel just became a full data science notebook. The game changed and nobody noticed.",
    likeCount: 6120,
    repostCount: 2890,
    commentCount: 743,
    viewCount: 3_120_000,
    bookmarkCount: 5400,
    publishedAt: "2026-02-02T16:45:00Z",
    isLiked: true,
    isReposted: false,
    isBookmarked: true,
    tags: ["excel", "python", "datascience"],
  },

  // ---- Cybersecurity long-form ----
  {
    id: "post-20",
    author: cybersecnews,
    content:
      "The biggest data breaches of January 2026:\n\n1. HealthNet Global — 12M patient records\n2. FastPay Wallet — $34M in crypto drained\n3. CloudServe Inc — 200K enterprise credentials\n4. EduConnect — 8M student records\n\nCommon thread? All four had unpatched known vulnerabilities.\n\nPatch. Your. Systems.\n\n#InfoSec #DataBreach #CyberSecurity",
    likeCount: 4670,
    repostCount: 5120,
    commentCount: 623,
    viewCount: 3_780_000,
    bookmarkCount: 2300,
    publishedAt: "2026-02-01T20:00:00Z",
    isLiked: false,
    isReposted: true,
    isBookmarked: false,
    tags: ["cybersecurity", "databreach", "infosec"],
  },

  // ---- Blockchain + AI crossover ----
  {
    id: "post-21",
    author: blockchaindev,
    content:
      "Interesting experiment: I used an AI agent to audit a Solidity smart contract.\n\nResults:\n• Found 3 medium-severity bugs human auditors missed\n• Flagged a subtle reentrancy vector in a callback\n• Suggested gas optimizations saving ~18%\n\nAI + blockchain security is going to be massive.\n\nStill needs human review, but as a first pass? Incredible.",
    media: [
      {
        id: "media-6",
        type: "image",
        url: "https://picsum.photos/seed/ai-audit-results/600/400",
        alt: "AI smart contract audit results dashboard",
        width: 600,
        height: 400,
      },
    ],
    likeCount: 2130,
    repostCount: 876,
    commentCount: 234,
    viewCount: 310_000,
    bookmarkCount: 890,
    publishedAt: "2026-01-31T14:30:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["blockchain", "ai", "smartcontracts", "security"],
  },

  // ---- Spreadsheet + data visualization ----
  {
    id: "post-22",
    author: spreadsheetpro,
    content:
      "Just built a full real-time dashboard tracking crypto prices, stock tickers, AND weather data — all inside a single spreadsheet.\n\nTools used:\n• VivaExcel live data connectors\n• Custom LAMBDA functions for transforms\n• Sparklines + conditional formatting\n\nNo code. No Tableau. No Power BI. Just a spreadsheet.\n\nTemplate dropping this Friday! 📊",
    media: [
      {
        id: "media-7",
        type: "image",
        url: "https://picsum.photos/seed/dashboard-spreadsheet/600/400",
        alt: "Real-time dashboard built in a spreadsheet",
        width: 600,
        height: 400,
      },
    ],
    likeCount: 3780,
    repostCount: 1540,
    commentCount: 421,
    viewCount: 890_000,
    bookmarkCount: 3400,
    publishedAt: "2026-01-30T11:00:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: true,
    tags: ["spreadsheets", "dataviz", "vivaexcel", "dashboard"],
  },

  // ---- AI opinion piece ----
  {
    id: "post-23",
    author: aifrontiers,
    content:
      "Unpopular opinion: The \"AI will take your job\" narrative is overblown.\n\nWhat's actually happening:\n• Routine tasks are being automated (good)\n• Creative + strategic roles are being augmented (great)\n• New roles are emerging faster than old ones disappear\n\nThe people who will struggle are those who refuse to learn, not those whose jobs get \"replaced.\"\n\nAdapt. Experiment. Stay curious.",
    likeCount: 11200,
    repostCount: 4100,
    commentCount: 2340,
    viewCount: 7_120_000,
    bookmarkCount: 3800,
    publishedAt: "2026-01-29T18:00:00Z",
    isLiked: true,
    isReposted: false,
    isBookmarked: false,
    tags: ["ai", "futureofwork", "opinion"],
  },

  // ---- Tech Insights quick take ----
  {
    id: "post-24",
    author: techinsights,
    content:
      "Just learned that 60% of Fortune 500 companies still run critical business processes on spreadsheets.\n\nNot legacy systems. Not custom software. Spreadsheets.\n\nThis is exactly why tools like VivaExcel, which bridge the gap between spreadsheets and enterprise software, are growing so fast.\n\nThe spreadsheet isn't going anywhere. It's evolving.",
    likeCount: 4560,
    repostCount: 1670,
    commentCount: 534,
    viewCount: 2_100_000,
    bookmarkCount: 2400,
    publishedAt: "2026-01-28T13:30:00Z",
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    tags: ["enterprise", "spreadsheets", "saas"],
  },
];

// -----------------------------------------------------------------------------
// 3. Trending Topics
// -----------------------------------------------------------------------------

export const trendingTopics: TrendingTopic[] = [
  {
    id: "trend-1",
    category: "Technology",
    title: "#ExcelTips",
    postCount: 34200,
  },
  {
    id: "trend-2",
    category: "AI",
    title: "Claude Opus 4.6",
    postCount: 48700,
  },
  {
    id: "trend-3",
    category: "Data Science",
    title: "Data Analytics 2026",
    postCount: 21300,
  },
  {
    id: "trend-4",
    category: "Cybersecurity",
    title: "Zero Trust Security",
    postCount: 15800,
  },
  {
    id: "trend-5",
    category: "Excel",
    title: "#XLOOKUP",
    postCount: 12400,
  },
  {
    id: "trend-6",
    category: "AI",
    title: "EU AI Act Enforcement",
    postCount: 41200,
  },
  {
    id: "trend-7",
    category: "Blockchain",
    title: "Ethereum L2 Summer",
    postCount: 8900,
  },
  {
    id: "trend-8",
    category: "Technology",
    title: "#VivaExcel3",
    postCount: 27600,
  },
];

// -----------------------------------------------------------------------------
// 4. Live Events (Spaces-style)
// -----------------------------------------------------------------------------

export const liveEvents: LiveEvent[] = [
  {
    id: "live-1",
    host: "Marcus Chen",
    hostAvatar: "https://picsum.photos/seed/excelguru/80/80",
    title: "Excel Power Users Meetup — LAMBDA, REDUCE & Beyond",
    listenerCount: 1243,
    isHostVerified: true,
  },
  {
    id: "live-2",
    host: "AI Frontiers",
    hostAvatar: "https://picsum.photos/seed/aifrontiers/80/80",
    title: "AI in Enterprise — Panel Discussion with Industry Leaders",
    listenerCount: 4872,
    isHostVerified: true,
  },
  {
    id: "live-3",
    host: "SpreadsheetPro",
    hostAvatar: "https://picsum.photos/seed/spreadsheetpro/80/80",
    title: "Data Viz Workshop: Building Dashboards Without Code",
    listenerCount: 678,
    isHostVerified: false,
  },
];

// -----------------------------------------------------------------------------
// 5. News Items (What's happening section)
// -----------------------------------------------------------------------------

export const newsItems: NewsItem[] = [
  {
    id: "news-1",
    title: "Microsoft announces Excel copilot with real-time collaboration features",
    timeAgo: "3 hours ago",
    category: "Technology",
    postCount: 8420,
    avatars: [
      "https://picsum.photos/seed/news1a/40/40",
      "https://picsum.photos/seed/news1b/40/40",
      "https://picsum.photos/seed/news1c/40/40",
    ],
  },
  {
    id: "news-2",
    title: "Major ransomware group dismantled in coordinated global operation",
    timeAgo: "6 hours ago",
    category: "Cybersecurity",
    postCount: 14300,
    avatars: [
      "https://picsum.photos/seed/news2a/40/40",
      "https://picsum.photos/seed/news2b/40/40",
    ],
  },
  {
    id: "news-3",
    title: "OpenAI and Google DeepMind both release new reasoning models within 24 hours",
    timeAgo: "1 day ago",
    category: "AI",
    postCount: 52100,
    avatars: [
      "https://picsum.photos/seed/news3a/40/40",
      "https://picsum.photos/seed/news3b/40/40",
      "https://picsum.photos/seed/news3c/40/40",
    ],
  },
  {
    id: "news-4",
    title: "Remote work productivity data for 2025 shows surprising trends in spreadsheet usage",
    timeAgo: "2 days ago",
    category: "Business",
    postCount: 6700,
    avatars: [
      "https://picsum.photos/seed/news4a/40/40",
      "https://picsum.photos/seed/news4b/40/40",
    ],
  },
  {
    id: "news-5",
    title: "Ethereum gas fees hit all-time low as L2 adoption surges past 90%",
    timeAgo: "3 days ago",
    category: "Blockchain",
    postCount: 11400,
    avatars: [
      "https://picsum.photos/seed/news5a/40/40",
      "https://picsum.photos/seed/news5b/40/40",
      "https://picsum.photos/seed/news5c/40/40",
    ],
  },
];
