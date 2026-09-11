import { CandidateAction, HwLeadStyle } from '../types';

export interface LeadershipEvaluationResult {
  multiplier: number;
  acceptanceRatePercent: number;
  warningTag?: string;
  positiveTag?: string;
  reason: string;
}

export function evaluateLeadershipFit(
  strategy: CandidateAction,
  leaderStyle: HwLeadStyle = 'CONSERVATIVE'
): LeadershipEvaluationResult {
  const text = `${strategy.name} ${strategy.description} ${strategy.timeCost} ${strategy.sideEffects} ${strategy.expectedBenefit}`.toLowerCase();
  
  // 判定特征
  const requiresPcbRespin =
    text.includes('改版') ||
    text.includes('打板') ||
    text.includes('respin') ||
    text.includes('re-spin') ||
    text.includes('重新投板') ||
    text.includes('重新布线') ||
    text.includes('更换封装');

  const isTier0or1 =
    strategy.category === 'balanced' ||
    text.includes('原位') ||
    text.includes('软件') ||
    text.includes('配置') ||
    text.includes('微调') ||
    text.includes('snubber') ||
    text.includes('阻容') ||
    text.includes('双轨') ||
    text.includes('磁珠') ||
    text.includes('有源米勒') ||
    text.includes('下桥制动');

  const hasResidualRiskOrDeratingShortage =
    strategy.residualRisk === 'High' ||
    strategy.residualRisk === 'Medium-High' ||
    text.includes('裕量不足') ||
    text.includes('特采') ||
    text.includes('让步') ||
    text.includes('降额不足') ||
    text.includes('极限') ||
    text.includes('侥幸');

  const isRootCauseFix =
    text.includes('根治') ||
    text.includes('机理彻底') ||
    text.includes('彻底解决') ||
    text.includes('物理根治') ||
    strategy.category === 'conservative' ||
    strategy.scores.T >= 90;

  const isUnilateralHwRisk =
    text.includes('盲目') ||
    text.includes('私下放行') ||
    text.includes('硬件单方') ||
    text.includes('赌') ||
    text.includes('放宽保护门限') ||
    strategy.scores.L < 50;

  const hasExternalSignoff =
    strategy.scores.L >= 85 ||
    text.includes('联合') ||
    text.includes('会签') ||
    text.includes('双轨') ||
    text.includes('外壳真实') ||
    text.includes('ecr') ||
    text.includes('签字');

  let multiplier = 1.0;
  let acceptanceRatePercent = 75;
  let warningTag: string | undefined;
  let positiveTag: string | undefined;
  let reason = '';

  if (leaderStyle === 'CONSERVATIVE') {
    // 🛡️ 风格 1：技术求稳型（Quality & Safety First）
    // 态度倾向：极度在乎技术裕量和部门专业声誉。宁可让项目稍微推迟 2 周，也绝不接受降额贴线跑。
    if (hasResidualRiskOrDeratingShortage) {
      multiplier = 0.7; // 扣除 30% 分数
      acceptanceRatePercent = 35;
      warningTag = '⚠️ 领导态度预警：技术求稳型领导极度排斥“带病特采/降额不足”，部门初审极大概率被直接卡死！';
      reason = '技术求稳型领导极度在乎部门声誉与量产防爆雷，严禁低裕量特采带病流转。';
    } else if (isRootCauseFix) {
      multiplier = 1.15; // 彻底根治方案加分
      acceptanceRatePercent = 95;
      positiveTag = '⭐ 领导首选：契合技术求稳风格，根治机理闭环，具备充足安全降额裕量。';
      reason = '方案从物理机理彻底消除隐患，降额充分，领导签字放心。';
    } else {
      multiplier = 1.0;
      acceptanceRatePercent = 70;
      reason = '技术方案中规中矩，领导将重点核查实测自证硬核数据。';
    }
  } else if (leaderStyle === 'AGILE_DELIVERY') {
    // 🚀 风格 2：敏捷救火型（Schedule & Delivery First）
    // 态度倾向：极度务实，以保住交付为第一要务。内部微调搞定，极力抗拒改版打乱节奏。
    if (requiresPcbRespin) {
      multiplier = 0.65; // 改版方案大幅降权
      acceptanceRatePercent = 25;
      warningTag = '⚠️ 领导态度预警：当前改版方案虽技术稳妥，但严重违背直属领导【敏捷保交付】宗旨，极大概率在内部初审被按住！';
      reason = '改版打板周期长且挤占全组通宵救火精力，敏捷型领导抗拒此类兴师动众方案。';
    } else if (isTier0or1) {
      multiplier = 1.2; // 原位/软件方案大幅加分
      acceptanceRatePercent = 96;
      positiveTag = '🚀 领导极力支持：零/低工期原位就地消化，不挤爆部门资源，力保 DV 交付节点！';
      reason = '原位阻容贴片或底层寄存器微调，内部低调搞定，保住交付生命线。';
    } else {
      multiplier = 1.0;
      acceptanceRatePercent = 65;
      reason = '需提供给领导向 PM 交差的死保时间承诺。';
    }
  } else if (leaderStyle === 'PROCESS_DEFENSIVE') {
    // ⚖️ 风格 3：流程免责型（Process & Boundary First）
    // 态度倾向：极度注重权责划分。如果是外部输入，坚决主张把球踢出去，发起外部 ECR 要资源。
    if (isUnilateralHwRisk) {
      multiplier = 0.5; // 硬件单方背锅直接腰斩
      acceptanceRatePercent = 15;
      warningTag = '⚠️ 领导态度绝杀：此方案将使硬件单方背负全部连带责任，流程免责型领导绝不可能签字背锅！';
      reason = '缺乏外部依据，日后被审计或客户追责时硬件将成唯一责任人。';
    } else if (hasExternalSignoff) {
      multiplier = 1.25; // 有外部会签的方案大幅加权
      acceptanceRatePercent = 94;
      positiveTag = '🛡️ 流程免责首选：权责边界清晰，有系统/车厂外部会签背书，硬件免责闭环。';
      reason = '方案有据可查，各方责任分界清晰，日后审计合规无忧。';
    } else {
      multiplier = 0.9;
      acceptanceRatePercent = 60;
      reason = '需要补充系统/车厂书面联签记录以满足免责门禁。';
    }
  }

  // 综合计算百分比展示 (20% ~ 99%)
  const clampedRate = Math.min(99, Math.max(15, Math.round(acceptanceRatePercent * (strategy.scores.total / 85))));

  return {
    multiplier,
    acceptanceRatePercent: clampedRate,
    warningTag,
    positiveTag,
    reason,
  };
}
