import React from 'react';
import { ProjectContext, IssueInput, IssueCategory, ProjectPhase, AsilLevel, HwLeadStyle } from '../types';
import {
  Layers,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  Tag,
  UserCheck,
  ShieldAlert,
  Zap,
  Scale,
  FolderPlus,
} from 'lucide-react';

interface ProjectContextViewProps {
  context: ProjectContext;
  setContext: React.Dispatch<React.SetStateAction<ProjectContext>>;
  issue: IssueInput;
  setIssue: React.Dispatch<React.SetStateAction<IssueInput>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  currentScenarioTitle?: string;
  isCustomScenario?: boolean;
  onOpenScenarioManage?: () => void;
}

const ALL_CATEGORIES: IssueCategory[] = [
  'Component Alternative',
  'WCCA',
  'EMC',
  'Thermal',
  'Power',
  'BLDC Motor Drive',
  'Signal Integrity',
  'Reliability',
  'Functional Safety',
  'Customer Requirement',
  'DFM',
  'Production',
  'Cost Reduction',
  'Schedule Conflict',
  'Test Failure',
  'Design Deviation',
  'Other',
];

const PHASES: ProjectPhase[] = [
  'Concept',
  'A Sample',
  'B Sample',
  'C Sample',
  'DV',
  'PV',
  'SOP',
  'Post-SOP',
];

const ASIL_LEVELS: AsilLevel[] = ['QM', 'ASIL A', 'ASIL B', 'ASIL C', 'ASIL D'];

