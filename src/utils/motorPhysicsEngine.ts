/**
 * 车载/机器人 BLDC 电机驱动物理计算引擎 (Motor Physics Engine)
 * 纯确定性数学模型，无第三方依赖，严格对齐车规 ISO 16750-2 / CISPR 25 与功率半导体机理
 */

import {
  BusPumpingResult,
  MillerRiskResult,
  SnubberCalcResult,
} from '../types/motorDrive';

/**
 * 1. 急停与制动时电机机械动能向母线倒灌过压 (Bus Pumping Peak) 计算
 * 物理原理：制动瞬间若无下桥能耗制动或主动吸收，转子动能 Ek = 0.5 * J * w^2 将按转化效率倒灌至母线电容，
 * 电容电压从初始 V_bus_nom 泵升至 V_bus_peak。
 */
export function calculateBusPumping(params: {
  V_bus_nom: number;            // 标称母线电压 (V)，例如 12V / 24V / 48V
  V_bus_max_rating: number;     // 母线电容或 MOS 额定耐压 (V)，例如 40V / 60V / 100V
  C_dc_uF: number;              // 母线有效去耦滤波电容总和 (μF)
  J_kg_m2: number;              // 电机转子与折算负载总转动惯量 (kg·m²)
  n_rpm: number;                // 制动前电机最高转速 (rpm)
  regenEfficiency?: number;     // 动能转化为电能比例 (0~1, 默认 0.75，扣除机械摩擦与铜耗)
  L_harness_uH?: number;        // 线束寄生电感 (μH, 可选)
  I_phase_A?: number;           // 急停前相电流 (A, 可选)
}): BusPumpingResult {
  const {
    V_bus_nom,
    V_bus_max_rating,
    C_dc_uF,
    J_kg_m2,
    n_rpm,
    regenEfficiency = 0.75,
    L_harness_uH = 0,
    I_phase_A = 0,
  } = params;

  // 1. 计算角速度 omega = 2 * pi * n / 60 (rad/s)
  const omega = (2 * Math.PI * Math.max(0, n_rpm)) / 60;

  // 2. 机械转动总动能 Ek = 0.5 * J * omega^2 (Joules)
  const kineticEnergyJoules = 0.5 * Math.max(0, J_kg_m2) * Math.pow(omega, 2);

  // 3. 线束电感释放的电磁能量 EL = 0.5 * L * I^2 (Joules)
  const harnessEnergyJoules =
    0.5 * (Math.max(0, L_harness_uH) * 1e-6) * Math.pow(Math.max(0, I_phase_A), 2);

  // 4. 倒灌到母线电容的总能量
  const regenEnergyJoules =
    kineticEnergyJoules * Math.min(1, Math.max(0, regenEfficiency)) + harnessEnergyJoules;

  // 5. 母线电容初始储能 Ec0 = 0.5 * C * V_nom^2
  const C_farad = Math.max(1, C_dc_uF) * 1e-6;
  const initialCapEnergy = 0.5 * C_farad * Math.pow(V_bus_nom, 2);

  // 6. 最终总能量与泵升电压 V_bus_peak = sqrt(2 * (Ec0 + E_regen) / C)
  const totalEnergy = initialCapEnergy + regenEnergyJoules;
  const V_bus_peak = Math.sqrt((2 * totalEnergy) / C_farad);
  const voltageRise = V_bus_peak - V_bus_nom;
  const voltageMarginV = V_bus_max_rating - V_bus_peak;
  const isOverVoltage = V_bus_peak > V_bus_max_rating;

  let severity: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
  let recommendation = '母线电压在安全降额范围内，电容与MOS耐压满足降额规范。';

  if (isOverVoltage) {
    severity = 'CRITICAL';
    recommendation = `【严重超标】泵升电压 (${V_bus_peak.toFixed(1)}V) 突破器件额定耐压 (${V_bus_max_rating}V)！可能瞬间击穿电容或下桥MOS！建议：1. 软件急停改为三相全下桥短接动态能耗制动；2. 母线并联 TVS/大功率双向瞬变二极管；3. 增大母线电容至 ${(C_dc_uF * 2).toFixed(0)}μF 以上。`;
  } else if (voltageMarginV < V_bus_max_rating * 0.15) {
    severity = 'WARNING';
    recommendation = `【裕量偏紧】耐压安全裕量仅剩 ${voltageMarginV.toFixed(1)}V (<15%)。考虑冷车环境电解电容容量衰减与ESR升高，建议加大电容或在控制算法中加入减速斜坡限制。`;
  }

  return {
    kineticEnergyJoules: Number(kineticEnergyJoules.toFixed(3)),
    regenEnergyJoules: Number(regenEnergyJoules.toFixed(3)),
    V_bus_peak: Number(V_bus_peak.toFixed(2)),
    voltageRise: Number(voltageRise.toFixed(2)),
    isOverVoltage,
    voltageMarginV: Number(voltageMarginV.toFixed(2)),
    severity,
    recommendation,
  };
}

