/**
 * Next Best Action + 验证闭环 + Value of Information (VOI) 引擎 (Section 8)
 * 严格遵照 V4 升级任务书：NOW/WHY/EXPECTED/PASS/FAIL/OWNER/DUE，VOI 性价比排序，闭环驱动风险与置信度重算
 */

import {
  NextBestActionItem,
  ValueOfInformationTest,
  VerificationPlanItem,
  TestResultEntry,
  DecisionRecord,
  TransparentRiskScore,
  V4CandidateAction,
  EvidenceItem,
} from '../types';

export function generateNextBestAction(daysRemaining: number): NextBestActionItem {
  return {
    now: '立即在电机台架连接高压光隔离差分探头，捕获 3800rpm 急停工况下 Vbus 泵升与 MOSFET Vds/Vgs 瞬态波形',
    why: '当前母线泵升与米勒直通风险为高等级，急需真实实测证据消除“未知”盲区，决定是否必须启用软硬件制动抑制',
    expected: '在三相下桥短接制动使能后，母线泵升从 37.8V 抑制至 16.5V 以下，门极感应脉冲幅值压制在 0.8V 以内',
    passCriteria: 'PASS: 连续 30 次急停波形中，最高 Vds 尖峰 <= 32.0V (留出 8.0V 耐压裕量)，Vgs 尖峰 <= 1.2V (留出 0.8V 门限裕量)',
    failCriteria: 'FAIL: 任一测试捕获到 Vds >= 36.0V 或 Vgs >= 1.8V，立即触发 Red Hard Stop，切断测试并启动硬件改板 Plan B',
    owner: '硬件主任工程师 (张工) & 电机台架测试工程师 (李工)',
    due: `今日 17:30 前完成首轮摸底 (距里程碑节点仅剩 ${daysRemaining} 天)`,
  };
}

export function calculateVoiTestPriorities(): ValueOfInformationTest[] {
  const candidates: Omit<ValueOfInformationTest, 'voiScore' | 'isTopPriority'>[] = [
    {
      testName: 'T1: 台架电机急停高压瞬态波形捕获 (Vbus & Vds)',
      objective: '精确测量 3800rpm 急停时母线真实泵升峰值与振铃频率，核实是否击穿 40V 耐压',
      decisionImpactScore: 9.5,      // 极高：直接决定是否一票否决方案
      riskReductionScore: 9.0,       // 消除最致命的直通与过压炸机风险
      uncertaintyReductionScore: 8.5,// 将估算值转化为高置信度实测值
      costScore: 2.0,                // 极低：已有台架和探头，仅需少量工时
      timeHoursScore: 3.0,           // 快：4小时内出结果
      rationale: '成本最低、耗时最短、对当前决策影响最大，是当务之急首选验证项',
    },
    {
      testName: 'T2: 门极回路有源米勒钳位动态抑制验证 (Vgs)',
      objective: '测试对管开通时由于高 dv/dt 在被关断管门极感应出的瞬态尖峰幅值',
      decisionImpactScore: 8.5,
      riskReductionScore: 8.8,
      uncertaintyReductionScore: 8.0,
      costScore: 2.5,
      timeHoursScore: 3.5,
      rationale: '直接回答是否存在同桥臂瞬态直通击穿的根本隐患',
    },
    {
      testName: 'T3: 85℃ 环温箱满载堵转温升热像仪测试',
      objective: '验证功率管在高温下的稳态结温 Tj 与引线铜皮散热性能',
      decisionImpactScore: 6.5,
      riskReductionScore: 7.0,
      uncertaintyReductionScore: 6.5,
      costScore: 4.5,
      timeHoursScore: 8.0,           // 需耗费温箱预热和稳态平衡时间
      rationale: '对当前紧急急停决策影响次要，可在方案确认后作为可靠性例行验证',
    },
    {
      testName: 'T4: CISPR 25 标准电波暗室全频段传导与辐射测试',
      objective: '验证 48MHz RC Snubber 对高频 EMI 谐振的实际吸收与衰减裕量',
      decisionImpactScore: 6.0,
      riskReductionScore: 6.5,
      uncertaintyReductionScore: 7.0,
      costScore: 8.0,                // 昂贵：暗室租金与排期成本高
      timeHoursScore: 9.0,           // 需预约外部暗室
      rationale: '暗室成本高排期长，应在台架波形优化达标后再行进场，避免浪费暗室费用',
    },
  ];

  // VOI = (Decision Impact + Risk Reduction + Uncertainty Reduction) / (Cost + Time)
  const scored = candidates.map((item) => {
    const numerator = item.decisionImpactScore + item.riskReductionScore + item.uncertaintyReductionScore;
    const denominator = item.costScore + item.timeHoursScore;
    const voiScore = Number((numerator / denominator).toFixed(2));
    return {
      ...item,
      voiScore,
      isTopPriority: false,
    };
  });

  scored.sort((a, b) => b.voiScore - a.voiScore);
  if (scored.length > 0) {
    scored[0].isTopPriority = true;
  }
  return scored;
}

