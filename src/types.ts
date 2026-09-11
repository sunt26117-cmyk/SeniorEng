export type ProjectPhase =
  | 'Concept'
  | 'A Sample'
  | 'B Sample'
  | 'C Sample'
  | 'DV'
  | 'PV'
  | 'SOP'
  | 'Post-SOP';

export type AsilLevel = 'QM' | 'ASIL A' | 'ASIL B' | 'ASIL C' | 'ASIL D';

export type HwLeadStyle = 'CONSERVATIVE' | 'AGILE_DELIVERY' | 'PROCESS_DEFENSIVE';

export interface ProjectContext {
  projectName: string;
  productType: string;
  ecuType: string;
  projectPhase: ProjectPhase;
  asilLevel: AsilLevel;
  customer: string;
  sopDate: string;
  nextMilestone: string;
  daysRemaining: number;
  costConstraint: string;
  sampleStatus: string;
  hwLeadStyle?: HwLeadStyle; // 直属领导处理风格与态度倾向
}

export type IssueCategory =
  | 'Component Alternative'
  | 'WCCA'
  | 'EMC'
  | 'Thermal'
  | 'Power'
  | 'BLDC Motor Drive'
  | 'Signal Integrity'
  | 'Reliability'
  | 'Functional Safety'
  | 'Customer Requirement'
  | 'DFM'
  | 'Production'
  | 'Cost Reduction'
  | 'Schedule Conflict'
  | 'Test Failure'
  | 'Design Deviation'
  | 'Other';

export interface IssueInput {
  issueCategories: IssueCategory[];
  requirement: string;
  actualMeasurement: string;
  testCondition: string;
  environment: string;
  failurePhenomenon: string;
  engineeringConcern: string;
  notes?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: string;
  }[];
}

export type RiskLevel = 'High' | 'Medium-High' | 'Medium' | 'Low';

export interface PhysicalFactor {
  factor: string;
  description: string;
}

export interface DFMEAView {
  failureMode: string;
  failureCause: string;
  localEffect: string;
  systemEffect: string;
  vehicleEffect: string;
  severity?: number;
  occurrence?: number;
  detection?: number;
  safetyImpact: boolean;
  regulatoryImpact: boolean;
  massProductionImpact: boolean;
}

export interface CandidateAction {
  id: string; // 'Option A', 'Option B', 'Option C', 'Option D'
  category: 'conservative' | 'balanced' | 'schedule_priority' | 'alternative';
  categoryLabel: string;
  name: string;
  description: string;
  expectedBenefit: string;
  scores: {
    T: number; // 0-100 (weight 25%)
    S: number; // 0-100 (weight 25%)
    C: number; // 0-100 (weight 15%)
    Q: number; // 0-100 (weight 20%)
    L: number; // 0-100 (weight 15%)
    total: number;
  };
  veto: {
    rejection_veto: boolean;
    veto_reason?: string;
  };
  riskBefore: string;
  riskAfter: string;
  residualRisk: RiskLevel;
  residualRiskDetail: string;
  sideEffects: string;
  verificationCost: string;
  timeCost: string;
  failureConsequence: string;
  preconditions: string;
  verificationMethod: string;
  planB: string;
}

export type RecommendationGrade =
  | 'Strongly Recommended'
  | 'Recommended'
  | 'Conditionally Recommended'
  | 'Caution'
  | 'Not Recommended';

export interface ImmediateStep {
  step: number;
  title: string;
  action: string;
  owner: string;
  deadline: string;
}

export interface FinalRecommendation {
  recommendedOptionId: string;
  recommendedOptionName: string;
  recommendationGrade: RecommendationGrade;
  whyReason: string[];
  immediateSteps: ImmediateStep[];
  preconditions: string[];
  unacceptableActions: string[];
  stopConditions: string[];
  reEvaluationTriggers: string[];
  planB: string;
}

export interface RaciItem {
  role: 'HW' | 'System' | 'SW' | 'PM' | 'Quality' | 'Safety' | 'Sourcing' | 'SQE' | 'Customer' | 'PSCR' | 'PSCR (产品安全代表)' | string;
  raciType: 'R' | 'A' | 'C' | 'I' | 'Approval';
  owner: string;
  action: string;
  output: string;
  dueDate: string;
  decisionGate: string;
}

export interface InternalDeviationPermit {
  title: string;
  permitType: 'Internal Deviation (内部受限工程偏差单)';
  internalBatchScope: string;
  manufacturingSite: string;
  usageConstraint: string;
  technicalRootCause: string;
  riskEvaluation: string;
  containmentProtocol: string;
  expirationDate: string;
  mandatoryScrapProtocol: string;
  approvers: {
    hwLead: string;
    plantQuality: string;
    productionManager: string;
  };
}

