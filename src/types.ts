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

export interface CustomerSpecialAgreement {
  id: string;
  parameter: string;        // 如: "功率管降额安全系数", "急停制动响应时间", "BOM成本增幅上限"
  requiredValue: string;    // 如: ">= 1.30 (严于AEC-Q101 1.0)", "<= 250ms", "<= +$0.35"
  isMandatoryVeto: boolean; // 是否强制触发一票否决
}

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
  customerSpecialAgreements?: CustomerSpecialAgreement[]; // 客户特殊技术协议红线
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
  recurrenceCount?: number; // 该失效模式/相似问题的历史复发次数 (用于Q维度非线性惩罚与领导免责漂移)
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
  degradationAction?: string; // 降级或容错机制建议
}

export interface ReferencedStandard {
  standard: string; // 如 "ISO 26262-5", "AEC-Q100 Rev H", "ISO 16750-2", "CISPR 25"
  clause: string;   // 如 "Clause 7.4.3", "Table 2", "Section 4.6.2"
  relevance: string;// 如 "热降额判定依据与器件安全工作区", "辐射发射限值与传导骚扰"
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
  referenced_standards?: ReferencedStandard[]; // 可追溯的标准条款引用 (P1-3)
  customerVetoViolations?: string[];           // 击穿的客户特殊特性红线条目 (P1-1)
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

export interface PpapDeviationControlPlan {
  title: string;
  documentNumber: string;
  submissionLevel: string; // e.g. "PPAP Level 3 / Level 4"
  deviationCharacteristic: string;
  nominalSpecification: string;
  interimSpecification: string;
  processPhase: string;
  inspectionFrequency: string;
  containmentMethod: string;
  reactionPlan: string;
  effectiveBatchOrVinRange: string;
  closureTargetDate: string;
  standardReference: string;
  authorizedSignatures: {
    sqeManager: string;
    manufacturingQualityLead: string;
    programDirector: string;
  };
}

export interface SpecialCharacteristicsUpdate {
  title: string;
  ecrReferenceNumber: string;
  characteristicId: string;
  characteristicType: 'CC (Critical Characteristic / 安全关键特性)' | 'SC (Significant Characteristic / 重要功能特性)';
  parameterName: string;
  originalSpec: string;
  revisedSpec: string;
  classificationJustification: string;
  safetyOrComplianceImpact: string;
  processCapabilityRequirement: string; // e.g. "Cpk >= 1.67, Ppk >= 1.33"
  pokaYokeMethod: string;
  standardClauseRef: string;
  responsibleEngineers: {
    systemSafetyEngineer: string;
    hwArchitect: string;
    dfmeaModerator: string;
  };
}

export interface CustomerDeviationRequest {
  title: string;
  permitNumber: string;
  customerName: string;
  customerContactWindow: string; // 客户接口人 / 窗口姓名与岗位
  oemPartNumber: string;
  supplierPartNumber: string;
  standardClauses: string[]; // 涉及的标准条款 (原样带出)
  deviationDescription: string;
  rootCause5WhySummary: string;
  safetyAndEmcAssessment: string;
  qualityContainmentCommitment: string;
  impactOnVehicleAssembly: string;
  quantityOrDateLimit: string;
  customerAuthorizationSignOff: {
    oemCommodityBuyer: string;
    oemSystemEngineer: string;
    oemChiefQualityAuditor: string;
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
  ppapDeviationControlPlan?: PpapDeviationControlPlan;
  specialCharacteristicsUpdate?: SpecialCharacteristicsUpdate;
  customerDeviationRequest?: CustomerDeviationRequest;
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

export interface BldcCommutationRisk {
  controlMode: 'sensorless_bemf' | 'hall_six_step' | 'foc_vector';
  controlModeLabel: string;
  speedRangeRpm: [number, number];
  speedOffsetDeg: number;
  torqueRippleEstimatePct: number;
  stallOutProbability: 'low' | 'medium' | 'high';
  stallOutReason: string;
  degradationAction: string;
}

export interface BldcPositionSensorDegradation {
  sensorType: 'hall_triple' | 'hall_single' | 'optical_encoder' | 'sensorless';
  sensorTypeLabel: string;
  redundancyAvailable: boolean;
  switchingLogic: string;
  performanceLoss: string;
  dtcTriggered: string;
  powerLimitMode: string;
  dfmeaSeverity: number;
  dfmeaOccurrence: number;
  dfmeaDetection: number;
}

export interface BldcFunctionalSafetyChain {
  currentSenseDualChannel: {
    mainChannel: string;
    monitorChannel: string;
    toleranceThresholdPct: number;
    responseTimeLimitUs: number;
    crossCheckStatus: 'COMPLIANT' | 'WARNING' | 'CRITICAL';
    diagnosisMechanism: string;
  };
  watchdogTiming: {
    fhtiBudgetMs: number;
    safeStateTransitionMs: number;
    wdgTimeoutWindowMs: number;
    marginMs: number;
    timingCompliance: 'PASS' | 'CRITICAL';
  };
  asilDecomposition: {
    overallLevel: AsilLevel;
    mcuSubsystem: string;        // e.g. "ASIL D(B)"
    gateDriverSubsystem: string; // e.g. "ASIL B"
    positionSensorSubsystem: string; // e.g. "ASIL B / QM(B)"
    decompositionProof: string;
  };
}

export interface BldcExtendedAnalysis {
  commutationRisk: BldcCommutationRisk;
  positionSensorDegradation: BldcPositionSensorDegradation;
  functionalSafetyChain: BldcFunctionalSafetyChain;
}

export interface LeaderDriftRule {
  trigger: string;
  driftTo: HwLeadStyle;
  driftStrength: number;
  reason: string;
}

export interface LeaderProfile {
  baseStyle: HwLeadStyle;
  driftRules: LeaderDriftRule[];
}

export interface DriftEvaluationResult {
  baseStyle: HwLeadStyle;
  effectiveStyle: HwLeadStyle;
  isDrifted: boolean;
  driftPrompt?: string;
  driftTrigger?: string;
  multiplier: number;
  acceptanceRatePercent: number;
  warningTag?: string;
  positiveTag?: string;
  reason: string;
}

export type DebateRole = 'HW' | 'SW' | 'PM' | 'System';

export interface DebateDialogueRound {
  round: number;
  role: DebateRole;
  roleLabel: string;
  objection: string;
  hiddenWorry: string;
  counterRebuttal: string;
  evidenceReference: string;
}

export interface DebateSimulationResult {
  optionId: string;
  optionName: string;
  activeRole: DebateRole;
  rounds: DebateDialogueRound[];
  summaryGuidance: string;
  disclaimer: string;
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
  dfmeaItems?: DFMEAView[]; // 支持多条目 DFMEA 映射 (如位置传感器失效独立条目)
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
  bldcExtendedAnalysis?: BldcExtendedAnalysis; // BLDC 换相、传感器与功能安全链路扩展 (P0-1)
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
  | 'gemini'
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

