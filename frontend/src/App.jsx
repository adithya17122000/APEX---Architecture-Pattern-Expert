import { useState, useCallback, useEffect } from 'react';
import RequirementInput from './components/RequirementInput';
import ArchitectureOutput from './components/ArchitectureOutput';
import ToolPanel from './components/ToolPanel';
import ProviderSelector from './components/ProviderSelector';
import {
  generateArchitectureStream,
  reviewArchitectureStream,
  generateTerraformStream,
  generateADRStream,
  compareCostsStream,
  fetchProviders,
} from './services/api';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('generate'); // generate | review | terraform | adr | cost-compare
  const [aiProvider, setAiProvider] = useState(null);
  const [providers, setProviders] = useState([]);
  const [toolOutput, setToolOutput] = useState('');
  const [toolStreaming, setToolStreaming] = useState(false);

  useEffect(() => {
    fetchProviders()
      .then((data) => {
        setProviders(data.providers);
        setAiProvider(data.default);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = useCallback(async (document, scale) => {
    setIsLoading(true);
    setIsStreaming(true);
    setStreamContent('');
    setResult(null);
    setError(null);
    setActiveTab('generate');

    let fullContent = '';

    await generateArchitectureStream(
      document,
      scale,
      aiProvider,
      (chunk) => {
        fullContent += chunk;
        setStreamContent(fullContent);
      },
      () => {
        setIsStreaming(false);
        setIsLoading(false);
        setResult({
          full_output: fullContent,
          ...parseSections(fullContent),
        });
      },
      (err) => {
        setIsStreaming(false);
        setIsLoading(false);
        setError(err.message);
      }
    );
  }, [aiProvider]);

  const handleToolAction = useCallback(async (action) => {
    if (!result?.full_output) return;

    setToolStreaming(true);
    setToolOutput('');
    setActiveTab(action);

    let fullContent = '';
    const onChunk = (chunk) => {
      fullContent += chunk;
      setToolOutput(fullContent);
    };
    const onDone = () => setToolStreaming(false);
    const onError = (err) => {
      setToolStreaming(false);
      setError(err.message);
    };

    switch (action) {
      case 'review':
        await reviewArchitectureStream(
          result.full_output,
          ['security', 'scalability', 'cost', 'reliability', 'performance'],
          aiProvider,
          onChunk, onDone, onError
        );
        break;
      case 'terraform':
        await generateTerraformStream(
          result.full_output,
          'aws',
          aiProvider,
          onChunk, onDone, onError
        );
        break;
      case 'adr':
        await generateADRStream(
          result.full_output,
          aiProvider,
          onChunk, onDone, onError
        );
        break;
      case 'cost-compare':
        await compareCostsStream(
          result.full_output,
          ['aws', 'gcp', 'azure'],
          aiProvider,
          onChunk, onDone, onError
        );
        break;
    }
  }, [result, aiProvider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">APEX</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Architecture Pattern EXpert</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProviderSelector
                providers={providers}
                selected={aiProvider}
                onChange={setAiProvider}
              />
              <span className="text-sm text-gray-400">v2.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <RequirementInput onSubmit={handleGenerate} isLoading={isLoading} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">Error</p>
            </div>
            <p className="mt-1 text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Tool Actions Bar (visible after generation) */}
        {result && !isStreaming && (
          <ToolPanel
            activeTab={activeTab}
            onAction={handleToolAction}
            isLoading={toolStreaming}
          />
        )}

        {/* Output Section */}
        {activeTab === 'generate' ? (
          <ArchitectureOutput
            result={result}
            streamContent={streamContent}
            isStreaming={isStreaming}
          />
        ) : (
          <ArchitectureOutput
            result={toolOutput ? { full_output: toolOutput } : null}
            streamContent={toolOutput}
            isStreaming={toolStreaming}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            APEX generates architectural designs using AI. Always review and validate the output.
          </p>
        </div>
      </footer>
    </div>
  );
}

function parseSections(markdown) {
  const sections = {};
  const sectionMarkers = [
    { pattern: /#{1,3}\s*1[\.\)]\s*Problem Analysis/i, key: 'problem_analysis' },
    { pattern: /#{1,3}\s*2[\.\)]\s*High-Level Design/i, key: 'high_level_design' },
    { pattern: /#{1,3}\s*3[\.\)]\s*Low-Level Design/i, key: 'low_level_design' },
    { pattern: /#{1,3}\s*4[\.\)]\s*(AWS )?Cost Estimation/i, key: 'cost_estimation' },
  ];

  const lines = markdown.split('\n');
  const sectionStarts = [];

  lines.forEach((line, index) => {
    for (const { pattern, key } of sectionMarkers) {
      if (pattern.test(line)) {
        sectionStarts.push({ index, key });
        break;
      }
    }
  });

  sectionStarts.forEach((start, i) => {
    const endIndex = i + 1 < sectionStarts.length
      ? sectionStarts[i + 1].index
      : lines.length;
    sections[start.key] = lines.slice(start.index, endIndex).join('\n').trim();
  });

  return sections;
}