export interface CustomerConcessionRequest {
  title: string;
  permitType: 'OEM Customer Concession (主机厂客户工程让步申请书)';
  vdaStandardRef: string;
  fiveWhyRootCause: string[];
  missionProfileRisk: string;
  capaPlan: string;
  cutoffPoint: string;
  commercialImpact: string;
  signOffRequired: {
    tier1ProgramDirector: string;
    oemChiefEngineer: string;
    oemCommodityBuyer: string;
  };
}

export interface EngineeringDocs {
  pmDecisionEmail: {
    subject: string;
    technicalFact: string;
    currentSituation: string;
    risk: string;
    options: string;
    recommendedOption: string;
    costImpact: string;
    scheduleImpact: string;
    requiredDecision: string;
    decisionOwner: string;
    deadline: string;
    assumedProceeding: string;
    changeConsequence: string;
  };
  deviationPermit: {
    title: string;
    requirement: string;
    actualResult: string;
    deviationDetail: string;
    technicalCause: string;
    riskAnalysis: string;
    affectedScope: string;
    containment: string;
    temporaryValidity: string;
    approvalRoles: string;
    correctiveAction: string;
    verificationPlan: string;
    closureCriteria: string;
  };
  internalDeviationPermit?: InternalDeviationPermit;
  customerConcessionPermit?: CustomerConcessionRequest;
  meetingMinutes: {
    title: string;
    attendees: string;
    discussionSummary: string;
    agreements: string[];
    actionItems: string[];
  };
  riskAcceptance: {
    riskId: string;
    description: string;
    residualRiskJustification: string;
    acceptingSignOff: string;
    expirationCondition: string;
  };
  dfmeaComment: {
    lineItem: string;
    recommendedAction: string;
    targetDate: string;
    owner: string;
  };
  ecrDescription: {
    ecrTitle: string;
    reasonForChange: string;
    proposedSolution: string;
    costEstimate: string;
    toolingLeadTime: string;
    impactAssessment: string;
  };
}

export interface CopilotAnalysisResult {
  coreConclusion: {
    problemSummary: string;
    recommendedMeasure: string;
    reasonSummary: string;
  };
  riskRatings: {
    overallRisk: RiskLevel;
    overallRiskScore: number;
    technicalRisk: RiskLevel;
    qualityRisk: RiskLevel;
    scheduleRisk: RiskLevel;
    costRisk: RiskLevel;
    reliabilityRisk: RiskLevel;
    functionalSafetyRisk: RiskLevel;
  };
  knownFacts: string[];
  assumptions: string[];
  unknowns: string[];
  physicalMechanism: {
    rootCauseAnalysis: string;
    keyPhysicalFactors: PhysicalFactor[];
  };
  dfmeaView: DFMEAView;
  candidateActions: CandidateAction[];
  finalRecommendation: FinalRecommendation;
  raciMatrix: RaciItem[];
  containment: {
    shortTermMeasure: string;
    validityScope: string;
    responsibleParty: string;
    timeline: string;
  };
  capa: {
    rootCauseAction: string;
    preventiveMeasure: string;
    lessonsLearned: string;
    verificationTarget: string;
  };
  engineeringDocs: EngineeringDocs;
  source?: 'deterministic-expert' | 'custom-llm' | string;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  context: ProjectContext;
  issue: IssueInput;
}

export interface WccaComponent {
  name: string;
  nominal: number;
  initTolPercent: number;
  tempDriftPercent: number;
  agingPercent: number;
  distribution?: 'gaussian' | 'uniform';
}

export interface WccaCalcParams {
  components: WccaComponent[];
  targetErrorLimitPercent: number;
  iterations?: number;
}

export interface ThermalCalcParams {
  powerLossWatt: number;
  ambientTempC: number;
  rthJA: number;
  rthJC: number;
  tjMaxC: number;
  deratingMarginC: number;
}

export interface VoltageMarginParams {
  nominalVoltage: number;
  regulatorTolerancePercent: number;
  lineAndSwitchDropMv: number;
  transientDipMv: number;
  minAllowedVoltage: number;
}

export type AppTheme = 'dark' | 'light' | 'eyecare';

export type ModelProvider = 
  | 'builtin' 
  | 'deepseek' 
  | 'qwen' 
  | 'zhipu' 
  | 'moonshot' 
  | 'siliconflow' 
  | 'custom';

export interface ModelApiConfig {
  provider: ModelProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  enabled: boolean;
}

export * from './types/motorDrive';