export const ProjectContextView: React.FC<ProjectContextViewProps> = ({
  context,
  setContext,
  issue,
  setIssue,
  onAnalyze,
  isAnalyzing,
  currentScenarioTitle,
  isCustomScenario,
  onOpenScenarioManage,
}) => {
  const toggleCategory = (cat: IssueCategory) => {
    if (issue.issueCategories.includes(cat)) {
      if (issue.issueCategories.length > 1) {
        setIssue({
          ...issue,
          issueCategories: issue.issueCategories.filter((c) => c !== cat),
        });
      }
    } else {
      setIssue({
        ...issue,
        issueCategories: [...issue.issueCategories, cat],
      });
    }
  };

  const handleSimulateUpload = (fileName: string, type: string) => {
    const newAttach = {
      id: Math.random().toString(36).substring(2, 9),
      name: fileName,
      type,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    };
    setIssue({
      ...issue,
      attachments: [...(issue.attachments || []), newAttach],
    });
  };

  const removeAttachment = (id: string) => {
    setIssue({
      ...issue,
      attachments: (issue.attachments || []).filter((a) => a.id !== id),
    });
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-400" />
                ECU 硬件项目背景与技术问题输入
              </h2>
              {currentScenarioTitle && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                  isCustomScenario
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                }`}>
                  <span>工况:</span>
                  <span className="font-semibold">{currentScenarioTitle}</span>
                  {isCustomScenario && <span className="text-[10px] bg-emerald-500/20 px-1 rounded">自定义</span>}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              提供明确的技术事实与工程数据（如超标 dB、温升 ℃、裕量 mV、WCCA 公差），支持自由修改、新建空白工况或另存为自定义工况。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {onOpenScenarioManage && (
              <button
                type="button"
                id="context-scenario-manage-btn"
                onClick={onOpenScenarioManage}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="新建空白工况或将当前编辑内容另存为新工况"
              >
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <span>新建 / 另存为工况</span>
              </button>
            )}
            <button
              id="start-evaluate-action-btn"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-medium text-xs sm:text-sm transition flex items-center shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? '正在运行深度工程推理...' : '开始风险评估与决策推荐 →'}
            </button>
          </div>
        </div>
      </div>

      {/* Part 1: Project Background */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-400" />
          Step 1: 项目上下文与工程约束
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Project Name */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">项目名称 (Project Name)</label>
            <input
              type="text"
              value={context.projectName}
              onChange={(e) => setContext({ ...context, projectName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">产品类型 (Product Type)</label>
            <input
              type="text"
              value={context.productType}
              onChange={(e) => setContext({ ...context, productType: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ECU Architecture */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">ECU 架构 (ECU Architecture)</label>
            <input
              type="text"
              value={context.ecuType}
              onChange={(e) => setContext({ ...context, ecuType: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">主机厂/客户 (Customer)</label>
            <input
              type="text"
              value={context.customer}
              onChange={(e) => setContext({ ...context, customer: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Project Phase */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">当前阶段 (Project Phase)</label>
            <select
              value={context.projectPhase}
              onChange={(e) => setContext({ ...context, projectPhase: e.target.value as ProjectPhase })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* ASIL Level */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">安全等级 (ISO 26262 ASIL)</label>
            <select
              value={context.asilLevel}
              onChange={(e) => setContext({ ...context, asilLevel: e.target.value as AsilLevel })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {ASIL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Next Milestone & Days */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">下一关键节点 (Milestone)</label>
            <input
              type="text"
              value={context.nextMilestone}
              onChange={(e) => setContext({ ...context, nextMilestone: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Days remaining */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
              <span>距离关键节点 (天)</span>
              <span className="text-amber-400 font-mono font-bold">{context.daysRemaining} Days</span>
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={context.daysRemaining}
              onChange={(e) => setContext({ ...context, daysRemaining: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Cost Constraint */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">成本约束 (BOM Constraint)</label>
            <input
              type="text"
              value={context.costConstraint}
              onChange={(e) => setContext({ ...context, costConstraint: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* SOP Target */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">量产节点 (SOP Date)</label>
            <input
              type="text"
              value={context.sopDate}
              onChange={(e) => setContext({ ...context, sopDate: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Sample Status */}
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">当前样件与治具状态 (Sample Status)</label>
            <input
              type="text"
              value={context.sampleStatus}
              onChange={(e) => setContext({ ...context, sampleStatus: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="例如：B样件，3D打印塑料临时夹具，未安装量产压铸铝外壳"
            />
          </div>
        </div>

        {/* 客户特殊技术/商务协议 (Customer Special Agreements - CSA / 硬约束否决线) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="text-slate-300 font-semibold flex items-center text-xs">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-400" />
              客户特殊协议与不可妥协约束 (Customer Special Agreements / Hard Veto Gates)
            </label>
            <span className="text-[11px] text-slate-400">
              触发条款时将在 CTSQL 评估中激活【一票否决 (Veto)】与违约警报
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2">
            {(context.customerSpecialAgreements || []).map((csa) => (
              <div
                key={csa.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{csa.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-semibold">
                      强制否决红线
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200">{csa.parameter}</div>
                </div>
                <div className="mt-2 text-[11px] text-amber-400 font-mono font-medium bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                  指标门限: {csa.requiredValue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 关键决策维度：直属领导处理风格与态度倾向 (Leadership Profile) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="text-slate-300 font-semibold flex items-center text-xs">
              <UserCheck className="w-4 h-4 mr-1.5 text-amber-400" />
              直属领导处理风格与态度倾向 (Leadership Profile - 方案接纳度加权注入)
            </label>
            <span className="text-[11px] text-slate-400">
              各角色心理透视引擎将依据领导风格自动计算【领导通关指数】
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. 技术求稳型 */}
            <div
              onClick={() => setContext({ ...context, hwLeadStyle: 'CONSERVATIVE' })}
              className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                (context.hwLeadStyle || 'CONSERVATIVE') === 'CONSERVATIVE'
                  ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <ShieldAlert className={`w-4 h-4 ${
                  (context.hwLeadStyle || 'CONSERVATIVE') === 'CONSERVATIVE' ? 'text-blue-400' : 'text-slate-500'
                }`} />
                <span className="font-bold text-xs">🛡️ 技术求稳型 (Quality First)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                宁可项目稍微推迟 2 周，绝不接受降额不足或带病特采。看重物理机理彻底根治与部门威信，严防量产爆雷。
              </p>
              <div className="mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-blue-300 flex justify-between">
                <span>偏好: 原位高规格/彻底根治</span>
                <span>排斥: 降额贴线/特采硬上</span>
              </div>
            </div>

            {/* 2. 敏捷交付型 */}
            <div
              onClick={() => setContext({ ...context, hwLeadStyle: 'AGILE_DELIVERY' })}
              className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                context.hwLeadStyle === 'AGILE_DELIVERY'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <Zap className={`w-4 h-4 ${
                  context.hwLeadStyle === 'AGILE_DELIVERY' ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <span className="font-bold text-xs">🚀 敏捷交付型 (Delivery First)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                以保住 DV/PV 节点为第一要务。只要台架测过、不起火烧管，优先在内部用软件或原位贴片消化，极度抗拒重新改版。
              </p>
              <div className="mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-emerald-300 flex justify-between">
                <span>偏好: Tier 0 软件/原位吸收</span>
                <span>排斥: 重新投板/挤占人力</span>
              </div>
            </div>

            {/* 3. 流程免责型 */}
            <div
              onClick={() => setContext({ ...context, hwLeadStyle: 'PROCESS_DEFENSIVE' })}
              className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                context.hwLeadStyle === 'PROCESS_DEFENSIVE'
                  ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <Scale className={`w-4 h-4 ${
                  context.hwLeadStyle === 'PROCESS_DEFENSIVE' ? 'text-amber-400' : 'text-slate-500'
                }`} />
                <span className="font-bold text-xs">⚖️ 流程免责型 (Boundary First)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                极度注重权责划分。外部线束或客户工况引起的超标坚决踢球发起外部 ECR，绝不让硬件单方面签字背连带责任。
              </p>
              <div className="mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-amber-300 flex justify-between">
                <span>偏好: 跨部门会签/ECR留痕</span>
                <span>排斥: 硬件单方默默背锅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Issue Categorization & Technical Facts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center">
          <Tag className="w-4 h-4 mr-2 text-blue-400" />
          Step 2: 问题分类 (多选)
        </h3>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = issue.issueCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border border-blue-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-blue-400" />
          Step 3: 提取真实技术事实与工程数据
        </h3>

        <div className="space-y-4 text-xs">
          {/* Requirement vs Actual measurement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                标准与设计要求 (Requirement / Spec)
              </label>
              <textarea
                rows={3}
                value={issue.requirement}
                onChange={(e) => setIssue({ ...issue, requirement: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:border-blue-500 focus:outline-none"
                placeholder="例如：CISPR 25 Class 5 RE 限值 <= 28 dBuV/m；或 WCCA 误差 <= ±1.0%"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                实际测量数据与偏差 (Actual Measurement & Deviation)
              </label>
              <textarea
                rows={3}
                value={issue.actualMeasurement}
                onChange={(e) => setIssue({ ...issue, actualMeasurement: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:border-blue-500 focus:outline-none"
                placeholder="例如：150MHz 实测 31 dBuV/m 超标 +3.0dB；或温升实测 +14℃ 裕量仅 3℃"
              />
            </div>
          </div>

          {/* Test condition & Environment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                测试条件与负载 (Test Condition / Load)
              </label>
              <input
                type="text"
                value={issue.testCondition}
                onChange={(e) => setIssue({ ...issue, testCondition: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="例如：13.5V 输入，5V/10A 满载，20kHz PWM 驱动"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                测试环境 (Environment)
              </label>
              <input
                type="text"
                value={issue.environment}
                onChange={(e) => setIssue({ ...issue, environment: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="例如：半电波暗室 25℃，或 85℃ 密闭温箱自然对流"
              />
            </div>
          </div>

          {/* Failure Phenomenon */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              底层失效现象与特征 (Failure Phenomenon)
            </label>
            <input
              type="text"
              value={issue.failurePhenomenon}
              onChange={(e) => setIssue({ ...issue, failurePhenomenon: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="例如：150MHz 谐波与 Gate Driver DC/DC 频点一致；或高温下 MOSFET Rds(on) 翻倍"
            />
          </div>

          {/* Engineering Concern */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              工程决策困境与冲突 (Engineering Concern & Trade-off)
            </label>
            <textarea
              rows={3}
              value={issue.engineeringConcern}
              onChange={(e) => setIssue({ ...issue, engineeringConcern: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:border-blue-500 focus:outline-none"
              placeholder="例如：距离 DV 仅剩 2 周无法重新改版，但直接用正式金属外壳测试又有失败风险；或器件升级 +$1.50 超出预算"
            />
          </div>

          {/* 历史复发次数与质量惩罚机制 (Recurrence Count & Non-linear Q-penalty) */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-lg p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-slate-300 font-semibold flex items-center text-xs">
                <AlertCircle className="w-4 h-4 mr-1.5 text-amber-400" />
                该失效模式历史复发次数 (Historical Recurrence Count)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">质量 Q 分非线性惩罚:</span>
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  (issue.recurrenceCount || 0) === 0
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : (issue.recurrenceCount || 0) === 1
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                    : 'bg-red-950/80 text-red-400 border border-red-800/60'
                }`}>
                  {(issue.recurrenceCount || 0) === 0 ? '1.0x (首发无罚)' : (issue.recurrenceCount || 0) === 1 ? '0.85x (-15%)' : (issue.recurrenceCount || 0) === 2 ? '0.65x (-35%)' : '0.40x (-60% 严重降级)'}
                </span>
                {(issue.recurrenceCount || 0) >= 2 && (
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800 font-semibold">
                    触发生态漂移: 流程免责型
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={issue.recurrenceCount || 0}
                onChange={(e) => setIssue({ ...issue, recurrenceCount: parseInt(e.target.value) || 0 })}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-700 min-w-[50px] text-center">
                {issue.recurrenceCount || 0} 次
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              当该类质量缺陷在量产前多次重复发生 (&ge; 2 次)，质量惩罚呈非线性急剧加深，直属领导将启动“避险防御”自动向【流程免责型 (PROCESS_DEFENSIVE)】漂移，倒逼工程团队彻底根治。
            </p>
          </div>

          {/* Attachments / Data Files Upload */}
          <div className="pt-2">
            <label className="block text-slate-400 mb-1.5 font-medium">
              测试波形、频谱、数据表格与规范附件 (Attachments / Spectrum / Excel)
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 bg-slate-800/40 text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-300 font-medium text-xs">
                支持上传 EMC 频谱图 (.png/.jpg)、示波器波形 (.csv)、WCCA 误差明细 (.xlsx)、测试报告 (.pdf)
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleSimulateUpload('CISPR25_RE_150MHz_Spectrum.png', 'image/png')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition cursor-pointer"
                >
                  + 添加 EMC 频谱测试曲线
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateUpload('MOSFET_SOA_Curve_Comparison.csv', 'text/csv')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition cursor-pointer"
                >
                  + 添加 MOSFET SOA 曲线数据
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateUpload('WCCA_Error_Budget_MonteCarlo.xlsx', 'application/vnd.ms-excel')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition cursor-pointer"
                >
                  + 添加 WCCA 蒙特卡洛预算表
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateUpload('BLDC_Phase_Switching_Ring_Scope.csv', 'text/csv')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition cursor-pointer"
                >
                  + 添加 BLDC 相线振铃示波器波形
                </button>
              </div>
            </div>

            {/* Uploaded files list */}
            {issue.attachments && issue.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {issue.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md text-xs text-slate-300"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>{att.name}</span>
                    <span className="text-slate-500 text-[10px]">({att.size})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
