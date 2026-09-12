import React, { useState, useEffect } from 'react';
import { ProjectContext, IssueInput, CopilotAnalysisResult, AppTheme, ModelApiConfig } from './types';
import { PRESET_SCENARIOS } from './data/presetScenarios';
import { runExpertAnalysis } from './data/expertEngine';
import { exportBackupJson, importBackupJson, exportMarkdownReport } from './utils/backupRestore';
import { Navbar } from './components/Navbar';
import { ProjectContextView } from './components/ProjectContextView';
import { AnalysisFactView } from './components/AnalysisFactView';
import { OptionsComparisonView } from './components/OptionsComparisonView';
import { DecisionCockpitView } from './components/DecisionCockpitView';
import { RecommendationRaciView } from './components/RecommendationRaciView';
import { EngineeringDocsView } from './components/EngineeringDocsView';
import { EngineeringCalculatorView } from './components/EngineeringCalculatorView';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_MODEL_CONFIG: ModelApiConfig = {
  provider: 'builtin',
  baseUrl: '',
  apiKey: '',
  model: '车规确定性专家引擎 (纯离线)',
  temperature: 0.2,
  enabled: false,
};

export default function App() {
  const [currentScenarioId, setCurrentScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [context, setContext] = useState<ProjectContext>(PRESET_SCENARIOS[0].context);
  const [issue, setIssue] = useState<IssueInput>(PRESET_SCENARIOS[0].issue);
  const [result, setResult] = useState<CopilotAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('facts');
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Theme management with localStorage persistence
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('ecu_copilot_theme');
      if (saved === 'light' || saved === 'eyecare' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ecu_copilot_theme', newTheme);
    } catch {}
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Model API configuration with localStorage persistence
  const [modelConfig, setModelConfigState] = useState<ModelApiConfig>(() => {
    try {
      const saved = localStorage.getItem('ecu_copilot_model_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved model config', e);
    }
    return DEFAULT_MODEL_CONFIG;
  });

  const handleSaveModelConfig = (newConfig: ModelApiConfig) => {
    setModelConfigState(newConfig);
    try {
      localStorage.setItem('ecu_copilot_model_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to persist model config', e);
    }
  };

  // Load initial analysis on mount
  useEffect(() => {
    runAnalysis(PRESET_SCENARIOS[0].context, PRESET_SCENARIOS[0].issue);
  }, []);

  const handleSelectScenario = (scenarioId: string) => {
    setCurrentScenarioId(scenarioId);
    const found = PRESET_SCENARIOS.find((sc) => sc.id === scenarioId);
    if (found) {
      setContext(found.context);
      setIssue(found.issue);
      runAnalysis(found.context, found.issue);
    }
  };

  const runAnalysis = async (ctx = context, iss = issue) => {
    setIsAnalyzing(true);
    try {
      // First try real backend endpoint with configured model (DeepSeek/Qwen/Zhipu/Moonshot/Gemini) + Calculation logic
      const response = await fetch('/api/copilot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: ctx, issue: iss, modelConfig }),
      });

      if (response.ok) {
        const data = await response.json();
        const finalResult = data.result || data.data;
        if (finalResult) {
          setResult(finalResult);
          setIsAnalyzing(false);
          return;
        }
      }

      // If backend offline or missing API key, fallback instantly to deterministic expert engine
      const localResult = runExpertAnalysis(ctx, iss);
      setResult(localResult);
    } catch (err) {
      console.warn('API route fallback to expert engine:', err);
      const localResult = runExpertAnalysis(ctx, iss);
      setResult(localResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentScenarioId={currentScenarioId}
        onSelectScenario={handleSelectScenario}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={() => runAnalysis(context, issue)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        modelConfig={modelConfig}
        onOpenModelSettings={() => setIsModelModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'input' && (
          <ProjectContextView
            context={context}
            setContext={setContext}
            issue={issue}
            setIssue={setIssue}
            onAnalyze={() => {
              runAnalysis(context, issue);
              setActiveTab('facts');
            }}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'facts' && (
          <AnalysisFactView
            result={result}
            onGoToOptions={() => setActiveTab('options')}
          />
        )}

        {activeTab === 'options' && (
          <OptionsComparisonView
            result={result}
            onGoToCockpit={() => setActiveTab('cockpit')}
          />
        )}

        {activeTab === 'cockpit' && (
          <DecisionCockpitView
            result={result}
            onGoToRecommendation={() => setActiveTab('recommendation')}
            hwLeadStyle={context.hwLeadStyle || 'AGILE_DELIVERY'}
            onLeadStyleChange={(style) => setContext({ ...context, hwLeadStyle: style })}
            recurrenceCount={context.recurrenceCount || 0}
          />
        )}

        {activeTab === 'recommendation' && (
          <RecommendationRaciView
            result={result}
            onGoToDocs={() => setActiveTab('docs')}
          />
        )}

        {activeTab === 'docs' && (
          <EngineeringDocsView result={result} />
        )}

        {activeTab === 'calc' && (
          <EngineeringCalculatorView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ECU Hardware Risk & Decision Copilot · 车载电子硬件技术决策系统</span>
          <span>ISO 26262 · IATF 16949 · AEC-Q · CISPR 25 · C-T-S-Q-L Engine</span>
        </div>
      </footer>

      {/* Model API Settings Modal */}
      <ModelSettingsModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        config={modelConfig}
        onSaveConfig={handleSaveModelConfig}
      />
    </div>
  );
}
