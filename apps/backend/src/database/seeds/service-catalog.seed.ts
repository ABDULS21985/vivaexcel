import { DataSource } from 'typeorm';
import {
  ServiceTower,
  CatalogService,
  ServiceDeliverable,
  EngagementModel,
  IndustryPractice,
} from '../../modules/service-catalog/entities';

/**
 * Helper function to generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Service Tower seed data - 22 towers covering Global Digibit's consulting services
 */
export const serviceTowerSeedData = [
  // TOWER 1: CORPORATE, DIGITAL & BUSINESS STRATEGY
  {
    code: 'STRATEGY',
    name: 'Corporate, Digital & Business Strategy',
    shortName: 'Business Strategy',
    icon: 'Target',
    accentColor: '#1E4DB7',
    description: 'Define strategic direction, competitive positioning, and digital business models that drive sustainable growth.',
    scope: 'Corporate strategy, growth strategy, competitive positioning, portfolio strategy, digital business strategy, platform strategy, innovation strategy, strategic roadmaps and execution blueprints.',
    typicalOutcomes: ['Clear direction with quantified benefits', 'Investment prioritization framework', 'Delivery-ready strategic roadmap'],
    certifications: [],
    frameworks: ['Blue Ocean Strategy', 'Porter\'s Five Forces', 'BCG Matrix'],
    isFeatured: true,
    displayOrder: 1,
    services: [
      { name: 'Corporate Strategy Development', description: 'Develop comprehensive 3-5 year strategic plans with clear direction and measurable goals.', icon: 'Compass', typicalDeliverables: ['Strategy blueprint (3-5 year plan)', 'Value-creation roadmap', 'KPI tree and success metrics'] },
      { name: 'Digital Business Strategy', description: 'Define digital-first business models, platform strategies, and innovation roadmaps.', icon: 'Laptop', typicalDeliverables: ['Digital strategy framework', 'Platform business model canvas', 'Innovation pipeline'] },
      { name: 'Growth & Market Entry Strategy', description: 'Identify growth opportunities, new markets, and expansion strategies.', icon: 'TrendingUp', typicalDeliverables: ['Market entry plan', 'Competitive analysis', 'Growth opportunity assessment'] },
      { name: 'Portfolio Strategy & Optimization', description: 'Rationalize product/service portfolios and prioritize investments.', icon: 'PieChart', typicalDeliverables: ['Portfolio rationalization roadmap', 'Investment prioritization matrix', 'Divestiture/acquisition recommendations'] },
      { name: 'Monetization & Pricing Strategy', description: 'Design revenue models, pricing frameworks, and commercial strategies.', icon: 'DollarSign', typicalDeliverables: ['Pricing framework', 'Revenue model options', 'Commercial strategy playbook'] },
    ],
  },
  // TOWER 2: ENTERPRISE TRANSFORMATION & EXECUTION
  {
    code: 'TRANSFORM',
    name: 'Enterprise Transformation & Execution',
    shortName: 'Transformation Office',
    icon: 'Rocket',
    accentColor: '#F59A23',
    description: 'Drive successful transformation through governance, program delivery, and benefit realization.',
    scope: 'Transformation governance, program delivery, execution cadence, benefit realization, Agile/Hybrid PMO, enterprise delivery assurance, portfolio management, RAID management, stage gates, executive reporting.',
    typicalOutcomes: ['Predictable execution', 'Full visibility into progress', 'Risk containment', 'Measurable outcomes'],
    certifications: ['PMP', 'PRINCE2', 'SAFe'],
    frameworks: ['SAFe', 'PRINCE2', 'PMI', 'Agile'],
    isFeatured: true,
    displayOrder: 2,
    services: [
      { name: 'Transformation PMO Setup', description: 'Establish transformation office with governance, roles, and cadence.', icon: 'Building2', typicalDeliverables: ['PMO charter and governance model', 'Role definitions and RACI', 'Delivery cadence framework'] },
      { name: 'Program Delivery Assurance', description: 'Ensure delivery quality through stage gates, reviews, and risk controls.', icon: 'ShieldCheck', typicalDeliverables: ['Delivery assurance framework', 'Stage gate criteria', 'Executive reporting dashboard'] },
      { name: 'Benefits Realization Management', description: 'Track and realize transformation benefits with clear ownership.', icon: 'LineChart', typicalDeliverables: ['Benefits realization model', 'OKR/KPI governance framework', 'Benefits tracking dashboard'] },
      { name: 'Agile Transformation Enablement', description: 'Enable organization-wide agile adoption and ways of working.', icon: 'Zap', typicalDeliverables: ['Agile operating model', 'Agile maturity assessment', 'Transformation playbook'] },
      { name: 'Go-Live Readiness & PIR', description: 'Ensure successful launches and capture lessons learned.', icon: 'CheckCircle2', typicalDeliverables: ['Go-live readiness checklist', 'Cutover plan', 'Post-implementation review'] },
    ],
  },
  // TOWER 3: OPERATING MODEL & ORGANIZATION DESIGN
  {
    code: 'OPS-MODEL',
    name: 'Operating Model, Governance & Organization Design',
    shortName: 'Operating Model',
    icon: 'Network',
    accentColor: '#143A8F',
    description: 'Design scalable operating models with clear accountability and governance.',
    scope: 'Target Operating Model (TOM), business capability mapping, governance, decision rights, service catalogs, shared services design, RACI, org structure, performance model.',
    typicalOutcomes: ['Clear accountability', 'Scalable operations', 'Reduced duplication', 'Better control'],
    certifications: [],
    frameworks: ['TOGAF', 'Business Capability Modeling', 'POLDAT'],
    isFeatured: false,
    displayOrder: 3,
    services: [
      { name: 'Target Operating Model Design', description: 'Define future-state operating model aligned to strategy.', icon: 'Boxes', typicalDeliverables: ['TOM pack with capability map', 'Service model definition', 'Operating model blueprint'] },
      { name: 'Business Capability Mapping', description: 'Map organizational capabilities to identify gaps and priorities.', icon: 'Map', typicalDeliverables: ['Business capability model', 'Capability heat map', 'Investment prioritization'] },
      { name: 'Governance Framework Design', description: 'Establish decision rights, forums, and escalation paths.', icon: 'Scale', typicalDeliverables: ['Decision rights matrix', 'Governance forum design', 'Escalation procedures'] },
      { name: 'Organization Structure Design', description: 'Design org structures that enable strategy execution.', icon: 'Users', typicalDeliverables: ['Organization design options', 'RACI matrix', 'Role handbooks'] },
      { name: 'Shared Services Design', description: 'Design efficient shared services and service catalogs.', icon: 'Share2', typicalDeliverables: ['Shared services model', 'Service catalog', 'SLA framework'] },
    ],
  },
  // TOWER 4: PERFORMANCE IMPROVEMENT & COST TRANSFORMATION
  {
    code: 'PERF-COST',
    name: 'Performance Improvement & Cost Transformation',
    shortName: 'Cost Transformation',
    icon: 'TrendingDown',
    accentColor: '#10B981',
    description: 'Drive sustainable cost reduction and performance improvement.',
    scope: 'Cost optimization, productivity improvement, SG&A optimization, lean process redesign, zero-based budgeting support, performance cockpit, operational rhythm.',
    typicalOutcomes: ['Measurable cost savings', 'Improved throughput', 'Sustainable performance discipline'],
    certifications: ['Lean Six Sigma'],
    frameworks: ['Lean', 'Six Sigma', 'Zero-Based Budgeting'],
    isFeatured: false,
    displayOrder: 4,
    services: [
      { name: 'Cost Optimization Program', description: 'Identify and realize cost reduction opportunities across the organization.', icon: 'Scissors', typicalDeliverables: ['Cost takeout plan (quick wins + structural)', 'Business case per initiative', 'Implementation roadmap'] },
      { name: 'Productivity Improvement', description: 'Improve workforce and process productivity.', icon: 'Gauge', typicalDeliverables: ['Productivity baseline', 'Target metrics framework', 'Performance dashboards'] },
      { name: 'Process Redesign & Lean', description: 'Redesign processes using lean principles.', icon: 'Workflow', typicalDeliverables: ['Process maps (current/future state)', 'Lean improvement opportunities', 'Control points design'] },
      { name: 'Zero-Based Budgeting Support', description: 'Implement ZBB methodology for cost control.', icon: 'Calculator', typicalDeliverables: ['ZBB methodology guide', 'Decision packages', 'Prioritization framework'] },
    ],
  },
  // TOWER 5: OPERATIONS EXCELLENCE
  {
    code: 'OPS-EXCEL',
    name: 'Operations Excellence',
    shortName: 'Operations Excellence',
    icon: 'Settings2',
    accentColor: '#6366F1',
    description: 'Optimize business and IT operations for speed, quality, and compliance.',
    scope: 'Business operations redesign, service operations, field operations, shared services, supply chain/logistics advisory, IT operations uplift, process, tooling, runbooks, incident/problem/change.',
    typicalOutcomes: ['Faster operations', 'Reduced downtime', 'Improved service quality', 'Enhanced compliance'],
    certifications: ['ITIL', 'ISO 20000'],
    frameworks: ['ITIL 4', 'SRE', 'DevOps'],
    isFeatured: false,
    displayOrder: 5,
    services: [
      { name: 'Business Operations Redesign', description: 'Redesign business operations for efficiency and scale.', icon: 'RefreshCw', typicalDeliverables: ['Operations maturity assessment', 'Redesigned workflows', 'Operating procedures'] },
      { name: 'IT Service Operations Uplift', description: 'Improve IT operations with modern practices.', icon: 'Server', typicalDeliverables: ['Service operations runbooks', 'SLAs/OLAs design', 'Escalation models'] },
      { name: 'Service Desk Optimization', description: 'Optimize service desk for better user experience.', icon: 'Headphones', typicalDeliverables: ['Service desk assessment', 'Knowledge base design', 'Automation opportunities'] },
      { name: 'Process Automation Pipeline', description: 'Build pipeline of automation opportunities.', icon: 'Bot', typicalDeliverables: ['Automation backlog', 'Business case per automation', 'Implementation roadmap'] },
    ],
  },
  // TOWER 6: CUSTOMER EXPERIENCE & GROWTH
  {
    code: 'CX-GROWTH',
    name: 'Customer Experience, Marketing, Sales & Growth',
    shortName: 'Customer Experience',
    icon: 'Heart',
    accentColor: '#EC4899',
    description: 'Transform customer experience and drive sustainable growth.',
    scope: 'Customer journey mapping, omnichannel strategy, service design, sales effectiveness, revenue operations, pricing & monetization strategy, CRM strategy and adoption enablement.',
    typicalOutcomes: ['Higher conversion rates', 'Better retention', 'Improved customer satisfaction'],
    certifications: [],
    frameworks: ['Design Thinking', 'Jobs-to-be-Done', 'NPS'],
    isFeatured: true,
    displayOrder: 6,
    services: [
      { name: 'Customer Journey Mapping', description: 'Map and optimize end-to-end customer journeys.', icon: 'Route', typicalDeliverables: ['Customer journey maps', 'Pain point analysis', 'Experience improvement roadmap'] },
      { name: 'Omnichannel Strategy', description: 'Design seamless experiences across all channels.', icon: 'Layers', typicalDeliverables: ['Channel strategy', 'Integration requirements', 'Omnichannel blueprint'] },
      { name: 'Service Design', description: 'Design services that delight customers.', icon: 'Palette', typicalDeliverables: ['Service blueprints', 'Service design artifacts', 'Prototype concepts'] },
      { name: 'Sales Effectiveness', description: 'Improve sales productivity and conversion.', icon: 'Target', typicalDeliverables: ['Sales playbooks', 'Sales process optimization', 'Performance metrics'] },
      { name: 'CRM Strategy & Adoption', description: 'Define CRM strategy and drive adoption.', icon: 'Users', typicalDeliverables: ['CRM operating model', 'Adoption plan', 'Success metrics'] },
    ],
  },
  // TOWER 7: DIGITAL TRANSFORMATION & AUTOMATION
  {
    code: 'DIGITAL',
    name: 'Digital Transformation & Automation',
    shortName: 'Digital Transformation',
    icon: 'Sparkles',
    accentColor: '#8B5CF6',
    description: 'Accelerate digital adoption and intelligent automation.',
    scope: 'Enterprise digitization, digital channels, workflow automation, product operating model, agile delivery enablement, process mining and automation (RPA + workflow + integration).',
    typicalOutcomes: ['Reduced manual work', 'Faster cycle times', 'Improved digital service delivery'],
    certifications: ['UiPath', 'Automation Anywhere'],
    frameworks: ['Product Operating Model', 'DevOps', 'Agile'],
    isFeatured: true,
    displayOrder: 7,
    services: [
      { name: 'Digital Transformation Roadmap', description: 'Define comprehensive digital transformation strategy.', icon: 'Map', typicalDeliverables: ['Digital transformation roadmap', 'Target state architecture', 'Investment prioritization'] },
      { name: 'Intelligent Automation (RPA/IPA)', description: 'Implement robotic and intelligent process automation.', icon: 'Bot', typicalDeliverables: ['Automation backlog', 'Bot design documents', 'Automation CoE setup'] },
      { name: 'Process Mining & Discovery', description: 'Discover automation opportunities through process mining.', icon: 'Search', typicalDeliverables: ['Process mining analysis', 'Automation opportunity map', 'Business case per process'] },
      { name: 'Digital Channel Development', description: 'Design and build modern digital channels.', icon: 'Smartphone', typicalDeliverables: ['Channel architecture', 'UX/UI designs', 'Implementation roadmap'] },
      { name: 'Agile Delivery Enablement', description: 'Enable agile ways of working for digital delivery.', icon: 'Zap', typicalDeliverables: ['Agile playbook', 'Team structures', 'Quality gates'] },
    ],
  },
  // TOWER 8: DATA, ANALYTICS & AI TRANSFORMATION
  {
    code: 'AI-DATA',
    name: 'Data, Analytics & AI Transformation',
    shortName: 'AI & Data',
    icon: 'Brain',
    accentColor: '#F59A23',
    description: 'Build trusted data foundations and scalable AI capabilities.',
    scope: 'Data strategy, data governance, analytics modernization, AI use-case discovery, ML/AI solution delivery, MLOps enablement, responsible AI governance and controls.',
    typicalOutcomes: ['Trusted data foundation', 'Scalable AI deployment', 'Measurable business impact'],
    certifications: ['CDMP', 'AWS ML Specialty'],
    frameworks: ['DAMA-DMBOK', 'MLOps', 'Responsible AI'],
    isFeatured: true,
    displayOrder: 8,
    services: [
      { name: 'Data Strategy & Operating Model', description: 'Define comprehensive data strategy and governance.', icon: 'Database', typicalDeliverables: ['Data strategy document', 'Data operating model', 'Governance framework'] },
      { name: 'AI Use-Case Discovery', description: 'Identify and prioritize AI opportunities.', icon: 'Lightbulb', typicalDeliverables: ['Use-case portfolio', 'Value vs feasibility matrix', 'Prioritized roadmap'] },
      { name: 'ML/AI Solution Delivery', description: 'Design and build production-grade AI solutions.', icon: 'Cpu', typicalDeliverables: ['ML solution architecture', 'Model documentation', 'Production deployment'] },
      { name: 'MLOps Enablement', description: 'Establish MLOps practices for scalable AI.', icon: 'GitBranch', typicalDeliverables: ['MLOps pipeline design', 'Model monitoring framework', 'Drift detection controls'] },
      { name: 'Responsible AI Governance', description: 'Implement ethical AI practices and controls.', icon: 'Shield', typicalDeliverables: ['AI ethics framework', 'Bias detection procedures', 'Governance playbook'] },
      { name: 'Executive AI Capacity Building', description: 'Build AI literacy across leadership.', icon: 'GraduationCap', typicalDeliverables: ['Executive AI workshop', 'Use-case ideation sessions', 'AI literacy program'] },
    ],
  },
  // TOWER 9: TECHNOLOGY STRATEGY & ENTERPRISE ARCHITECTURE
  {
    code: 'TECH-ARCH',
    name: 'Technology Strategy, Enterprise Architecture & Modernization',
    shortName: 'Enterprise Architecture',
    icon: 'Building',
    accentColor: '#0EA5E9',
    description: 'Define technology direction and modernize enterprise architecture.',
    scope: 'Enterprise architecture (TOGAF-aligned), application rationalization, legacy modernization, platform strategy, IT operating model, integration architecture, API strategy, event-driven enablement.',
    typicalOutcomes: ['Reduced tech debt', 'Cleaner architecture', 'Faster delivery', 'Improved scalability'],
    certifications: ['TOGAF', 'AWS SA Professional'],
    frameworks: ['TOGAF', 'Zachman', 'ArchiMate'],
    isFeatured: false,
    displayOrder: 9,
    services: [
      { name: 'Enterprise Architecture Assessment', description: 'Assess current state and define target architecture.', icon: 'Scan', typicalDeliverables: ['EA baseline assessment', 'Target state architecture', 'Architecture principles'] },
      { name: 'Application Portfolio Rationalization', description: 'Rationalize applications and define modernization path.', icon: 'Layers', typicalDeliverables: ['Application inventory', 'Rationalization recommendations', 'Modernization roadmap'] },
      { name: 'Legacy Modernization Strategy', description: 'Define strategy for legacy system modernization.', icon: 'RefreshCcw', typicalDeliverables: ['Modernization options analysis', 'Migration strategy', 'Risk assessment'] },
      { name: 'Integration & API Strategy', description: 'Define integration patterns and API strategy.', icon: 'Plug', typicalDeliverables: ['Integration blueprint', 'API governance model', 'Event-driven architecture patterns'] },
      { name: 'IT Operating Model Design', description: 'Design modern IT operating model.', icon: 'Settings', typicalDeliverables: ['IT TOM design', 'Service catalog', 'Governance framework'] },
    ],
  },
  // TOWER 10: CLOUD TRANSFORMATION & PLATFORM ENGINEERING
  {
    code: 'CLOUD',
    name: 'Cloud Transformation & Platform Engineering',
    shortName: 'Cloud & Platform',
    icon: 'Cloud',
    accentColor: '#06B6D4',
    description: 'Accelerate cloud adoption with secure, cost-effective platforms.',
    scope: 'Cloud strategy, landing zones, migration factory, hybrid cloud design, cloud security, identity integration, network architecture, FinOps enablement, cloud ops model.',
    typicalOutcomes: ['Secure cloud adoption', 'Controlled costs', 'Accelerated platform delivery'],
    certifications: ['AWS', 'Azure', 'GCP'],
    frameworks: ['AWS Well-Architected', 'Azure CAF', 'FinOps'],
    isFeatured: true,
    displayOrder: 10,
    services: [
      { name: 'Cloud Strategy & Roadmap', description: 'Define cloud strategy and migration roadmap.', icon: 'CloudCog', typicalDeliverables: ['Cloud strategy document', 'Reference architecture', 'Migration waves plan'] },
      { name: 'Landing Zone Design', description: 'Design secure, compliant cloud landing zones.', icon: 'LayoutGrid', typicalDeliverables: ['Landing zone architecture', 'Security controls', 'Network design'] },
      { name: 'Cloud Migration Factory', description: 'Execute large-scale cloud migrations.', icon: 'ArrowRightLeft', typicalDeliverables: ['Migration factory setup', 'Wave planning', 'Execution playbooks'] },
      { name: 'FinOps & Cost Optimization', description: 'Implement cloud cost management practices.', icon: 'Wallet', typicalDeliverables: ['FinOps framework', 'Tagging strategy', 'Cost allocation model'] },
      { name: 'Platform Engineering', description: 'Build developer platforms and self-service capabilities.', icon: 'Wrench', typicalDeliverables: ['Platform architecture', 'Golden paths', 'Developer portal'] },
    ],
  },
  // TOWER 11: CYBERSECURITY, IDENTITY & DIGITAL RESILIENCE
  {
    code: 'CYBER',
    name: 'Cybersecurity, Identity & Digital Resilience',
    shortName: 'Cybersecurity',
    icon: 'ShieldAlert',
    accentColor: '#EF4444',
    description: 'Protect digital assets and build organizational resilience.',
    scope: 'Cyber strategy, security architecture, SOC uplift, IAM/PAM, Zero Trust enablement, security engineering, incident response, threat modeling, secure SDLC/DevSecOps, resilience engineering: DR, BCMS (ISO 22301), ransomware preparedness.',
    typicalOutcomes: ['Reduced risk exposure', 'Stronger identity controls', 'Better incident readiness', 'Fewer security incidents'],
    certifications: ['ISO 27001', 'SOC 2', 'NIST CSF', 'ISO 22301'],
    frameworks: ['NIST CSF', 'Zero Trust', 'MITRE ATT&CK', 'ISO 27001'],
    isFeatured: true,
    displayOrder: 11,
    services: [
      { name: 'Cybersecurity Strategy & Roadmap', description: 'Define comprehensive security strategy and priorities.', icon: 'Map', typicalDeliverables: ['Cyber strategy document', 'Maturity assessment', 'Prioritized roadmap'] },
      { name: 'Security Architecture Design', description: 'Design secure architecture aligned to business needs.', icon: 'Castle', typicalDeliverables: ['Security architecture blueprint', 'Control mapping', 'Technology standards'] },
      { name: 'IAM/PAM Implementation', description: 'Implement identity and privileged access management.', icon: 'Key', typicalDeliverables: ['IAM/PAM architecture', 'Implementation blueprint', 'Governance model'] },
      { name: 'Zero Trust Enablement', description: 'Implement Zero Trust security model.', icon: 'ShieldX', typicalDeliverables: ['Zero Trust roadmap', 'Architecture patterns', 'Implementation playbook'] },
      { name: 'SOC Build/Uplift', description: 'Build or improve Security Operations Center.', icon: 'MonitorDot', typicalDeliverables: ['SOC operating model', 'Technology stack', 'Playbooks and runbooks'] },
      { name: 'Incident Response Planning', description: 'Develop incident response capabilities.', icon: 'Siren', typicalDeliverables: ['IR playbooks', 'Tabletop exercises', 'Crisis communications'] },
      { name: 'Business Continuity & DR', description: 'Implement BCMS and disaster recovery capabilities.', icon: 'Umbrella', typicalDeliverables: ['BCP/DRP documentation', 'RTO/RPO tiering', 'Testing schedule'] },
      { name: 'DevSecOps Implementation', description: 'Embed security into development pipelines.', icon: 'GitMerge', typicalDeliverables: ['DevSecOps framework', 'Pipeline security gates', 'Security tooling integration'] },
    ],
  },
  // TOWER 12: RISK, COMPLIANCE & REGULATORY ADVISORY (GRC)
  {
    code: 'GRC',
    name: 'Risk, Compliance & Regulatory Advisory',
    shortName: 'GRC',
    icon: 'Scale',
    accentColor: '#7C3AED',
    description: 'Navigate regulatory complexity with robust GRC frameworks.',
    scope: 'Enterprise risk, operational risk, control design and remediation, regulatory compliance programs, audit readiness, policy frameworks, security/privacy compliance (ISO 27001/27701/NDPR-style controls), governance.',
    typicalOutcomes: ['Faster regulatory response', 'Fewer audit findings', 'Stronger governance posture'],
    certifications: ['ISO 27001', 'ISO 27701', 'SOC 2'],
    frameworks: ['COSO', 'ISO 31000', 'NIST RMF'],
    isFeatured: false,
    displayOrder: 12,
    services: [
      { name: 'GRC Framework Implementation', description: 'Implement comprehensive GRC framework.', icon: 'BookOpen', typicalDeliverables: ['GRC framework document', 'Policy suite', 'Control library'] },
      { name: 'Enterprise Risk Assessment', description: 'Assess and prioritize enterprise risks.', icon: 'AlertTriangle', typicalDeliverables: ['Risk register', 'Risk heat map', 'Treatment plans'] },
      { name: 'Regulatory Compliance Program', description: 'Establish compliance programs for regulations.', icon: 'FileCheck', typicalDeliverables: ['Compliance framework', 'Gap analysis', 'Remediation roadmap'] },
      { name: 'Internal Control Design', description: 'Design and optimize internal controls.', icon: 'Lock', typicalDeliverables: ['Control design documentation', 'Control testing procedures', 'Evidence requirements'] },
      { name: 'Audit Readiness Support', description: 'Prepare organization for internal/external audits.', icon: 'ClipboardCheck', typicalDeliverables: ['Audit readiness checklist', 'Evidence packs', 'Finding remediation'] },
      { name: 'Policy Framework Development', description: 'Develop comprehensive policy frameworks.', icon: 'FileText', typicalDeliverables: ['Policy hierarchy', 'Policy templates', 'Review procedures'] },
    ],
  },
  // TOWER 13: FINANCE TRANSFORMATION (CFO ADVISORY)
  {
    code: 'FINANCE',
    name: 'Finance Transformation (CFO Advisory)',
    shortName: 'Finance Transformation',
    icon: 'PiggyBank',
    accentColor: '#059669',
    description: 'Transform finance function for speed, insight, and control.',
    scope: 'FP&A transformation, close & reporting modernization, cost accounting enhancements, performance management models, finance automation roadmap.',
    typicalOutcomes: ['Faster close cycles', 'Better reporting', 'Improved financial control'],
    certifications: ['CPA', 'CIMA'],
    frameworks: ['EPM', 'ABC Costing', 'Driver-Based Planning'],
    isFeatured: false,
    displayOrder: 13,
    services: [
      { name: 'Finance Operating Model Design', description: 'Design modern finance operating model.', icon: 'Building2', typicalDeliverables: ['Finance TOM', 'Process design', 'Organization design'] },
      { name: 'FP&A Transformation', description: 'Transform planning, budgeting, and forecasting.', icon: 'LineChart', typicalDeliverables: ['FP&A process design', 'Planning calendar', 'Reporting standards'] },
      { name: 'Close Cycle Optimization', description: 'Accelerate financial close process.', icon: 'Clock', typicalDeliverables: ['Close optimization plan', 'Automation opportunities', 'Control points'] },
      { name: 'Finance Automation', description: 'Automate finance processes and controls.', icon: 'Bot', typicalDeliverables: ['Automation roadmap', 'Bot specifications', 'ROI analysis'] },
      { name: 'Management Reporting Enhancement', description: 'Improve management reporting capabilities.', icon: 'BarChart3', typicalDeliverables: ['Reporting framework', 'KPI definitions', 'Dashboard designs'] },
    ],
  },
  // TOWER 14: PEOPLE, CHANGE & CAPABILITY BUILDING
  {
    code: 'CHANGE',
    name: 'People, Change & Capability Building',
    shortName: 'Change & Academy',
    icon: 'GraduationCap',
    accentColor: '#F97316',
    description: 'Drive adoption and build lasting organizational capabilities.',
    scope: 'Change management (ADKAR/Kotter-aligned), stakeholder engagement, training delivery, enablement programs, digital adoption, leadership development, culture shaping, learning academies.',
    typicalOutcomes: ['Higher adoption rates', 'Reduced resistance', 'Sustained transformation outcomes'],
    certifications: ['Prosci', 'CCMP'],
    frameworks: ['ADKAR', 'Kotter', 'Prosci'],
    isFeatured: false,
    displayOrder: 14,
    services: [
      { name: 'Change Management Strategy', description: 'Define change strategy for transformation success.', icon: 'Route', typicalDeliverables: ['Change strategy document', 'Stakeholder analysis', 'Change impact assessment'] },
      { name: 'Stakeholder Engagement', description: 'Engage stakeholders throughout transformation.', icon: 'Users', typicalDeliverables: ['Stakeholder map', 'Engagement plan', 'Communications plan'] },
      { name: 'Training & Enablement Program', description: 'Design and deliver training programs.', icon: 'BookOpen', typicalDeliverables: ['Training needs analysis', 'Curriculum design', 'Training materials'] },
      { name: 'Digital Adoption Platform', description: 'Implement digital adoption tools and practices.', icon: 'MousePointer', typicalDeliverables: ['DAP strategy', 'Content design', 'Adoption metrics'] },
      { name: 'Leadership Development', description: 'Develop leadership capabilities for change.', icon: 'Crown', typicalDeliverables: ['Leadership competency framework', 'Development programs', 'Coaching support'] },
      { name: 'Digibit Academy Programs', description: 'Role-based certification academies.', icon: 'Award', typicalDeliverables: ['Academy curriculum', 'Assessment frameworks', 'Certification pathways'] },
    ],
  },
  // TOWER 15: ESG / SUSTAINABILITY & CLIMATE RISK
  {
    code: 'ESG',
    name: 'ESG / Sustainability & Climate Risk Enablement',
    shortName: 'ESG & Sustainability',
    icon: 'Leaf',
    accentColor: '#22C55E',
    description: 'Enable sustainable business practices and climate risk management.',
    scope: 'ESG strategy, climate risk enablement, sustainability reporting support, ESG governance models and metrics design.',
    typicalOutcomes: ['Improved sustainability governance', 'Reporting readiness', 'Climate risk clarity'],
    certifications: ['GRI', 'SASB', 'TCFD'],
    frameworks: ['GRI', 'SASB', 'TCFD', 'UN SDGs'],
    isFeatured: false,
    displayOrder: 15,
    services: [
      { name: 'ESG Strategy Development', description: 'Define ESG strategy and priorities.', icon: 'Compass', typicalDeliverables: ['ESG strategy document', 'Materiality assessment', 'Priority areas'] },
      { name: 'Climate Risk Assessment', description: 'Assess climate risks and opportunities.', icon: 'Thermometer', typicalDeliverables: ['Climate risk assessment', 'Scenario analysis', 'Adaptation strategies'] },
      { name: 'Sustainability Reporting', description: 'Establish sustainability reporting capabilities.', icon: 'FileBarChart', typicalDeliverables: ['Reporting framework', 'Data collection process', 'Report templates'] },
      { name: 'ESG Governance Design', description: 'Design ESG governance structures.', icon: 'Building', typicalDeliverables: ['Governance model', 'Metrics framework', 'Accountability structure'] },
    ],
  },
  // TOWER 16: DEALS & M&A TECHNOLOGY DUE DILIGENCE
  {
    code: 'MA-DEALS',
    name: 'Deals, M&A Technology Due Diligence, PMI/Separation',
    shortName: 'M&A Advisory',
    icon: 'Handshake',
    accentColor: '#A855F7',
    description: 'Support M&A transactions with technology and cyber due diligence.',
    scope: 'Technology/cyber due diligence, integration planning, separation planning, post-merger integration (PMI) operating model and systems integration.',
    typicalOutcomes: ['Informed deal decisions', 'Successful integration', 'Value preservation'],
    certifications: [],
    frameworks: ['PMI Methodology', 'TSA Framework'],
    isFeatured: false,
    displayOrder: 16,
    services: [
      { name: 'Technology Due Diligence', description: 'Assess technology capabilities and risks for deals.', icon: 'Scan', typicalDeliverables: ['Tech DD report', 'Risk findings', 'Remediation recommendations'] },
      { name: 'Cyber Due Diligence', description: 'Assess cybersecurity posture for deals.', icon: 'ShieldQuestion', typicalDeliverables: ['Cyber DD report', 'Security findings', 'Risk quantification'] },
      { name: 'Post-Merger Integration Planning', description: 'Plan technology integration for successful PMI.', icon: 'Merge', typicalDeliverables: ['PMI roadmap', 'Synergy capture plan', 'Day 1 readiness'] },
      { name: 'Carve-Out & Separation Planning', description: 'Plan technology separation for divestitures.', icon: 'Split', typicalDeliverables: ['Separation roadmap', 'TSA requirements', 'Stranded cost analysis'] },
    ],
  },
  // TOWER 17: RESTRUCTURING & TURNAROUND
  {
    code: 'TURNAROUND',
    name: 'Restructuring & Turnaround Enablement',
    shortName: 'Turnaround',
    icon: 'RotateCcw',
    accentColor: '#DC2626',
    description: 'Enable rapid organizational turnaround and stabilization.',
    scope: 'Rapid diagnostic, cost and operating model reset, transformation acceleration.',
    typicalOutcomes: ['Rapid stabilization', 'Cost structure reset', 'Performance improvement'],
    certifications: [],
    frameworks: ['Turnaround Methodology'],
    isFeatured: false,
    displayOrder: 17,
    services: [
      { name: 'Rapid Diagnostic Assessment', description: 'Quick assessment of organizational health.', icon: 'Stethoscope', typicalDeliverables: ['Diagnostic report', 'Quick wins identification', 'Critical path'] },
      { name: 'Stabilization PMO', description: 'Establish PMO for turnaround execution.', icon: 'Anchor', typicalDeliverables: ['Stabilization plan', 'PMO setup', 'Progress tracking'] },
      { name: 'Operating Model Reset', description: 'Reset operating model for efficiency.', icon: 'RefreshCw', typicalDeliverables: ['Simplified TOM', 'Cost levers', 'Implementation roadmap'] },
    ],
  },
  // TOWER 18: FORENSICS & INVESTIGATIONS
  {
    code: 'FORENSICS',
    name: 'Forensics, Integrity & Investigations Enablement',
    shortName: 'Forensics',
    icon: 'SearchCheck',
    accentColor: '#64748B',
    description: 'Enable fraud prevention and investigation capabilities.',
    scope: 'Fraud controls assessment, integrity due diligence enablement, investigations support.',
    typicalOutcomes: ['Enhanced fraud controls', 'Investigation readiness', 'Integrity assurance'],
    certifications: ['CFE'],
    frameworks: ['ACFE Framework'],
    isFeatured: false,
    displayOrder: 18,
    services: [
      { name: 'Fraud Risk Assessment', description: 'Assess fraud risks and controls.', icon: 'AlertOctagon', typicalDeliverables: ['Fraud risk assessment', 'Control gaps', 'Enhancement roadmap'] },
      { name: 'Forensic Readiness Planning', description: 'Establish forensic investigation capabilities.', icon: 'FileSearch', typicalDeliverables: ['Forensic readiness playbook', 'Evidence handling process', 'Tool requirements'] },
      { name: 'Integrity Control Enhancement', description: 'Strengthen integrity controls.', icon: 'CheckSquare', typicalDeliverables: ['Control enhancements', 'Monitoring procedures', 'Reporting mechanisms'] },
    ],
  },
  // TOWER 19: PRODUCT ENGINEERING & SYSTEMS INTEGRATION
  {
    code: 'ENGINEERING',
    name: 'Product Engineering, Systems Integration & Enterprise Platforms',
    shortName: 'Engineering',
    icon: 'Code2',
    accentColor: '#3B82F6',
    description: 'Build, integrate, and implement enterprise solutions.',
    scope: 'Software engineering (web/mobile), enterprise integration, APIs, DevSecOps pipelines, QA automation, performance engineering, implementation of enterprise platforms: CRM/ERP/ITSM/IAM (tool-agnostic).',
    typicalOutcomes: ['Working systems', 'Scalable delivery', 'Production-grade quality'],
    certifications: ['AWS Developer', 'Azure Developer'],
    frameworks: ['DevOps', 'SAFe', 'Scrum'],
    isFeatured: true,
    displayOrder: 19,
    services: [
      { name: 'Custom Software Development', description: 'Design and build custom software solutions.', icon: 'Code', typicalDeliverables: ['Working software', 'Technical documentation', 'Deployment artifacts'] },
      { name: 'Enterprise Systems Integration', description: 'Integrate enterprise systems and applications.', icon: 'Plug', typicalDeliverables: ['Integration services', 'API implementations', 'Data flows'] },
      { name: 'Platform Implementation', description: 'Implement enterprise platforms (CRM, ERP, ITSM).', icon: 'Server', typicalDeliverables: ['Configured platform', 'Integration points', 'User acceptance'] },
      { name: 'DevSecOps Pipeline Setup', description: 'Establish secure CI/CD pipelines.', icon: 'GitBranch', typicalDeliverables: ['Pipeline configuration', 'Security gates', 'Automation scripts'] },
      { name: 'Quality Engineering & Testing', description: 'Establish quality engineering practices.', icon: 'TestTube2', typicalDeliverables: ['Test strategy', 'Automated test suite', 'Performance test results'] },
    ],
  },
  // TOWER 20: MANAGED SERVICES & OPERATIONS
  {
    code: 'MANAGED',
    name: 'Managed Services / Business Operations Outsourcing',
    shortName: 'Managed Services',
    icon: 'Headset',
    accentColor: '#14B8A6',
    description: 'Operate and manage technology and business operations.',
    scope: 'Managed cloud and application support, AIOps enablement, managed SOC/NOC, managed service desk/ITSM operations, SLA-based support.',
    typicalOutcomes: ['Stable operations', 'Predictable service quality', 'Reduced operational burden'],
    certifications: ['ITIL', 'ISO 20000'],
    frameworks: ['ITIL 4', 'SRE', 'AIOps'],
    isFeatured: false,
    displayOrder: 20,
    services: [
      { name: 'Managed Cloud Operations', description: 'Operate and manage cloud infrastructure.', icon: 'Cloud', typicalDeliverables: ['Cloud operations', 'Monitoring & alerting', 'Incident management'] },
      { name: 'Managed Application Support', description: 'Support and maintain applications.', icon: 'Wrench', typicalDeliverables: ['Application support', 'Bug fixes & enhancements', 'Performance monitoring'] },
      { name: 'Managed SOC Services', description: 'Security operations center as a service.', icon: 'Shield', typicalDeliverables: ['24/7 monitoring', 'Threat detection', 'Incident response'] },
      { name: 'Service Desk Operations', description: 'IT service desk management.', icon: 'Ticket', typicalDeliverables: ['Tier 1-3 support', 'SLA management', 'Knowledge management'] },
      { name: 'AIOps Enablement', description: 'Implement AI-driven operations.', icon: 'Brain', typicalDeliverables: ['AIOps platform', 'Automated remediation', 'Predictive analytics'] },
    ],
  },
  // TOWER 21: PUBLIC SECTOR MODERNIZATION
  {
    code: 'PUBLIC',
    name: 'Public Sector Modernization & Development Advisory',
    shortName: 'Public Sector',
    icon: 'Landmark',
    accentColor: '#0369A1',
    description: 'Enable government digital transformation and service modernization.',
    scope: 'Government digitization, regulator enablement (SupTech/RegTech), service delivery redesign, policy-to-technology translation, national-scale program execution.',
    typicalOutcomes: ['Modernized public services', 'Improved citizen experience', 'Enhanced regulatory capabilities'],
    certifications: [],
    frameworks: ['GovTech', 'SupTech', 'RegTech'],
    isFeatured: false,
    displayOrder: 21,
    services: [
      { name: 'Government Digital Strategy', description: 'Define government digitization roadmap.', icon: 'Map', typicalDeliverables: ['Digital strategy', 'Priority initiatives', 'Implementation roadmap'] },
      { name: 'Citizen Service Redesign', description: 'Redesign citizen-facing services.', icon: 'Users', typicalDeliverables: ['Service blueprints', 'Journey improvements', 'Channel strategy'] },
      { name: 'RegTech/SupTech Enablement', description: 'Enable regulatory technology capabilities.', icon: 'Scale', typicalDeliverables: ['Technology architecture', 'Capability roadmap', 'Platform design'] },
      { name: 'Agency Capacity Building', description: 'Build capabilities within government agencies.', icon: 'GraduationCap', typicalDeliverables: ['Training programs', 'Knowledge transfer', 'Sustainability plan'] },
    ],
  },
  // TOWER 22: RESEARCH & THOUGHT LEADERSHIP
  {
    code: 'RESEARCH',
    name: 'Research, Benchmarking, Maturity Assessments & Thought Leadership',
    shortName: 'Research & Insights',
    icon: 'Microscope',
    accentColor: '#6D28D9',
    description: 'Provide market intelligence and organizational benchmarking.',
    scope: 'Market intelligence, capability maturity models, benchmarking, executive playbooks.',
    typicalOutcomes: ['Market insights', 'Capability baselines', 'Prioritized improvements'],
    certifications: [],
    frameworks: ['CMMI', 'Gartner ITScore'],
    isFeatured: false,
    displayOrder: 22,
    services: [
      { name: 'Maturity Assessment', description: 'Assess organizational capability maturity.', icon: 'BarChart2', typicalDeliverables: ['Maturity assessment report', 'Benchmark comparison', 'Improvement roadmap'] },
      { name: 'Market Intelligence Research', description: 'Provide market and competitive intelligence.', icon: 'Globe', typicalDeliverables: ['Market research report', 'Competitive analysis', 'Trend analysis'] },
      { name: 'Executive Playbooks', description: 'Develop executive decision-making guides.', icon: 'BookOpen', typicalDeliverables: ['Executive playbook', 'Decision frameworks', 'Quick reference guides'] },
      { name: 'Benchmark Studies', description: 'Conduct industry benchmarking studies.', icon: 'TrendingUp', typicalDeliverables: ['Benchmark dashboard', 'Peer comparison', 'Best practices'] },
    ],
  },
];

