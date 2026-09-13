/**
 * BLDC Problem Pattern Engine View (Section 4 & 4.1)
 * 涵盖 P001 ~ P018 全部 18 个确定性失效模式与物理链条
 * 包含 P016 (保护时序 vs SOA)、P017 (电流采样三架构对比)、P018 (四级堵转状态机)
 */

import React, { useState, useMemo } from 'react';
import {
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  evaluateAllBldcPatterns,
  BldcEvaluationInput,
} from '../data/bldcPatternEngine';
import { BldcPatternId } from '../types';

interface BldcPatternEngineViewProps {
  onGoToDecisions: () => void;
}

export const BldcPatternEngineView: React.FC<BldcPatternEngineViewProps> = ({
  onGoToDecisions,
}) => {
  // 交互式物理参数调整
  const [params, setParams] = useState<BldcEvaluationInput>({
    vbusNominal: 13.5,
    vbusMeasuredPeak: 37.8,
    vdsRating: 40.0,
    rpm: 3800,
    jInertia: 0.00015,
    cbusUf: 470,
    tAmbientC: 85,
    currentPeakA: 25,
    harnessLengthM: 1.8,
    deadTimeNs: 120,
    rgOffOhm: 4.7,
    cgdPf: 45,
    dvDtVns: 8.0,
    vthMinV: 2.0,
    keVkrpm: 4.2,
    rthJc: 1.8,
    rdsOnMilliOhm: 3.5,
  });

  const [selectedPatternId, setSelectedPatternId] = useState<BldcPatternId>('P001');
  const [filterMode, setFilterMode] = useState<'ALL' | 'TRIGGERED' | 'VETO'>('ALL');

  const patternResults = useMemo(() => {
    return evaluateAllBldcPatterns(params);
  }, [params]);

  const filteredPatterns = useMemo(() => {
    if (filterMode === 'TRIGGERED') {
      return patternResults.filter((p) => p.triggered);
    }
    if (filterMode === 'VETO') {
      return patternResults.filter((p) => p.vetoTriggered);
    }
    return patternResults;
  }, [patternResults, filterMode]);

  const activePattern = useMemo(() => {
    return patternResults.find((p) => p.id === selectedPatternId) || patternResults[0];
  }, [patternResults, selectedPatternId]);

  return (
    <div className="space-y-6">
      {/* 顶部标题与原则 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                确定性物理计算引擎
              </span>
              <span className="text-xs text-slate-400 font-mono">18 BLDC Problem Patterns</span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>BLDC 硬件问题模式引擎 (P001 ~ P018)</span>
              <span className="text-xs font-normal text-slate-400">
                — 严格物理机制推导，绝不依赖关键词匹配
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition ${
                filterMode === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              全部模式 ({patternResults.length})
            </button>
            <button
              onClick={() => setFilterMode('TRIGGERED')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition ${
                filterMode === 'TRIGGERED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              已触发风险 ({patternResults.filter((p) => p.triggered).length})
            </button>
            <button
              onClick={() => setFilterMode('VETO')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition ${
                filterMode === 'VETO'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              一票否决 VETO ({patternResults.filter((p) => p.vetoTriggered).length})
            </button>
          </div>
        </div>
      </div>

      {/* 实时参数调谐面板 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>核心电气与电机驱动变量实时调谐 (输入驱动确定性公式)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1">电机转速 RPM</label>
            <input
              type="number"
              value={params.rpm}
              onChange={(e) => setParams({ ...params, rpm: Number(e.target.value) })}
              className="w-full bg-slate-900 text-white font-mono px-2 py-1 rounded border border-slate-700"
            />
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1">标称母线电压 (V)</label>
            <input
              type="number"
              step="0.1"
              value={params.vbusNominal}
              onChange={(e) => setParams({ ...params, vbusNominal: Number(e.target.value) })}
              className="w-full bg-slate-900 text-white font-mono px-2 py-1 rounded border border-slate-700"
            />
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1">MOS 耐压 Vds_rating (V)</label>
            <input
              type="number"
              value={params.vdsRating}
              onChange={(e) => setParams({ ...params, vdsRating: Number(e.target.value) })}
              className="w-full bg-slate-900 text-white font-mono px-2 py-1 rounded border border-slate-700"
            />
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1">母线去耦 Cbus (μF)</label>
            <input
              type="number"
              value={params.cbusUf}
              onChange={(e) => setParams({ ...params, cbusUf: Number(e.target.value) })}
              className="w-full bg-slate-900 text-white font-mono px-2 py-1 rounded border border-slate-700"
            />
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1">开关节点 dv/dt (V/ns)</label>
            <input
              type="number"
              step="0.5"
              value={params.dvDtVns}
              onChange={(e) => setParams({ ...params, dvDtVns: Number(e.target.value) })}
              className="w-full bg-slate-900 text-white font-mono px-2 py-1 rounded border border-slate-700"
            />
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1">死区时间 DeadTime (ns)</label>
            <input
              type="number"
              value={params.deadTimeNs}
              onChange={(e) => setParams({ ...params, deadTimeNs: Number(e.target.value) })}
              className="w-full bg-slate-900 text-white font-mono px-2 py-1 rounded border border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* 主布局：左侧模式列表 + 右侧详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧列表 (5列) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-semibold text-slate-400 mb-2 px-1">
            模式清单 (点击查看物理公式与对策)
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatterns.map((pattern) => {
              const isSelected = pattern.id === selectedPatternId;
              return (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPatternId(pattern.id)}
                  className={`w-full p-3 rounded-lg border text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{pattern.id}</span>
                      <span className="text-xs font-medium">{pattern.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {pattern.corePhysicalChain}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {pattern.vetoTriggered ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                        VETO
                      </span>
                    ) : pattern.triggered ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        TRIGGERED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                        SAFE
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">
                      {pattern.evidenceType}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧详情 (7列) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          {/* 模式标题区 */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded font-mono font-bold text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {activePattern.id}
                </span>
                <h2 className="text-base font-bold text-white">{activePattern.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  证据: {activePattern.evidenceType}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  置信度: {activePattern.confidence}
                </span>
              </div>
            </div>

            {/* VETO 警戒条 */}
            {activePattern.vetoTriggered && (
              <div className="bg-red-950/60 border border-red-500/60 rounded-lg p-3 text-xs text-red-200 flex items-start gap-2.5 mt-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-300 font-semibold">触发一票否决 (CRITICAL VETO)：</strong>
                  <span className="mt-0.5 block">{activePattern.vetoReason}</span>
                </div>
              </div>
            )}
          </div>

          {/* 核心物理链条 */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>核心物理链条 (Physical Mechanism Chain)</span>
            </h3>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
              {activePattern.corePhysicalChain}
            </div>
          </div>

          {/* 物理计算输出表格 (严禁交由 LLM 直接给出，由确定性引擎计算) */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>确定性物理计算输出 (Deterministic Engine Computed)</span>
            </h3>
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(activePattern.calculatedValues).map(([key, value], idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-800/80 ${idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'}`}
                    >
                      <td className="px-3 py-2 text-slate-400 font-medium">{key}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-cyan-300">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 典型候选对策与副作用矩阵 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 推荐候选对策
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {activePattern.candidateMeasures.map((m, i) => (
                  <li key={i} className="leading-snug">{m}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> 潜在副作用 (Side Effects)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {activePattern.sideEffects.map((s, i) => (
                  <li key={i} className="leading-snug">{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 验证项与 Unknown 转入 Test */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                闭环验证项与未知盲区 (Unknown → Test)
              </span>
              <span className="text-[10px] text-slate-500">严禁将模型估算作为实测依据</span>
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              {activePattern.verificationItems.map((v, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-mono">▸</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 底部导航 */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-slate-500">
              P001 ~ P018 物理引擎已实时与统一工程输入模型联锁
            </span>
            <button
              onClick={onGoToDecisions}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>进入方案权衡与决策驾驶舱</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
