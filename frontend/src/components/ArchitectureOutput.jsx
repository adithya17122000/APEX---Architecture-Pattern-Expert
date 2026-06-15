import { useState } from 'react';
import SectionNav from './SectionNav';
import MarkdownRenderer from './MarkdownRenderer';

export default function ArchitectureOutput({ result, streamContent, isStreaming }) {
  const [activeSection, setActiveSection] = useState('full');

  // During streaming, show the stream content
  if (isStreaming) {
    return (
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-800">
            Generating Architecture...
          </h2>
        </div>
        <div className={isStreaming ? 'streaming-cursor' : ''}>
          <MarkdownRenderer content={streamContent} isStreaming={true} />
        </div>
      </div>
    );
  }

  // After completion, show parsed sections
  if (!result) return null;

  const availableSections = [];
  if (result.problem_analysis) availableSections.push('problem_analysis');
  if (result.high_level_design) availableSections.push('high_level_design');
  if (result.low_level_design) availableSections.push('low_level_design');
  if (result.cost_estimation) availableSections.push('cost_estimation');

  const getContent = () => {
    switch (activeSection) {
      case 'problem_analysis': return result.problem_analysis;
      case 'high_level_design': return result.high_level_design;
      case 'low_level_design': return result.low_level_design;
      case 'cost_estimation': return result.cost_estimation;
      default: return result.full_output;
    }
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Architecture Design
        </h2>
        <button
          onClick={() => {
            navigator.clipboard.writeText(result.full_output);
          }}
          className="btn-secondary text-sm flex items-center gap-1.5"
        >
          <ClipboardIcon />
          Copy Markdown
        </button>
      </div>

      <SectionNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        availableSections={availableSections}
      />

      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <MarkdownRenderer content={getContent()} />
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      />
    </svg>
  );
}
