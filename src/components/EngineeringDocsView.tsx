import React, { useState, useEffect } from 'react';
import { CopilotAnalysisResult } from '../types';
import {
  FileText,
  Copy,
  Check,
  Download,
  Mail,
  AlertTriangle,
  Users,
  FileCheck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Hash,
  Clock,
  Printer,
  FileWarning,
  ExternalLink,
} from 'lucide-react';
import {
  generateDigitalFingerprint,
  DigitalFingerprintResult,
} from '../utils/cryptoTraceability';

interface EngineeringDocsViewProps {
  result: CopilotAnalysisResult | null;
}

export const EngineeringDocsView: React.FC<EngineeringDocsViewProps> = ({ result }) => {
  if (!result) return null;

  const { engineeringDocs, finalRecommendation, raciMatrix } = result;

  const [activeDoc, setActiveDoc] = useState<
    'email' | 'internal_permit' | 'customer_concession' | 'minutes' | 'risk' | 'dfmea' | 'ecr'
  >('email');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<DigitalFingerprintResult | null>(null);

  // 3.3 计算数字防伪指纹 (SHA-256)
  useEffect(() => {
    async function computeHash() {
      const owners = raciMatrix.map((r) => `${r.role}:${r.owner}(${r.raciType})`);
      const fp = await generateDigitalFingerprint({
        projectName: 'ECU 硬件决策系统',
        projectPhase: 'DV阶段',
        asilLevel: 'ASIL B/D',
        ecuType: '车身与底盘域控',
        timestampIso: new Date().toISOString(),
        finalRecommendedOption: finalRecommendation.recommendedOptionName,
        recommendationGrade: finalRecommendation.recommendationGrade,
        raciSignOffs: owners,
        keyRisks: [
          result.riskRatings.overallRisk,
          `Score:${result.riskRatings.overallRiskScore}`,
        ],
      });
      setFingerprint(fp);
    }
    computeHash();
  }, [result]);

  const handleCopy = (text: string, key: string) => {
    const textWithFingerprint = fingerprint
      ? `${text}\n\n${fingerprint.tamperProofCertificate}`
      : text;
    navigator.clipboard.writeText(textWithFingerprint);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 3.2 邮件模板升级：具备法律效力的“假设性推进声明（Assumed Proceeding）”
  const generateEmailText = () => {
    const d = engineeringDocs.pmDecisionEmail;
    const now = new Date();
    const sentDateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate() - 1}日`;
    const deadlineStr = d.deadline || '发函后 24 小时内';

    return `发件人: 车载硬件研发团队 (Hardware Engineering Team)
收件人: 项目经理 (PM), 系统工程总监, 交付负责人
抄送: 质量总监 (QD), 产品安全代表 (PSCR), 采购工程 (Sourcing)
主题: 【关键路径决策锁定请示函】关于${d.subject}

尊敬的项目管理层及各专项负责人：

【1. 事实锁定与前置沟通记录 (Fact Lockdown)】
硬件团队已于 ${sentDateStr} 17:30 正式发送设计输入对齐函与测试超差备忘录。截至目前，硬件团队尚未收到来自项目管理层或客户关于设计更改的明确书面输入。
- 关键技术事实: ${d.technicalFact}
- 当前项目现状: ${d.currentSituation}

【2. 关键路径阻断与窝工损失警告 (Critical Path Warning)】
- 节点倒计时: 距离打板/试制投样冻结节点仅剩不足 24 小时。
- 窝工与违约责任: 若硬件团队在此节点停工等待，将直接导致整体 SOP 顺延，据估算将产生每日约 ¥18,000 的产线台架机时闲置与人员窝工损失，且整车联调里程碑违约金由责任方全额承担。
- 潜在工程风险: ${d.risk}

【3. 评估备选方案对比与硬件推荐基线】
- 候选方案综合权衡: ${d.options}
- 硬件团队推荐执行基线: 【${d.recommendedOption}】
- 关联资源与周期: 成本影响 [${d.costImpact}] | 进度影响 [${d.scheduleImpact}]

【4. 具有法律防御效力的“假设性推进条款” (Assumed Proceeding Clause)】
鉴于交付节点的刚性约束，硬件团队即日起将严格按推荐基线【${d.recommendedOption}】执行投样打样准备工作。
本邮件发出后 24 小时内（截止时间: ${deadlineStr}），若未收到来自项目经理或客户书面异议，将视作项目管理层正式核准按此基线投产。
后续若因输入变更或客户撤回方案产生的一切改版费、二次打样试验费及模具报废损失，将全额立项计入项目管理变更 (CR) 预算，严禁计入硬件研发设计缺陷指标！

【5. 决策签署与核准门禁】
- 决策决策人 (Decision Owner): ${d.decisionOwner}
- 决议事项: ${d.requiredDecision}
- 变更后果确认: ${d.changeConsequence}

---
硬件研发项目团队
${fingerprint ? `【存证防伪哈希】: ${fingerprint.shortFingerprint}` : ''}
`;
  };

  // 3.1 单据 1: 《内部受限工程偏差申请单 (Internal Deviation Permit)》
  const generateInternalPermitText = () => {
    const p = engineeringDocs.deviationPermit;
    const serialRange = 'SN: BCM3-B02-001 ~ SN: BCM3-B02-050 (共计50台套)';
    return `======================================================================
     【内部受限工程偏差申请单 (INTERNAL DEVIATION PERMIT)】
     遵循 IATF 16949 Section 8.7 (不合格输出控制与受限内部放行准则)
======================================================================
单据编号: IDP-${new Date().getFullYear()}-HW-084
偏差性质: 制造工厂内部试制 / 台架摸底验证受限放行 (严禁装车路试)

【1. 受影响工程样件台套数与序列号强制锁定 (Serial Range Constraint)】
- 受影响批次序列号范围: ${serialRange}
- 制造工厂/试验地点: Tier-1 制造一厂 SMT 试制线 / 硬件白盒可靠性实验室
- 使用范围红线约束: 仅限制造工厂内部试制摸底、DV 白盒测试与台架联调。严禁调拨给主机厂装车路试，严禁流入量产仓库！

【2. 原始设计标准与当前实测超差数据】
- 标准规范要求: ${p.requirement}
- 实际测量与测试结果: ${p.actualResult}
- 偏差物理表现: ${p.deviationDetail}
- 底层技术起因: ${p.technicalCause}

【3. 风险评估与应急隔离围堵方案】
- 偏差风险推演: ${p.riskAnalysis}
- 物理隔离围堵措施: ${p.containment}
- 样品物理标识: 所有受影响样件必须张贴荧光红色【INTERNAL ONLY - NOT FOR VEHICLE SALE】标签，专人加锁保管。

【4. 样品到期强制报废/销毁追溯承诺 (Mandatory Scrap Protocol)】
- 本单据有效时限: ${p.temporaryValidity} (到期自动失效，不可续期)
- 报废销毁执行人: 工厂质量经理 (Plant Quality) 与 硬件项目负责人
- 强制销毁追溯承诺: 样件到达有效期截止日后 48 小时内，由工厂质检部实施物理破坏性剪脚/破壳报废，并出具带有防篡改照片的《报废销毁见证书》，留档备查至少 15 年。

【5. 内部会签审批责任链】
- 硬件主管 (HW Lead): _____________________ (签署日期: __________)
- 工厂制造总监 (Plant Director): __________ (签署日期: __________)
- 质量保证部部长 (QA Manager): ____________ (签署日期: __________)
- 产品安全代表 (PSCR): ____________________ (签署日期: __________)
`;
  };

  // 3.1 单据 2: 《主机厂客户工程让步申请书 (OEM Customer Concession Request)》
  const generateCustomerConcessionText = () => {
    const p = engineeringDocs.deviationPermit;
    return `======================================================================
    【主机厂客户工程让步申请书 (OEM CUSTOMER CONCESSION REQUEST)】
    对标德国汽车工业协会 VDA 6.3 过程审核与 IATF 16949 / VDA ECR 规范
======================================================================
申请单号: CCR-${new Date().getFullYear()}-OEM-019
让步类别: 主机厂外部正式工程让步 (Customer Formal Concession)
对标体系: VDA 6.3 / IATF 16949 Section 8.7 / ISO 26262 Part 5

【1. 让步申请背景与关键部件信息】
- 项目代号与部件: 车身与底盘域控制器 (BCM / VCU)
- 申请供应商: Tier-1 汽车电子系统研发中心
- 关联主机厂/车型: 主机厂战略纯电平台项目组
- 让步简述: 针对 ${p.requirement} 出现 ${p.actualResult} 申请客户有条件技术让步接受。

【2. 底层失效起因深度分析 (5-Why Root Cause Analysis)】
- 1-Why: 为什么测试超差？因为测量端输出偏离标称指标 ${p.deviationDetail}。
- 2-Why: 为什么会出现该偏离？因为 ${p.technicalCause}。
- 3-Why: 为什么设计裕量未能覆盖？因为极端工况下元器件温漂、初始容差与瞬态脉冲应力发生恶劣叠加。
- 4-Why: 为什么此前仿真未能暴露？因为上一版仿真采用了稳态典型值模型，未考虑 Foster 4阶 RC 瞬态热阻网络及高温 10,000次 蒙特卡洛统计分布。
- 5-Why: 根本原因 (Root Cause): 原设计公差分配过紧且未导入车规综合 C-T-S-Q-L 权重平衡流程。

【3. 全温区工作剖面与整车功能安全风险评估 (Mission Profile Risk)】
- 工作环境剖面: -40℃ ~ +105℃ 全温区，抛负载 ISO 7637-2 Pulse 5b 与电机堵转短时峰值。
- 功能安全影响评定: ${p.riskAnalysis} (无单点失效击穿安全目标，符合 ISO 26262 ASIL 度量)。
- 整车级影响判定: 不影响整车基本行车动力及主被动安全功能，对驾乘体验影响处于可接受包络内。

【4. 长效纠正与预防措施 (CAPA Plan) 与断点切换节点 (Cut-off Point)】
- 临时围堵对策: ${p.containment}
- 长期彻底纠正措施: ${p.correctiveAction}
- 产线切点 (Cut-off Point): 自下一版 C 样 (Rev. C03) 或 SOP 生产批次 SN: 2026xxxx 起彻底切换为优化版硬件，旧版器件全数清零。
- 闭环验证与试验项: ${p.verificationPlan}

【5. 主机厂与供应商联合审批签署】
- Tier-1 研发副总裁 (VP of Engineering): __________________
- Tier-1 质量总监 (Director of Quality): __________________
- 主机厂硬件总工程师 (OEM Chief HW Engineer): ____________
- 主机厂零部件采购经理 (OEM Commodity Buyer): ____________
- 主机厂整车安全总代表 (OEM Vehicle PSCR): _______________
`;
  };

  const generateMinutesText = () => {
    const m = engineeringDocs.meetingMinutes;
    return `======================================================================
    【硬件技术对齐与决议纪要 (ENGINEERING DECISION MINUTES)】
======================================================================
会议主题: ${m.title}
参会人员: ${m.attendees}
召开时间: ${fingerprint ? fingerprint.timestampFormatted : new Date().toLocaleString()}

【1. 核心技术研讨与背景梳理】
${m.discussionSummary}

【2. 跨部门达成一致共识 (Agreements)】
${m.agreements.map((a, i) => `${i + 1}. ${a}`).join('\n')}

【3. 决议落地与行动项分配 (Action Items & RACI)】
${m.actionItems.map((ai, i) => `${i + 1}. ${ai}`).join('\n')}

【4. 会议签署确认】
记录人: 硬件架构助理工程师
核准人: 硬件开发科长 / PM
`;
  };

  const generateRiskAcceptanceText = () => {
    const r = engineeringDocs.riskAcceptance;
    return `======================================================================
    【工程风险受控接受签署单 (RESIDUAL RISK ACCEPTANCE FORM)】
======================================================================
风险追溯编号: ${r.riskId}
风险对象: ${r.description}

【1. 残余风险充分性论证 (Residual Risk Justification)】
${r.residualRiskJustification}

【2. 签署与免责授权 (Sign-Off)】
批准接受负责人: ${r.acceptingSignOff}
风险到期/退出条件: ${r.expirationCondition}
`;
  };

  const generateEcrText = () => {
    const e = engineeringDocs.ecrDescription;
    return `======================================================================
    【工程变更申请书 (ENGINEERING CHANGE REQUEST - ECR)】
======================================================================
ECR 编号: ECR-HW-${new Date().getFullYear()}-047
变更标题: ${e.ecrTitle}

【1. 变更起因与理由】: ${e.reasonForChange}
【2. 推荐工程解决措施】: ${e.proposedSolution}
【3. 模具、工装与 BOM 成本预估】: ${e.costEstimate}
【4. 开模制板交付周期 (Lead Time)】: ${e.toolingLeadTime}
【5. 整车与系统级影响评估】: ${e.impactAssessment}
`;
  };

  const docTabs = [
    {
      id: 'email',
      label: 'PM 决策请示邮件 (含假设性推进条款)',
      icon: Mail,
      desc: '锁定事实基线、警告窝工停工损失、24小时无异议默认推进条款',
    },
    {
      id: 'internal_permit',
      label: '内部受限工程偏差申请单 (Internal Deviation)',
      icon: FileWarning,
      desc: '限内部试制与台架、序列号范围锁定、到期强制物理报废销毁',
    },
    {
      id: 'customer_concession',
      label: '主机厂工程让步申请书 (OEM Concession)',
      icon: ExternalLink,
      desc: '对标 VDA 6.3 / IATF 16949、5-Why 根因剖析、全温区剖面与切点',
    },
    {
      id: 'minutes',
      label: '技术对齐与决议纪要 (Meeting Minutes)',
      icon: Users,
      desc: '各部门共同签字确认事实，避免口头扯皮',
    },
    {
      id: 'risk',
      label: '残余风险受控接受签署单 (Risk Acceptance)',
      icon: ShieldCheck,
      desc: '锁定风险接收主体与免责边界',
    },
    {
      id: 'ecr',
      label: '工程变更申请书 (ECR Form)',
      icon: FileCheck,
      desc: '规范走 ECR 流程，明确模具成本与交付周期',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 顶部数字存证防伪防篡改看板 (3.3 SHA-256 Watermark Banner) */}
      <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                IATF 16949 / ISO 26262 数字存证防伪体系
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SHA-256 Non-Repudiation Audit Chain
              </span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center mt-1">
              车规工程留痕与免责防御文档套件
            </h2>
            <p className="text-xs text-slate-400">
              严格区分【内部受限偏差】与【主机厂外部让步】，邮件模板注入具备法律效力的【假设性推进声明】，所有单据经原生 SHA-256 加盖数字防伪水印。
            </p>
          </div>

          {/* SHA-256 指纹展示徽章 */}
          {fingerprint && (
            <div className="bg-slate-950/90 border border-slate-700/80 rounded-lg p-3 text-xs font-mono shrink-0 space-y-1">
              <div className="flex items-center justify-between gap-4 text-slate-400 text-[10px]">
                <span className="flex items-center">
                  <Hash className="w-3 h-3 text-emerald-400 mr-1" />
                  存证防篡改编号:
                </span>
                <span className="text-emerald-400 font-bold">{fingerprint.shortFingerprint}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-xs">
                SHA-256: <span className="text-slate-300">{fingerprint.sha256Hex.slice(0, 24)}...</span>
              </div>
              <div className="flex items-center text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400 mr-1" />
                存证时间: {fingerprint.timestampFormatted}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 单据切换导航条 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {docTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDoc === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDoc(tab.id as any)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                <span className="text-xs font-semibold truncate">{tab.label.split(' ')[0]}</span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* 单据主体预览与导出区 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {/* 1. 邮件预览 */}
        {activeDoc === 'email' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="font-bold text-sm text-slate-100 block">
                  PM 决策请示函（含假设性推进条款）
                </span>
                <span className="text-[11px] text-slate-400">
                  用于在关键路径倒计时阶段催办 PM，24小时无书面异议自动成为法律免责盾牌
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(generateEmailText(), 'email')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer flex items-center space-x-1.5 font-medium shadow-sm"
                >
                  {copiedKey === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'email' ? '已复制邮件全文' : '复制邮件全文 (含存证指纹)'}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono leading-relaxed whitespace-pre-wrap text-slate-200 text-xs select-text">
              {generateEmailText()}
            </div>
          </div>
        )}

        {/* 2. 内部工程偏差申请单 */}
        {activeDoc === 'internal_permit' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="font-bold text-sm text-amber-400 block">
                  内部受限工程偏差申请单 (Internal Deviation Permit)
                </span>
                <span className="text-[11px] text-slate-400">
                  IATF 16949 Section 8.7 标准约束：限工厂试制与内部摸底，绑定样件序列号范围与强制到期销毁报废协议
                </span>
              </div>
              <button
                onClick={() => handleCopy(generateInternalPermitText(), 'internal_permit')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition cursor-pointer flex items-center space-x-1.5 font-medium shadow-sm"
              >
                {copiedKey === 'internal_permit' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'internal_permit' ? '已复制内部偏差单' : '复制内部偏差单'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 font-mono leading-relaxed whitespace-pre-wrap text-slate-200 text-xs select-text">
              {generateInternalPermitText()}
            </div>
          </div>
        )}

        {/* 3. 主机厂工程让步申请书 */}
        {activeDoc === 'customer_concession' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="font-bold text-sm text-blue-400 block">
                  主机厂客户工程让步申请书 (OEM Customer Concession Request)
                </span>
                <span className="text-[11px] text-slate-400">
                  对标德国 VDA 6.3 与 IATF 16949 规范：含 5-Why 根因推导、全温区工作剖面风险评估与版本断点切点 (Cut-off Point)
                </span>
              </div>
              <button
                onClick={() => handleCopy(generateCustomerConcessionText(), 'customer_concession')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer flex items-center space-x-1.5 font-medium shadow-sm"
              >
                {copiedKey === 'customer_concession' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'customer_concession' ? '已复制客户让步单' : '复制客户让步申请书'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 font-mono leading-relaxed whitespace-pre-wrap text-slate-200 text-xs select-text">
              {generateCustomerConcessionText()}
            </div>
          </div>
        )}

        {/* 4. 会议纪要 */}
        {activeDoc === 'minutes' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="font-bold text-sm text-slate-100 block">
                  技术对齐与决议纪要 (Meeting Minutes)
                </span>
                <span className="text-[11px] text-slate-400">
                  锁定各部门讨论共识与交付项，杜绝口头协议造成的设计倒退
                </span>
              </div>
              <button
                onClick={() => handleCopy(generateMinutesText(), 'minutes')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer flex items-center space-x-1.5 font-medium shadow-sm"
              >
                {copiedKey === 'minutes' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'minutes' ? '已复制会议纪要' : '复制会议纪要'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono leading-relaxed whitespace-pre-wrap text-slate-200 text-xs select-text">
              {generateMinutesText()}
            </div>
          </div>
        )}

        {/* 5. 风险接受 */}
        {activeDoc === 'risk' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="font-bold text-sm text-white block">
                  残余风险受控接受签署单 (Residual Risk Acceptance)
                </span>
                <span className="text-[11px] text-slate-400">
                  落实风险归口主体，明确责任终止条件与退出机制
                </span>
              </div>
              <button
                onClick={() => handleCopy(generateRiskAcceptanceText(), 'risk')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer flex items-center space-x-1.5 font-medium shadow-sm"
              >
                {copiedKey === 'risk' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'risk' ? '已复制风险单' : '复制风险接受单'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono leading-relaxed whitespace-pre-wrap text-slate-200 text-xs select-text">
              {generateRiskAcceptanceText()}
            </div>
          </div>
        )}

        {/* 6. ECR 表单 */}
        {activeDoc === 'ecr' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="font-bold text-sm text-white block">
                  工程变更申请书 (ECR Form)
                </span>
                <span className="text-[11px] text-slate-400">
                  启动正式硬件打样与开模变更流程，明确费用与交付周期
                </span>
              </div>
              <button
                onClick={() => handleCopy(generateEcrText(), 'ecr')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer flex items-center space-x-1.5 font-medium shadow-sm"
              >
                {copiedKey === 'ecr' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ecr' ? '已复制 ECR' : '复制 ECR 申请书'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono leading-relaxed whitespace-pre-wrap text-slate-200 text-xs select-text">
              {generateEcrText()}
            </div>
          </div>
        )}

        {/* 底部带水印防伪存证印章区 */}
        {fingerprint && (
          <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-950/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>车规级存证证据链生效中：</strong> 本单据已与当前测量、机理推导及 RACI 责任人进行不可逆哈希锁定。
              </span>
            </div>
            <div className="font-mono text-emerald-400 font-semibold shrink-0">
              {fingerprint.shortFingerprint}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