/**
 * Engagement Model seed data
 */
export const engagementModelSeedData = [
  {
    code: 'ADVISORY',
    name: 'Advisory Sprints',
    icon: 'Zap',
    accentColor: '#1E4DB7',
    description: 'Rapid strategic assessments and decision-ready recommendations.',
    durationRange: '2-6 weeks',
    typicalOutputs: ['Decision-ready report', 'Strategic roadmap', 'Business case'],
    displayOrder: 1,
  },
  {
    code: 'IMPLEMENTATION',
    name: 'Implementation Programs',
    icon: 'Rocket',
    accentColor: '#F59A23',
    description: 'Build and rollout capabilities with governance and adoption.',
    durationRange: '6 weeks - 12 months',
    typicalOutputs: ['Working capabilities', 'Governance framework', 'Adoption & KPI tracking'],
    displayOrder: 2,
  },
  {
    code: 'MANAGED',
    name: 'Managed Services',
    icon: 'Headset',
    accentColor: '#10B981',
    description: 'Ongoing operations with SLA-driven stability and optimization.',
    durationRange: 'Ongoing',
    typicalOutputs: ['SLA-driven stability', 'Operational reporting', 'Continuous optimization'],
    displayOrder: 3,
  },
  {
    code: 'ACADEMY',
    name: 'Training & Capability Academies',
    icon: 'GraduationCap',
    accentColor: '#8B5CF6',
    description: 'Role-based academies with certifications and assessments.',
    durationRange: '1 day - 12 weeks',
    typicalOutputs: ['Trained workforce', 'Assessments', 'Certification outcomes'],
    displayOrder: 4,
  },
];

