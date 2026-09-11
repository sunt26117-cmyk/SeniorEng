import React from 'react';
import { CopilotAnalysisResult } from '../types';
import { CheckCircle2, HelpCircle, AlertTriangle, ShieldCheck, Flame, Cpu, Compass, Activity, ArrowRight } from 'lucide-react';

interface AnalysisFactViewProps {
  result: CopilotAnalysisResult | null;
  onGoToOptions: () => void;
}

export const AnalysisFactView: React.FC<AnalysisFactViewProps> = ({ result, onGoToOptions }) => {
  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        <Cpu className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium">尚未执行风险与决策分析</p>
        <p className="text-xs text-slate-500 mt-1">请在第一步确认项目与工程问题，点击顶部的“执行风险与决策分析”</p>
      </div>
    );
  }

  const { coreConclusion, knownFacts, assumptions, unknowns, physicalMechanism, dfmeaView, riskRatings } = result;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Medium-High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'High':
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Core Conclusion Hero Card (固定结构 1: 核心结论) */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 max-w-4xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white tracking-wide uppercase">
                Core Conclusion (核心结论)
              </span>
              <span className="text-xs text-slate-400">严守汽车硬件工程决策铁律 · 拒绝模棱两可</span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-start">
                <Compass className="w-5 h-5 mr-2 text-blue-400 shrink-0 mt-0.5" />
                推荐措施：{coreConclusion.recommendedMeasure}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                <span className="font-semibold text-blue-300">核心理由：</span>
                {coreConclusion.reasonSummary}
              </p>
            </div>

            <div className="text-xs text-slate-400">
              <span className="text-slate-500">工程问题简述：</span>
              {coreConclusion.problemSummary}
            </div>
          </div>

          {/* Quick Risk Score Card */}
          <div className="shrink-0 bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-center min-w-[170px] shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">综合风险指数</span>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">
              {riskRatings.overallRiskScore}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-semibold border ${getRiskBadgeColor(riskRatings.overallRisk)}`}>
              {riskRatings.overallRisk} Risk
            </span>
            <div className="mt-3 text-[11px] text-slate-400 text-left border-t border-slate-800 pt-2 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>技术风险:</span>
                <span className="text-slate-200">{riskRatings.technicalRisk}</span>
              </div>
              <div className="flex justify-between">
                <span>进度风险:</span>
                <span className="text-slate-200">{riskRatings.scheduleRisk}</span>
              </div>
              <div className="flex justify-between">
                <span>质量安全:</span>
                <span className="text-slate-200">{riskRatings.qualityRisk}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fact Classification: Known Facts vs Assumptions vs Unknowns (原则 2: 严格区分已知事实、假设与未知) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-blue-400" />
              事实边界审查 (原则 2：严格区分已知事实、工程假设、逻辑推论与未知信息)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              严禁把推论当事实，严禁隐瞒未知信息；缺乏数据时明确提示不可盲目决断。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Known Facts */}
          <div className="bg-slate-850 border border-emerald-500/30 rounded-lg p-4 bg-emerald-950/10">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wide mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>已知技术事实 (Known Facts)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {knownFacts.map((fact, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-emerald-400 mr-2 shrink-0 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Assumptions & Inferences */}
          <div className="bg-slate-850 border border-blue-500/30 rounded-lg p-4 bg-blue-950/10">
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wide mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>合理工程假设与推论 (Assumptions)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {assumptions.map((assump, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-400 mr-2 shrink-0 font-bold">•</span>
                  <span>{assump}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Unknowns & Missing Data */}
          <div className="bg-slate-850 border border-amber-500/30 rounded-lg p-4 bg-amber-950/10">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wide mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>未知与待补全信息 (Unknowns)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {unknowns.map((unk, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-amber-400 mr-2 shrink-0 font-bold">•</span>
                  <span>{unk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Physical Mechanism & Root Cause (固定结构 2: 失效机理与物理根因) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center">
          <Flame className="w-4 h-4 mr-2 text-orange-400" />
          物理本质与失效机理 (Physical Mechanism Analysis)
        </h3>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4 mb-4">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide block mb-1">
            底层物理与电路机理深剖 (Root Cause Physics):
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            {physicalMechanism.rootCauseAnalysis}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {physicalMechanism.keyPhysicalFactors.map((item, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 text-xs">
              <span className="font-semibold text-blue-300 block mb-1">{item.factor}</span>
              <p className="text-slate-400 leading-normal text-[11px]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DFMEA Table View (DFMEA 视角失效链条与严重度) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-emerald-400" />
            DFMEA 失效链条分析 (Failure Chain & Impact)
          </h3>
          <span className="text-xs text-slate-400">IATF 16949 / ISO 26262 严谨工程留痕</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">失效模式 (Failure Mode)</th>
                <th className="p-3">直接起因 (Failure Cause)</th>
                <th className="p-3">局部影响 (Local Effect)</th>
                <th className="p-3">系统影响 (System Effect)</th>
                <th className="p-3">整车/用户影响 (Vehicle Effect)</th>
                <th className="p-3 text-center">S / O / D</th>
                <th className="p-3 text-center">合规与安全</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              <tr className="hover:bg-slate-850/50">
                <td className="p-3 font-medium text-amber-300">{dfmeaView.failureMode}</td>
                <td className="p-3 text-slate-300">{dfmeaView.failureCause}</td>
                <td className="p-3 text-slate-300">{dfmeaView.localEffect}</td>
                <td className="p-3 text-slate-300">{dfmeaView.systemEffect}</td>
                <td className="p-3 text-slate-300">{dfmeaView.vehicleEffect}</td>
                <td className="p-3 text-center font-mono">
                  <span className="px-1.5 py-0.5 bg-red-950 text-red-300 rounded border border-red-800/50 mr-1">
                    S:{dfmeaView.severity}
                  </span>
                  <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 rounded border border-amber-800/50 mr-1">
                    O:{dfmeaView.occurrence}
                  </span>
                  <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800/50">
                    D:{dfmeaView.detection}
                  </span>
                </td>
                <td className="p-3 text-center space-y-1">
                  {dfmeaView.safetyImpact && (
                    <span className="inline-block px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-semibold">
                      安全相关
                    </span>
                  )}
                  {dfmeaView.regulatoryImpact && (
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold ml-1">
                      法规认证
                    </span>
                  )}
                  {dfmeaView.massProductionImpact && (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-semibold ml-1">
                      量产门禁
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onGoToOptions}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center cursor-pointer shadow-sm"
          >
            下一步：审查候选措施与残余风险 (Step 3)
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