/**
 * 2. 米勒感应直通风险评估 (Miller Cross-Conduction Check)
 * 物理原理：桥臂一侧对管高 dv/dt 开通时，处于关断态的管子由于 C_gd 米勒电容耦合位移电流 Im = C_gd * dv/dt，
 * 该电流流经门极关断下拉回路阻抗 Rg_pulldown，在栅极感应出正电压 Vg_induced。
 * 若 Vg_induced >= V_th_min，该关断管将发生假开通，引发母线对地同桥臂瞬时直通 (Shoot-through) 甚至炸管。
 */
export function checkMillerRisk(params: {
  V_th_min: number;              // 门极最小开启阈值电压 (V)，例如 2.0V
  C_gd_pF: number;               // 栅漏电容 / 米勒电容 (pF)，例如 35pF
  C_gs_pF: number;               // 栅源输入电容 (pF)，例如 1500pF
  R_g_pulldown_ohm: number;      // 门极关断回路总有效阻抗 (Ω, 驱动下拉内阻 + 外置阻抗 + MOS内部Rg)
  dv_dt_V_per_ns: number;        // 开关节点反向对管开启导致的电压上升率 (V/ns)，例如 5~15 V/ns
  hasActiveMillerClamp?: boolean;// 是否启用了预驱芯片内置的有源米勒钳位 (Active Miller Clamp)
}): MillerRiskResult {
  const {
    V_th_min,
    C_gd_pF,
    C_gs_pF: _C_gs_pF,
    R_g_pulldown_ohm,
    dv_dt_V_per_ns,
    hasActiveMillerClamp = false,
  } = params;

  // dv/dt: 1 V/ns = 1e9 V/s
  // Im = C_gd * (dv/dt) = (C_gd * 1e-12) * (dv_dt * 1e9) = C_gd * dv_dt * 1e-3 (Amperes)
  const millerCurrentA = (C_gd_pF * dv_dt_V_per_ns) / 1000;

  // 门极感应电压 Vg_induced = Im * Rg_pulldown
  let vGateInducedV = millerCurrentA * R_g_pulldown_ohm;

  // 若启用硬件有源米勒钳位，内部低阻 MOSFET (<0.5Ω) 强行钳位，大幅衰减感应电压 (衰减至约 15%)
  if (hasActiveMillerClamp) {
    vGateInducedV *= 0.15;
  }

  const safetyMarginV = V_th_min - vGateInducedV;
  const isRiskOfShootThrough = vGateInducedV >= V_th_min;

  let riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL_SHOOT_THROUGH' = 'SAFE';
  let recommendation = '门极米勒感应电压低于器件阈值，处于安全裕量范围内。';

  if (isRiskOfShootThrough) {
    riskLevel = 'CRITICAL_SHOOT_THROUGH';
    recommendation = `【极度危险：直通炸管隐患】米勒感应电压 (${vGateInducedV.toFixed(2)}V) 已经跨越门极开启阈值 (${V_th_min}V)！在高温时门极阈值进一步漂移下降，必发生同臂直通！建议：1. 开启驱动器有源米勒钳位；2. 增加门极外置抗拉电阻或关断反向并联二极管；3. 适当调大开通电阻以限制对管 dv/dt；4. 选用 C_gd/C_gs 比值更小的车规级 MOSFET。`;
  } else if (safetyMarginV < 0.6) {
    riskLevel = 'WARNING';
    recommendation = `【临界预警】门极开启安全裕量仅 ${safetyMarginV.toFixed(2)}V (<0.6V)。汽车环境在 125℃~150℃ 时 V_th 会衰减 20%~30%，存在偶发微导通发热风险，建议优化门极关断回路。`;
  }

  return {
    millerCurrentA: Number(millerCurrentA.toFixed(3)),
    vGateInducedV: Number(vGateInducedV.toFixed(2)),
    vThMinV: Number(V_th_min.toFixed(2)),
    safetyMarginV: Number(safetyMarginV.toFixed(2)),
    isRiskOfShootThrough,
    riskLevel,
    recommendation,
  };
}