/**
 * Industry Practice seed data
 */
export const industryPracticeSeedData = [
  {
    code: 'FSI',
    name: 'Financial Services',
    icon: 'Building2',
    accentColor: '#1E4DB7',
    description: 'Specialized offerings for banks, MFBs, fintechs, and regulators.',
    subSectors: ['Banks', 'Microfinance Banks', 'Fintechs', 'Regulators', 'Insurance'],
    keyOfferings: [
      'Core banking integration & modernization',
      'Open banking/API enablement',
      'Payment switching architecture',
      'Fraud & risk controls',
      'IAM/PAM rollout',
      'Digital channels modernization',
      'Data/AI for customer 360',
    ],
    relatedTowerCodes: ['CYBER', 'AI-DATA', 'CLOUD', 'GRC', 'ENGINEERING'],
    displayOrder: 1,
  },
  {
    code: 'PUBLIC',
    name: 'Public Sector & Regulators',
    icon: 'Landmark',
    accentColor: '#0369A1',
    description: 'Government digitization and regulatory modernization.',
    subSectors: ['Federal Government', 'State Government', 'Regulators', 'Parastatals'],
    keyOfferings: [
      'Digital supervision enablement',
      'Resilience programs',
      'National identity frameworks',
      'Enterprise IT modernization',
      'Governance and compliance uplift',
    ],
    relatedTowerCodes: ['PUBLIC', 'CYBER', 'GRC', 'TRANSFORM'],
    displayOrder: 2,
  },
  {
    code: 'HEALTH',
    name: 'Healthcare & Life Sciences',
    icon: 'Heart',
    accentColor: '#EC4899',
    description: 'Healthcare system modernization and clinical enablement.',
    subSectors: ['Hospitals', 'Clinics', 'Pharmaceuticals', 'Health Regulators'],
    keyOfferings: [
      'Hospital/clinic systems modernization',
      'Identity and access management',
      'Privacy and compliance controls',
      'Digitized clinical workflows',
      'Data analytics and operational dashboards',
    ],
    relatedTowerCodes: ['CYBER', 'AI-DATA', 'GRC', 'DIGITAL'],
    displayOrder: 3,
  },
  {
    code: 'TELCO',
    name: 'Telecommunications & Enterprises',
    icon: 'Wifi',
    accentColor: '#6366F1',
    description: 'Telco transformation and large enterprise enablement.',
    subSectors: ['Mobile Operators', 'ISPs', 'Large Enterprises'],
    keyOfferings: [
      'Customer experience transformation',
      'Automation and process optimization',
      'Cloud migration',
      'Cybersecurity uplift',
      'Data platforms and analytics',
    ],
    relatedTowerCodes: ['CX-GROWTH', 'DIGITAL', 'CLOUD', 'CYBER', 'AI-DATA'],
    displayOrder: 4,
  },
  {
    code: 'ENERGY',
    name: 'Energy & Critical Infrastructure',
    icon: 'Zap',
    accentColor: '#F97316',
    description: 'Critical infrastructure protection and modernization.',
    subSectors: ['Oil & Gas', 'Power Generation', 'Utilities', 'Critical National Infrastructure'],
    keyOfferings: [
      'OT/IT security convergence',
      'SCADA security assessments',
      'Business continuity',
      'Regulatory compliance',
      'Digital twin enablement',
    ],
    relatedTowerCodes: ['CYBER', 'GRC', 'OPS-EXCEL', 'AI-DATA'],
    displayOrder: 5,
  },
];

