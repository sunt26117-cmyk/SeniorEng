import React, { useState } from 'react';
import { CopilotAnalysisResult, RaciItem } from '../types';
import {
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Clock,
  Users,
  Flame,
  FileCheck,
  Slash,
  ShieldX,
  CornerDownRight,
  ShieldCheck,
  Lock,
  UserCheck,
  Zap,
  Scale,
  BrainCircuit,
  Eye,
  Briefcase,
  Code2,
  Cpu,
  Target,
} from 'lucide-react';

interface RecommendationRaciViewProps {
  result: CopilotAnalysisResult | null;
  onGoToDocs: () => void;
}

export const RecommendationRaciView: React.FC<RecommendationRaciViewProps> = ({
  result,
  onGoToDocs,
}) => {
  if (!result) return null;

  const { finalRecommendation, raciMatrix, containment, capa, riskRatings } = result;

  // 判定所选方案是否涉及降额违规、临界或高风险
  const isSafetyOrDeratingCritical =
    riskRatings.overallRisk === 'High' ||
    riskRatings.functionalSafetyRisk === 'High' ||
    riskRatings.reliabilityRisk === 'High' ||
    finalRecommendation.whyReason.some(
      (r) => r.includes('降额') || r.includes('安全') || r.includes('特批') || r.includes('临界')
    ) ||
    finalRecommendation.recommendedOptionName.includes('特采') ||
    finalRecommendation.recommendedOptionName.includes('让步');

  // 4.2 PSCR (产品安全代表) 专项行处理
  const hasExistingPscr = raciMatrix.some(
    (r) => r.role === 'PSCR' || r.role.includes('产品安全')
  );

  const enhancedRaciMatrix: RaciItem[] = [...raciMatrix];

  if (!hasExistingPscr) {
    enhancedRaciMatrix.push({
      role: 'PSCR (产品安全代表)',
      raciType: isSafetyOrDeratingCritical ? 'A' : 'C',
      owner: 'PSCR 独立代表',
      action: isSafetyOrDeratingCritical
        ? '【门禁卡点】全流程独立评估设计降额击穿与功能安全风险，签署出库门禁。'
        : '参与安全与法规符合性评审，审核安全机制与产品符合性。',
      output: '《产品安全性独立评估意见书》',
      dueDate: '出厂前 48h',
      decisionGate: '样件出库 / SOP 质量放行门禁 (Mandatory Gate)',
    });
  } else if (isSafetyOrDeratingCritical) {
    // 强制将现有 PSCR 标为 A (Accountable)
    enhancedRaciMatrix.forEach((item) => {
      if (item.role === 'PSCR' || item.role.includes('产品安全')) {
        item.raciType = 'A';
        item.action =
          '【门禁卡点】全流程独立评估设计降额击穿与功能安全风险，签署出库门禁。';
        item.output = '《产品安全性独立评估意见书》';
      }
    });
  }

  const getRaciBadge = (type: string) => {
    switch (type) {
      case 'R':
        return 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold';
      case 'A':
        return 'bg-purple-600/30 text-purple-300 border-purple-500/50 font-bold';
      case 'C':
        return 'bg-amber-600/30 text-amber-300 border-amber-500/50 font-medium';
      case 'I':
        return 'bg-slate-700 text-slate-300 border-slate-600 font-normal';
      case 'Approval':
        return 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Final Recommendation Hero Header */}
      <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white tracking-wide uppercase">
                Final Recommended Decision
              </span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">
                [Grade: {finalRecommendation.recommendationGrade}]
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {finalRecommendation.recommendedOptionName}
            </h2>
          </div>

          <button
            onClick={onGoToDocs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center cursor-pointer shadow-sm self-start sm:self-auto"
          >
            生成全套工程留痕文档 (邮件/特批/纪要)
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>

        {/* 4.2 PSCR 门禁卡点注入警示框 */}
        {isSafetyOrDeratingCritical && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-red-500/60 rounded-xl flex items-start space-x-3 text-xs text-red-200">
            <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-red-300 block text-sm">
                [PSCR 门禁卡点激活]：依据车规功能安全与降额违约准则，PSCR 已升级为 A (Accountable)
              </span>
              <p className="leading-relaxed text-[11px] text-red-200">
                <strong>【一票否决卡点】：</strong> 在当前工程样件出厂前，必须取得 PSCR (产品安全与符合性代表) 签发的
                <span className="underline font-bold text-white ml-1 mr-1">《产品安全性独立评估意见书》</span>
                ，否则仓库严禁调拨放行，工厂制造产线严禁出库！
              </p>
            </div>
          </div>
        )}

        {/* Why this measure has lowest overall risk */}
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700/60 mb-6">
          <span className="text-xs font-semibold text-blue-300 block mb-2 uppercase tracking-wide">
            核心推荐依据 (Why Reason: 为什么该方案整体风险最小):
          </span>
          <ul className="space-y-2 text-xs text-slate-200">
            {finalRecommendation.whyReason.map((reason, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Immediate Steps */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            现在立刻做什么 (Immediate Action Roadmap - 明确责任人与截止时间)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {finalRecommendation.immediateSteps.map((step) => (
              <div
                key={step.step}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3.5 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-blue-400 font-mono">
                      Step {step.step}: {step.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] border border-slate-700">
                      {step.deadline}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px] mb-2">{step.action}</p>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/50 pt-2 flex justify-between">
                  <span>执行负责人:</span>
                  <span className="text-slate-200 font-semibold">{step.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boundary Rules: Unacceptable Actions & Stop Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Unacceptable Actions */}
          <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-1.5 text-red-400 font-bold uppercase tracking-wide mb-2">
              <ShieldX className="w-4 h-4" />
              <span>暂时不要做 / 不可接受的做法</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              {finalRecommendation.unacceptableActions.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-red-400 font-bold mr-1.5 shrink-0">✕</span>
                  <span className="text-[11px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stop Conditions */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase tracking-wide mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>停止条件 (Stop Conditions)</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              {finalRecommendation.stopConditions.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-amber-400 font-bold mr-1.5 shrink-0">■</span>
                  <span className="text-[11px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plan B & Triggers */}
          <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-1.5 text-blue-400 font-bold uppercase tracking-wide mb-2">
              <CornerDownRight className="w-4 h-4" />
              <span>备选退路 (Plan B)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mb-3">
              {finalRecommendation.planB}
            </p>
            <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400">
              <span className="font-semibold text-slate-300">重评触发器：</span>
              {finalRecommendation.reEvaluationTriggers.join('；')}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 核心人员心理透视与行为预判卡片 (Stakeholder Mindsets & Action Prediction) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <BrainCircuit className="w-4 h-4 mr-2 text-indigo-400" />
              汽车开发链条核心角色心理透视与博弈应对矩阵 (Stakeholder Mindset & Counter-Strategy)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              直面“想解决问题，但绝不想多干活、绝不替别人担责”的职场真实生态，精准预判各角色行动并提前构筑防御。
            </p>
          </div>
          <span className="text-[11px] font-mono text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 self-start sm:self-auto">
            4方博弈防御机制已就绪
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* 1. 硬件负责人 / 直属领导 */}
          <div className="bg-slate-850/80 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-xs">硬件负责人 / 直属主管 (HW Lead)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  审批签字人 (A)
                </span>
              </div>

              <div className="space-y-2 mt-2">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-blue-400 font-semibold block text-[11px] mb-0.5">🔍 真实关注点：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    别把事情搞大到大老板那里；量产后别在我管辖模块爆雷；绝对别让团队再通宵盲目改版擦屁股。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">⚠️ 最怕的事情 (隐秘担忧)：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    同意了让步特采，结果后续 DV/客户路试复现甚至烧管，在管理层复盘会上被公开点名处刑。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-rose-400 font-semibold block text-[11px] mb-0.5">🎯 下一步大概率动作预测：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    把方案打回，要求硬件工程师“再多做几组极限环境摸底”、“找原厂FAE出保证函”，以此拖延并转嫁签字责任。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 bg-blue-950/20 -mx-4 -mb-4 p-3 rounded-b-xl">
              <span className="text-[11px] font-bold text-blue-300 flex items-center mb-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                系统提供的【攻心/过关应对策略】：
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                递交由专业计算引擎生成的<strong>确定性机理闭环报告与原厂公函留痕</strong>。明确告知：“这是当前满足 SOP 且经数学推导唯一能过审计的方案，免责链条已做实”，彻底卸下其个人签字心理包袱。
              </p>
            </div>
          </div>

          {/* 2. 项目经理 (PM) */}
          <div className="bg-slate-850/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">项目经理 (Project Manager - PM)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  进度控制人 (A/C)
                </span>
              </div>

              <div className="space-y-2 mt-2">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-emerald-400 font-semibold block text-[11px] mb-0.5">🔍 真实关注点：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    关键里程碑（如 DV 送检、装车节点）绝对不能挂红灯；项目台账里决不能出现不可控延期。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">⚠️ 最怕的事情 (隐秘担忧)：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    硬件人员轻描淡写一句“我们要重新改版投板，要推迟4周”，导致向高层/车厂汇报时节点全盘崩溃。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-rose-400 font-semibold block text-[11px] mb-0.5">🎯 下一步大概率动作预测：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    疯狂催促“能不能先发临时版本让客户先跑起来”、“能不能只飞线跳过测试”。极力施压硬件吞下延期。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 bg-emerald-950/20 -mx-4 -mb-4 p-3 rounded-b-xl">
              <span className="text-[11px] font-bold text-emerald-300 flex items-center mb-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                系统提供的【攻心/过关应对策略】：
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                绝不只给单一延期方案。直接提供<strong>“双轨推进机制 (Track A/B) + 零工期原位补丁”</strong>，用现成可抄送的决策邮件模板把球踢向各方联合确认，让 PM 获得对上汇报的安全抓手。
              </p>
            </div>
          </div>

          {/* 3. 软件负责人 (SW Lead) */}
          <div className="bg-slate-850/80 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-xs">底层软件 / 控制算法负责人 (SW Lead)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  协同执行人 (R)
                </span>
              </div>

              <div className="space-y-2 mt-2">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-purple-400 font-semibold block text-[11px] mb-0.5">🔍 真实关注点：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    别动我的核心控制环路；别让我改已经冻结的底层驱动和寄存器配置；别增加 CPU 负载。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">⚠️ 最怕的事情 (隐秘担忧)：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    硬件搞不定噪声或泵升，就甩锅要求软件“加算法滤波”、“改死区配置”、“做下桥制动”，结果软件引入新 Bug 替硬件背锅。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-rose-400 font-semibold block text-[11px] mb-0.5">🎯 下一步大概率动作预测：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    以“当前处于发版代码冻结期”、“增加PWM中断会导致ASIL D超频跑飞”为由，直接在需求评审会上无情驳回。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 bg-purple-950/20 -mx-4 -mb-4 p-3 rounded-b-xl">
              <span className="text-[11px] font-bold text-purple-300 flex items-center mb-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                系统提供的【攻心/过关应对策略】：
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                硬件<strong>自行消化吸收（原位并阻容/换高耐压管/贴磁珠）</strong>。若确需软件配合，仅需一次性修改标定参数（如寄存器下发 2 字节），且硬件提前给出详细台架测试与安全边界实测数据，绝不碰核心算法架构。
              </p>
            </div>
          </div>

          {/* 4. 系统 / 整车匹配负责人 (System Lead) */}
          <div className="bg-slate-850/80 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">系统与整车匹配负责人 (System Lead)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  联合会签人 (C/A)
                </span>
              </div>

              <div className="space-y-2 mt-2">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">🔍 真实关注点：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    整车功能别降级；别因为 ECU 内部问题修改整车线束定义或整车通讯协议。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-amber-400 font-semibold block text-[11px] mb-0.5">⚠️ 最怕的事情 (隐秘担忧)：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    车厂客户在整车联调中发现功能故障，向上汇报导致系统工程团队被牵连问责。
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-rose-400 font-semibold block text-[11px] mb-0.5">🎯 下一步大概率动作预测：</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    强调“原系统规范就是这么定义的”，拒绝任何放宽或特批，要求 ECU 硬件在控制器内部独立达标。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 bg-amber-950/20 -mx-4 -mb-4 p-3 rounded-b-xl">
              <span className="text-[11px] font-bold text-amber-300 flex items-center mb-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                系统提供的【攻心/过关应对策略】：
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                用严密测试事实（如金属外壳屏蔽衰减、寄生线束电感解耦分析）证明问题边界。若线束引发超标，以<strong>详实数据提交整车线束改善建议（外部ECR）</strong>，权责分明，促成跨专业协同联合签字。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RACI Matrix (含 PSCR 独立卡点行) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-400" />
              RACI 跨专业职责与决策门禁矩阵 (含 PSCR 产品安全代表卡点)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              R (执行负责人) · A (最终追责与审批人) · C (咨询顾问) · I (抄送知情) · PSCR (产品安全与符合性独立代表)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">专业角色</th>
                <th className="p-3 text-center">RACI 类型</th>
                <th className="p-3">具体负责人员</th>
                <th className="p-3">关键行动职责 (Action)</th>
                <th className="p-3">输出交付物 (Deliverable)</th>
                <th className="p-3 text-center">截止日期</th>
                <th className="p-3">关联决策门禁</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {enhancedRaciMatrix.map((item, idx) => {
                const isPscrRow = item.role.includes('PSCR') || item.role.includes('产品安全');
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-850/60 transition ${
                      isPscrRow && isSafetyOrDeratingCritical ? 'bg-red-950/25 border-l-2 border-l-red-500' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-200">
                      <div className="flex items-center space-x-1.5">
                        <span>{item.role}</span>
                        {isPscrRow && isSafetyOrDeratingCritical && (
                          <span className="px-1.5 py-0.2 rounded bg-red-900 text-red-200 text-[9px] font-bold">
                            门禁卡点
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] border ${getRaciBadge(item.raciType)}`}>
                        {item.raciType}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-300">{item.owner}</td>
                    <td className="p-3 max-w-sm text-slate-300 leading-normal">{item.action}</td>
                    <td className="p-3 font-mono text-slate-300">{item.output}</td>
                    <td className="p-3 text-center font-mono text-amber-300">{item.dueDate}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{item.decisionGate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Containment & CAPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Containment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" />
            短期围堵措施 (Containment Plan)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-850/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-medium">应急围堵方案：</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{containment.shortTermMeasure}</p>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400">
              <span>适用受控范围:</span>
              <span className="text-slate-200 font-medium">{containment.validityScope}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400">
              <span>执行责任方:</span>
              <span className="text-slate-200 font-medium">{containment.responsibleParty}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400">
              <span>生效时限:</span>
              <span className="text-amber-300 font-mono font-medium">{containment.timeline}</span>
            </div>
          </div>
        </div>

        {/* CAPA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center">
            <FileCheck className="w-4 h-4 mr-2" />
            长效纠正与预防 (CAPA & Lessons Learned)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-850/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-medium">根因长效纠正措施：</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{capa.rootCauseAction}</p>
            </div>
            <div className="bg-slate-850/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-medium">规范更新与预防防错：</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{capa.preventiveMeasure}</p>
            </div>
            <div className="bg-slate-850/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-medium">经验教训总结 (Lessons Learned)：</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{capa.lessonsLearned}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