export function generateStructuredVerificationPlan(): VerificationPlanItem[] {
  return [
    {
      objective: '急停母线泵升与下桥短接能耗制动抑制效果验证',
      condition: '电机额定转速 3800rpm 满载空转，电源设置为 13.5V 车载标准输入，触发硬件 E-Stop',
      method: '双相继电器或 MCU 刹车中断切入三相全下桥短路制动',
      instrumentation: 'Tektronix MSO 54 示波器 (1GHz 带宽) + IsoVu 光隔离差分探头 + 罗氏线圈电流探头',
      measurement: '母线端电压 Vbus(t)、相电流 I_phase(t)、MOSFET 漏源极电压 Vds(t)',
      passCriteria: '母线瞬态电压峰值 <= 18.0V (安全裕量 >= 22.0V，距 40V 耐压十分安全)',
      failCriteria: '母线瞬态电压峰值 >= 35.0V 或出现持续高频等幅振荡振铃',
      sampleSize: 5,
      owner: '张工 (硬件开发专家)',
      deadline: 'DVT-Day 3 (17:00)',
    },
    {
      objective: '门极高 dv/dt 米勒效应感应尖峰与钳位回路有效性验证',
      condition: '母线供电 16.0V (模拟极限高压)，满相电流 25A 换相跳变，测试对管最快上升沿',
      method: '高阻无源探头配合最短接地弹簧直接测量下管 Vgs 焊盘',
      instrumentation: '500MHz 无源探头接地弹簧法 (接地回路 < 5mm)',
      measurement: '下桥 MOSFET 门极引脚瞬态感应电压 Vgs_peak',
      passCriteria: 'Vgs 脉冲最高尖峰 <= 0.8V (远低于 2.0V 开启阈值下限，裕量 >= 1.2V)',
      failCriteria: 'Vgs 尖峰 >= 1.6V 或观测到同桥臂上下管电流重叠直通台阶',
      sampleSize: 3,
      owner: '李工 (驱动与功率硬件工程师)',
      deadline: 'DVT-Day 4 (12:00)',
    },
    {
      objective: '48MHz RC Snubber 高频振铃衰减与电阻热负荷测试',
      condition: 'PWM 频率 20kHz 持续运行 30 分钟，额定相电流 15A 连续运转',
      method: '近场探头监测开关节点辐射频谱，热电偶贴于 Snubber 电阻表面',
      instrumentation: '频谱分析仪 + 近场 H-Field 磁场探头 + 接触式点温计',
      measurement: '48MHz 频点高频谐波峰值衰减幅度 (dB) & 电阻表面温度 (℃)',
      passCriteria: '48MHz 尖峰衰减 >= 12dB 且 0805 吸收电阻表面温升 <= 45℃ (表面温度 < 100℃)',
      failCriteria: '衰减 < 6dB 或吸收电阻发生碳化发黑与结温过热',
      sampleSize: 5,
      owner: '王工 (EMC 整改工程师)',
      deadline: 'DVT-Day 5 (16:00)',
    },
  ];
}

export function executeTestFeedbackLoop(
  currentRisk: TransparentRiskScore,
  testEntry: TestResultEntry
): {
  updatedRisk: TransparentRiskScore;
  evidenceUpdate: EvidenceItem;
  decisionUpdateMessage: string;
} {
  // 根据测试结果重新计算风险与置信度
  const isPass = testEntry.passFail === 'PASS';
  const updatedRisk: TransparentRiskScore = {
    ...currentRisk,
    overallRiskLevel: isPass ? 'Low' : 'High',
    overallScore: isPass ? 28 : 88,
    technicalRisk: isPass ? 'Low' : 'High',
    confidence: 'HIGH', // 实测数据更新后置信度变为 HIGH
    verificationGap: 'LOW', // 闭环补全
    uncertainty: 'LOW',
    majorRiskDriver: isPass ? '长期环境老化耐受度 (已消除急停炸机风险)' : '实测仍突破安全限值，必须切入硬件改板',
  };

  const evidenceUpdate: EvidenceItem = {
    id: `EVID-${Date.now()}`,
    claim: `实测 ${testEntry.measurement} 结果为 ${testEntry.result} (${testEntry.passFail})`,
    evidenceType: 'MEASURED',
    source: `台架实验报告 ${testEntry.testId} (测试人: ${testEntry.engineer})`,
    confidence: 'HIGH',
    confidenceReason: '使用 1GHz 示波器光隔离差分探头实测波形确认，数据具有最高工程证据效力',
    measuredValue: testEntry.result,
  };

  const decisionUpdateMessage = isPass
    ? '✅ 实测数据完全符合 Pass Criteria，母线瞬态与米勒尖峰均被成功压制至安全区，已具备正式推进放行条件，风险闭环关闭！'
    : '❌ 实测数据触发 Fail Criteria 警戒红线，当前软硬件参数仍不足以抵抗极端应力，决策引擎自动触发 Escalation 并切换至 Plan B 硬件改板！';

  return {
    updatedRisk,
    evidenceUpdate,
    decisionUpdateMessage,
  };
}