/**
 * Seeds the service catalog with towers, services, engagement models, and industry practices
 */
export async function seedServiceCatalog(dataSource: DataSource): Promise<void> {
  const towerRepository = dataSource.getRepository(ServiceTower);
  const serviceRepository = dataSource.getRepository(CatalogService);
  const deliverableRepository = dataSource.getRepository(ServiceDeliverable);
  const engagementModelRepository = dataSource.getRepository(EngagementModel);
  const industryPracticeRepository = dataSource.getRepository(IndustryPractice);

  console.log('Seeding service catalog...');

  // Seed Engagement Models
  console.log('Seeding engagement models...');
  for (const modelData of engagementModelSeedData) {
    const existing = await engagementModelRepository.findOne({
      where: { code: modelData.code },
    });

    if (!existing) {
      const model = engagementModelRepository.create({
        ...modelData,
        slug: generateSlug(modelData.name),
      });
      await engagementModelRepository.save(model);
      console.log(`Created engagement model: ${modelData.name}`);
    } else {
      console.log(`Engagement model already exists: ${modelData.name}`);
    }
  }

  // Seed Industry Practices
  console.log('Seeding industry practices...');
  for (const practiceData of industryPracticeSeedData) {
    const existing = await industryPracticeRepository.findOne({
      where: { code: practiceData.code },
    });

    if (!existing) {
      const practice = industryPracticeRepository.create({
        name: practiceData.name,
        code: practiceData.code,
        slug: generateSlug(practiceData.name),
        description: practiceData.description,
        icon: practiceData.icon,
        accentColor: practiceData.accentColor,
        subSectors: practiceData.subSectors,
        keyOfferings: practiceData.keyOfferings,
        displayOrder: practiceData.displayOrder,
        // relatedTowerIds will be populated after towers are created
      });
      await industryPracticeRepository.save(practice);
      console.log(`Created industry practice: ${practiceData.name}`);
    } else {
      console.log(`Industry practice already exists: ${practiceData.name}`);
    }
  }

  // Seed Service Towers and their Services
  console.log('Seeding service towers...');
  for (const towerData of serviceTowerSeedData) {
    const existing = await towerRepository.findOne({
      where: { code: towerData.code },
    });

    if (!existing) {
      // Create tower
      const tower = towerRepository.create({
        code: towerData.code,
        name: towerData.name,
        shortName: towerData.shortName,
        slug: generateSlug(towerData.shortName),
        description: towerData.description,
        scope: towerData.scope,
        typicalOutcomes: towerData.typicalOutcomes,
        icon: towerData.icon,
        accentColor: towerData.accentColor,
        displayOrder: towerData.displayOrder,
        isFeatured: towerData.isFeatured,
        certifications: towerData.certifications,
        frameworks: towerData.frameworks,
      });

      const savedTower = await towerRepository.save(tower);
      console.log(`Created tower: ${towerData.name}`);

      // Create services for the tower
      for (let i = 0; i < towerData.services.length; i++) {
        const serviceData = towerData.services[i];
        const service = serviceRepository.create({
          towerId: savedTower.id,
          name: serviceData.name,
          slug: generateSlug(serviceData.name),
          description: serviceData.description,
          icon: serviceData.icon,
          typicalDeliverables: serviceData.typicalDeliverables,
          displayOrder: i + 1,
        });

        const savedService = await serviceRepository.save(service);

        // Create deliverables for the service
        for (let j = 0; j < serviceData.typicalDeliverables.length; j++) {
          const deliverableName = serviceData.typicalDeliverables[j];
          const deliverable = deliverableRepository.create({
            serviceId: savedService.id,
            name: deliverableName,
            displayOrder: j + 1,
          });
          await deliverableRepository.save(deliverable);
        }

        console.log(`  Created service: ${serviceData.name} with ${serviceData.typicalDeliverables.length} deliverables`);
      }
    } else {
      console.log(`Tower already exists: ${towerData.name}`);
    }
  }

  // Update Industry Practices with related tower IDs
  console.log('Linking industry practices to towers...');
  for (const practiceData of industryPracticeSeedData) {
    const practice = await industryPracticeRepository.findOne({
      where: { code: practiceData.code },
    });

    if (practice && practiceData.relatedTowerCodes) {
      const relatedTowerIds: string[] = [];
      for (const towerCode of practiceData.relatedTowerCodes) {
        const tower = await towerRepository.findOne({
          where: { code: towerCode },
        });
        if (tower) {
          relatedTowerIds.push(tower.id);
        }
      }
      practice.relatedTowerIds = relatedTowerIds;
      await industryPracticeRepository.save(practice);
      console.log(`Linked ${practiceData.name} to ${relatedTowerIds.length} towers`);
    }
  }

  console.log('Service catalog seeding completed!');
}

/**
 * Get tower by code from seed data (for reference without database)
 */
export function getTowerSeedByCode(code: string) {
  return serviceTowerSeedData.find((t) => t.code === code);
}

/**
 * Get all tower codes
 */
export function getAllTowerCodes(): string[] {
  return serviceTowerSeedData.map((t) => t.code);
}
