import React, { useState } from 'react';
import { CopilotAnalysisResult, CandidateAction, HwLeadStyle } from '../types';
import { evaluateLeadershipFit, applyRecurrencePenaltyToQ } from '../utils/leadershipEngine';
import {
  Sliders,
  ShieldAlert,
  Award,
  AlertOctagon,
  RotateCcw,
  ArrowRight,
  BarChart2,
  Clock,
  Flame,
  AlertTriangle,
  Info,
  UserCheck,
  Zap,
  Scale,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface DecisionCockpitViewProps {
  result: CopilotAnalysisResult | null;
  onGoToRecommendation: () => void;
  hwLeadStyle?: HwLeadStyle;
  onLeadStyleChange?: (style: HwLeadStyle) => void;
  recurrenceCount?: number;
}

export const DecisionCockpitView: React.FC<DecisionCockpitViewProps> = ({
  result,
  onGoToRecommendation,
  hwLeadStyle = 'AGILE_DELIVERY',
  onLeadStyleChange,
  recurrenceCount = 0,
}) => {
  if (!result) return null;

  // C-T-S-Q-L 标准权重: T: 25%, S: 25%, C: 15%, Q: 20%, L: 15%
  const [weights, setWeights] = useState({
    T: 25,
    S: 25,
    C: 15,
    Q: 20,
    L: 15,
  });

  // 直属领导态度风格状态
  const [currentLeadStyle, setCurrentLeadStyle] = useState<HwLeadStyle>(hwLeadStyle);

  const handleStyleSelect = (style: HwLeadStyle) => {
    setCurrentLeadStyle(style);
    if (onLeadStyleChange) {
      onLeadStyleChange(style);
    }
  };

  // 4.1 SOP 倒计时 / 节点剩余天数状态 (默认 14 天激活临界模式)
  const [remainingDays, setRemainingDays] = useState<number>(14);

  const resetWeights = () => {
    setWeights({
      T: 25,
      S: 25,
      C: 15,
      Q: 20,
      L: 15,
    });
  };

  const totalWeight = weights.T + weights.S + weights.C + weights.Q + weights.L;
  const isCriticalCrunchMode = remainingDays <= 21;

  // 判断方案是否涉及硬件改版打板 (PCB Re-spin)
  const isReSpinOption = (opt: CandidateAction) => {
    const text = `${opt.name} ${opt.description} ${opt.timeCost} ${opt.sideEffects}`.toLowerCase();
    return (
      text.includes('改版') ||
      text.includes('打板') ||
      text.includes('开模') ||
      text.includes('re-spin') ||
      text.includes('respin') ||
      text.includes('重新布线')
    );
  };

  // 4.1 非线性时间衰减惩罚函数
  const getEffectiveScheduleScore = (opt: CandidateAction) => {
    const rawS = opt.scores.S;
    if (!isReSpinOption(opt) || !isCriticalCrunchMode) {
      return rawS;
    }
    // S_effective = S * Math.max(0.2, remaining_days / 21)
    const decayFactor = Math.max(0.2, remainingDays / 21);
    return Number((rawS * decayFactor).toFixed(1));
  };

  // P1-2: 获取考虑历史复发次数非线性惩罚后的有效 Q 分
  const getEffectiveQScore = (opt: CandidateAction) => {
    return applyRecurrencePenaltyToQ(opt.scores.Q, recurrenceCount).effectiveQ;
  };

  // 计算综合基准得分 (带时间衰减惩罚与历史复发质量衰减)
  const computeBaseScore = (opt: CandidateAction) => {
    if (opt.veto.rejection_veto) return 0;
    const { T, C, L } = opt.scores;
    const effectiveS = getEffectiveScheduleScore(opt);
    const effectiveQ = getEffectiveQScore(opt);
    const factor = totalWeight > 0 ? totalWeight : 100;
    const weighted =
      (T * weights.T + effectiveS * weights.S + C * weights.C + effectiveQ * weights.Q + L * weights.L) /
      factor;
    return Number(weighted.toFixed(1));
  };

  // 综合得分: Score_final = Score_base * M_lead (包含动态生态漂移判断)
  const computeFinalScore = (opt: CandidateAction) => {
    if (opt.veto.rejection_veto) return 0;
    const base = computeBaseScore(opt);
    const leadEval = evaluateLeadershipFit(opt, currentLeadStyle, recurrenceCount);
    return Number((base * leadEval.multiplier).toFixed(1));
  };

  // 依据最终得分重新排序
  const sortedActions = [...result.candidateActions].sort((a, b) => {
    if (a.veto.rejection_veto && !b.veto.rejection_veto) return 1;
    if (!a.veto.rejection_veto && b.veto.rejection_veto) return -1;
    return computeFinalScore(b) - computeFinalScore(a);
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & 节点倒计时衰减控制器 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-400" />
              C-T-S-Q-L 决策驾驶舱与非线性时间惩罚
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              综合平衡技术可行性 (T)、进度风险 (S)、BOM 与验证成本 (C)、质量与可靠性 (Q)、责任闭环与工程留痕 (L)。
            </p>
          </div>
          <button
            onClick={onGoToRecommendation}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center cursor-pointer shadow-sm self-start sm:self-auto"
          >
            查看最终工程实施方案与 RACI
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>

        {/* 4.2 直属领导处理风格注入控制卡 (M_lead Multiplier) */}
        <div className="mb-4 bg-slate-850 border border-slate-700/80 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  直属领导态度倾向注入引擎 (M_lead 加权乘数与领导通关指数)
                </span>
                <span className="text-[11px] text-slate-400">
                  真实职场中，方案能否推行取决于直属领导能否签字。此处切换领导风格可实时联动综合得分与通关指数。
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 self-start sm:self-auto">
              当前加权模型: {currentLeadStyle === 'CONSERVATIVE' ? '技术求稳 (严禁低裕量)' : currentLeadStyle === 'AGILE_DELIVERY' ? '敏捷交付 (抗拒改版)' : '流程免责 (外部会签)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* 1. 技术求稳型 */}
            <button
              type="button"
              onClick={() => handleStyleSelect('CONSERVATIVE')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between ${
                currentLeadStyle === 'CONSERVATIVE'
                  ? 'bg-blue-950/50 border-blue-500 text-white ring-1 ring-blue-500/50'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  🛡️ 技术求稳型 (Quality First)
                </span>
                {currentLeadStyle === 'CONSERVATIVE' && (
                  <span className="text-[10px] text-blue-400 font-bold">● 已激活</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                极度在乎裕量与部门声誉。宁可让项目稍微推迟 2 周，也绝不接受降额贴线或带病特采。
              </p>
              <div className="mt-2 pt-1.5 border-t border-slate-700/40 text-[10px] text-blue-300">
                <span>乘数: 彻底根治方案 ×1.15 | 带病特采 ×0.7</span>
              </div>
            </button>

            {/* 2. 敏捷交付型 */}
            <button
              type="button"
              onClick={() => handleStyleSelect('AGILE_DELIVERY')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between ${
                currentLeadStyle === 'AGILE_DELIVERY'
                  ? 'bg-emerald-950/50 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center text-xs">
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  🚀 敏捷交付型 (Delivery First)
                </span>
                {currentLeadStyle === 'AGILE_DELIVERY' && (
                  <span className="text-[10px] text-emerald-400 font-bold">● 已激活</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                以保交付为第一要务。只要台架测过，优先在内部用软件或原位贴片消化，极力抗拒改版。
              </p>
              <div className="mt-2 pt-1.5 border-t border-slate-700/40 text-[10px] text-emerald-300">
                <span>乘数: 原位吸收/软件 ×1.2 | PCB 改版 ×0.65</span>
              </div>
            </button>

            {/* 3. 流程免责型 */}
            <button
              type="button"
              onClick={() => handleStyleSelect('PROCESS_DEFENSIVE')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between ${
                currentLeadStyle === 'PROCESS_DEFENSIVE'
                  ? 'bg-amber-950/50 border-amber-500 text-white ring-1 ring-amber-500/50'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center text-xs">
                  <Scale className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  ⚖️ 流程免责型 (Boundary First)
                </span>
                {currentLeadStyle === 'PROCESS_DEFENSIVE' && (
                  <span className="text-[10px] text-amber-400 font-bold">● 已激活</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                极度注重权责划分。外部诱因坚决踢球发起外部 ECR 要资源，绝不让硬件单方面背锅。
              </p>
              <div className="mt-2 pt-1.5 border-t border-slate-700/40 text-[10px] text-amber-300">
                <span>乘数: 外部会签/ECR ×1.25 | 硬件单方背锅 ×0.5</span>
              </div>
            </button>
          </div>
        </div>

        {/* 4.1 SOP 倒计时临界模式动态指示卡 */}
        <div className="mb-4 bg-slate-850 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                项目节点/SOP 倒计时时间衰减因子 (Time Decay Penalty)
              </span>
              <span className="text-[11px] text-slate-400">
                离 SOP 还有 300 天时改版是好方案；离节点只有 15 天时，提改版就是找死。
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-xs text-slate-300">距离节点剩余:</span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min="1"
                max="180"
                value={remainingDays}
                onChange={(e) => setRemainingDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center rounded px-2 py-1 text-xs"
              />
              <span className="text-xs text-slate-400 font-mono">天 (Days)</span>
            </div>
          </div>
        </div>

        {isCriticalCrunchMode && (
          <div className="mb-4 p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-center space-x-2 text-xs text-amber-300 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>⚠️ 临界封板节点模式 (Critical Crunch Mode 激活)：</strong>
              当前距离节点剩余 <strong>{remainingDays} 天 (≤ 21天)</strong>。
              改版打样代价已处于<strong>非线性高危区</strong>，所有标记为【PCB 改版打板 / Re-spin】方案的 S (进度得分) 强制乘上衰减系数
              [{(Math.max(0.2, remainingDays / 21) * 100).toFixed(0)}%]。
            </span>
          </div>
        )}

        {/* Dynamic Weight Sliders */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">
                权重灵敏度微调 (Interactive Sensitivity Adjuster)
              </span>
              <span className="text-[11px] text-slate-400">总权重: {totalWeight}%</span>
            </div>
            <button
              onClick={resetWeights}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-blue-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>恢复标准权重 (25/25/15/20/15)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
            {/* T */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">T: 技术可行性</span>
                <span className="text-blue-400 font-bold font-mono">{weights.T}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.T}
                onChange={(e) => setWeights({ ...weights, T: parseInt(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">电路机理/裕量/复杂度</span>
            </div>

            {/* S */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">S: 进度风险</span>
                <span className="text-emerald-400 font-bold font-mono">{weights.S}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.S}
                onChange={(e) => setWeights({ ...weights, S: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">改版打样/试验周期</span>
            </div>

            {/* C */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">C: 成本与物料</span>
                <span className="text-yellow-400 font-bold font-mono">{weights.C}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.C}
                onChange={(e) => setWeights({ ...weights, C: parseInt(e.target.value) })}
                className="w-full accent-yellow-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">单板BOM/模具/机时费</span>
            </div>

            {/* Q */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">Q: 质量与可靠性</span>
                <span className="text-purple-400 font-bold font-mono">{weights.Q}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.Q}
                onChange={(e) => setWeights({ ...weights, Q: parseInt(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">降额/AEC-Q/DFMEA</span>
            </div>

            {/* L */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">L: 责任与留痕</span>
                <span className="text-indigo-400 font-bold font-mono">{weights.L}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={weights.L}
                onChange={(e) => setWeights({ ...weights, L: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">特批让步/客户认可/留痕</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. C-T-S-Q-L Score Table & Ranking */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center">
          <BarChart2 className="w-4 h-4 mr-2 text-blue-400" />
          多方案综合打分与排名矩阵 (动态时间衰减实时联动)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">排名</th>
                <th className="p-3">方案代码 / 类别</th>
                <th className="p-3">方案名称与领导通关指数</th>
                <th className="p-3 text-center">T ({weights.T}%)</th>
                <th className="p-3 text-center">S ({weights.S}%)</th>
                <th className="p-3 text-center">C ({weights.C}%)</th>
                <th className="p-3 text-center">Q ({weights.Q}%)</th>
                <th className="p-3 text-center">L ({weights.L}%)</th>
                <th className="p-3 text-center">综合基准得分</th>
                <th className="p-3 text-center">
                  <div className="flex flex-col items-center">
                    <span>最终加权得分</span>
                    <span className="text-[9px] text-amber-300 font-mono">(× M_lead)</span>
                  </div>
                </th>
                <th className="p-3 text-center">领导通关率</th>
                <th className="p-3 text-center">推荐状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {sortedActions.map((opt, rank) => {
                const isVetoed = opt.veto.rejection_veto;
                const baseScore = computeBaseScore(opt);
                const finalScore = computeFinalScore(opt);
                const isTop = rank === 0 && !isVetoed;
                const hasReSpin = isReSpinOption(opt);
                const effectiveS = getEffectiveScheduleScore(opt);
                const effectiveQ = getEffectiveQScore(opt);
                const leadEval = evaluateLeadershipFit(opt, currentLeadStyle, recurrenceCount);

                return (
                  <tr
                    key={opt.id}
                    className={`hover:bg-slate-850/60 transition ${
                      isTop ? 'bg-blue-950/20' : isVetoed ? 'bg-red-950/20 text-slate-400' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold">
                      {isVetoed ? (
                        <span className="text-red-400">VETO</span>
                      ) : (
                        <span className={isTop ? 'text-blue-400 text-sm' : 'text-slate-400'}>
                          #{rank + 1}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      <span className="font-bold text-slate-200 mr-2">{opt.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {opt.categoryLabel}
                      </span>
                    </td>
                    <td className="p-3 font-medium max-w-sm text-slate-200" title={opt.name}>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-white">{opt.name}</span>
                          {hasReSpin && isCriticalCrunchMode && (
                            <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-700 text-[9px] shrink-0">
                              Re-spin 衰减
                            </span>
                          )}
                        </div>

                        {/* 领导态度标签与预警 */}
                        {leadEval.warningTag && (
                          <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded px-1.5 py-0.5 leading-tight">
                            {leadEval.warningTag}
                          </div>
                        )}
                        {leadEval.positiveTag && (
                          <div className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded px-1.5 py-0.5 leading-tight">
                            {leadEval.positiveTag}
                          </div>
                        )}
                        {leadEval.driftPrompt && (
                          <div className="text-[10px] text-purple-300 bg-purple-950/50 border border-purple-800/60 rounded px-1.5 py-0.5 leading-tight flex items-center space-x-1">
                            <span>🔄 {leadEval.driftPrompt}</span>
                          </div>
                        )}

                        {/* 涉及行业标准依据 */}
                        {opt.referenced_standards && opt.referenced_standards.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {opt.referenced_standards.map((std, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800/80 border border-slate-700 text-slate-400"
                              >
                                {std}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono">{opt.scores.T}</td>
                    <td className="p-3 text-center font-mono">
                      {hasReSpin && isCriticalCrunchMode ? (
                        <span className="text-red-400 font-bold" title={`原始得分: ${opt.scores.S}，衰减为: ${effectiveS}`}>
                          {effectiveS} <span className="text-[10px] line-through text-slate-500">{opt.scores.S}</span>
                        </span>
                      ) : (
                        opt.scores.S
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">{opt.scores.C}</td>
                    <td className="p-3 text-center font-mono">
                      {recurrenceCount > 0 && effectiveQ !== opt.scores.Q ? (
                        <span className="text-amber-400 font-bold" title={`历史复发 ${recurrenceCount} 次非线性加速惩罚：原始 Q=${opt.scores.Q} -> 有效 Q=${effectiveQ}`}>
                          {effectiveQ} <span className="text-[10px] line-through text-slate-500">{opt.scores.Q}</span>
                        </span>
                      ) : (
                        opt.scores.Q
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">{opt.scores.L}</td>
                    
                    {/* 基准得分 */}
                    <td className="p-3 text-center font-mono text-slate-400">
                      {isVetoed ? '0.0' : baseScore}
                    </td>

                    {/* 最终得分 (带 M_lead 乘数) */}
                    <td className="p-3 text-center font-mono">
                      {isVetoed ? (
                        <span className="text-red-400 font-bold">0.0 (一票否决)</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-bold ${isTop ? 'text-blue-400' : 'text-slate-100'}`}>
                            {finalScore}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (×{leadEval.multiplier})
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 领导通关指数 Badge */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                          leadEval.acceptanceRatePercent >= 80
                            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                            : leadEval.acceptanceRatePercent >= 50
                            ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                            : 'bg-red-950/70 border-red-500/60 text-red-300'
                        }`}>
                          {leadEval.acceptanceRatePercent}%
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {leadEval.acceptanceRatePercent >= 80 ? '高通关率' : leadEval.acceptanceRatePercent >= 50 ? '需拉扯辩护' : '初审极危'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      {isVetoed ? (
                        <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-500/50 text-[10px] font-bold">
                          一票否决
                        </span>
                      ) : isTop ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                          综合首选
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                          备选考量
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* VETO Inspector Card */}
        <div className="mt-6 border border-red-500/30 bg-red-950/15 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-wide mb-2">
            <AlertOctagon className="w-4 h-4" />
            <span>VETO 规则审查 (一票否决审计机制)</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            若某一方案触犯工程红线（如：Pin-to-Pin ≠ Spec-to-Spec 盲目放行、无依据假设屏蔽外壳必降 20dB、混淆 WCCA 极端值与 RSS 统计、突破降额或硅片结温绝对极限），即使其进度或成本得分极高，也触发一票否决，坚决不得作为最终推荐措施。
          </p>

          <div className="space-y-2 text-xs">
            {result.candidateActions
              .filter((a) => a.veto.rejection_veto)
              .map((vetoed) => (
                <div key={vetoed.id} className="bg-red-900/20 border border-red-800/40 rounded p-2.5 text-slate-300 space-y-1.5">
                  <div>
                    <span className="font-bold text-red-300 mr-2">[{vetoed.id}] {vetoed.name}:</span>
                    <span className="text-red-200">{vetoed.veto.veto_reason}</span>
                  </div>
                  {vetoed.customerVetoViolations && vetoed.customerVetoViolations.length > 0 && (
                    <div className="bg-red-950/80 border border-red-700/60 rounded px-2.5 py-1.5 text-[11px] text-red-300 space-y-1">
                      <div className="font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>触犯客户特殊协议 (CSA) 条款：</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-red-200 text-[10px]">
                        {vetoed.customerVetoViolations.map((csaViol, cIdx) => (
                          <li key={cIdx}>{csaViol}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