/**
 * 3. 开关节点 RC Snubber 缓冲器最佳阻尼计算 (Snubber Calculator)
 * 物理原理：开关节点高频振铃由功率回路寄生杂散电感 L_loop 与 MOSFET 输出电容 C_oss 谐振引起：
 * f_ring = 1 / (2 * pi * sqrt(L_loop * C_oss))
 * 推荐吸收电容 C_snub = 2 ~ 3 * C_oss
 * 推荐吸收电阻（特征阻抗临界阻尼） R_snub = sqrt(L_loop / C_snub)
 */
export function calculateSnubberParams(params: {
  f_ring_MHz: number;    // 示波器实测振铃频率 (MHz)，例如 30~80MHz
  C_oss_pF: number;      // MOSFET 输出电容 (pF)，例如 500~1500pF
  V_bus_V?: number;      // 母线供电电压 (V)，例如 13.5V / 24V / 48V
  f_sw_kHz?: number;     // PWM 开关频率 (kHz)，例如 20kHz
}): SnubberCalcResult {
  const {
    f_ring_MHz,
    C_oss_pF,
    V_bus_V = 13.5,
    f_sw_kHz = 20,
  } = params;

  const f_ring_hz = Math.max(1, f_ring_MHz) * 1e6;
  const C_oss_farad = Math.max(10, C_oss_pF) * 1e-12;

  // 1. 反推环路寄生电感 L_loop = 1 / ( (2*pi*f)^2 * C_oss )
  const loopInductanceH = 1 / (Math.pow(2 * Math.PI * f_ring_hz, 2) * C_oss_farad);
  const loopInductanceNh = loopInductanceH * 1e9;

  // 2. 推荐 C_snub 取 2 倍 C_oss
  const recommendedCsnubPf = Math.round(C_oss_pF * 2);
  const C_snub_farad = recommendedCsnubPf * 1e-12;

  // 3. 推荐 R_snub 取特征阻抗阻尼 R = sqrt(L / C_snub)
  const recommendedRsnubOhm = Math.round(Math.sqrt(loopInductanceH / C_snub_farad) * 10) / 10;

  // 4. 单相 RC 吸收电阻功率损耗 P_snub = C_snub * V_bus^2 * f_sw
  const f_sw_hz = f_sw_kHz * 1e3;
  const snubberPowerDissipationW = C_snub_farad * Math.pow(V_bus_V, 2) * f_sw_hz;

  // 5. 预期 EMI 尖峰衰减 (典型可削减 6~14 dB 的高频谐波尖峰)
  const attenuationDbe = Math.min(16, Math.max(6, Math.round(8 + Math.log10(recommendedCsnubPf / 100) * 3)));

  return {
    loopInductanceNh: Number(loopInductanceNh.toFixed(1)),
    recommendedCsnubPf,
    recommendedRsnubOhm: Math.max(1, recommendedRsnubOhm),
    snubberPowerDissipationW: Number(snubberPowerDissipationW.toFixed(3)),
    dampingRatio: 0.707, // 临界阻尼设计
    attenuationDbe,
  };
}
