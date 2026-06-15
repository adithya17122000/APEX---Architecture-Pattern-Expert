import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: true, htmlLabels: true },
  sequence: { useMaxWidth: true },
  er: { useMaxWidth: true },
});

let mermaidCounter = 0;

/**
 * Aggressively sanitize and fix LLM-generated Mermaid code.
 */
function sanitizeMermaidCode(code) {
  let sanitized = code
    // Unicode replacements
    .replace(/[\u2014\u2015]/g, '--')
    .replace(/[\u2013\u2012]/g, '-')
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2011/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00D7]/g, 'x')
    // Fix common LLM mistakes
    .replace(/```mermaid/g, '')   // Remove nested code fence if LLM includes it
    .replace(/```/g, '')          // Remove closing fence
    .trim();

  // Fix: Labels with special chars that aren't quoted
  // e.g. `A -->|some label| B` is valid, but `A --> B[Label (with parens)]` needs quoting
  sanitized = sanitized.replace(
    /\[([^\]]*[<>{}()&][^\]]*)\]/g,
    (match, label) => `["${label.replace(/"/g, "'")}"]`
  );

  // Fix: subgraph labels with special chars
  sanitized = sanitized.replace(
    /subgraph\s+([^\n[]+[<>()&][^\n]*)/g,
    (match, label) => `subgraph ${label.trim().replace(/[<>()&]/g, '_')}`
  );

  return sanitized;
}

/**
 * Try multiple variations to get mermaid to render.
 */
async function tryRender(code) {
  const id = `mermaid-${++mermaidCounter}`;

  // Attempt 1: Direct render
  try {
    const result = await mermaid.render(id, code);
    return result.svg;
  } catch (e) {
    cleanupOrphan(id);
  }

  // Attempt 2: Wrap all node labels in quotes
  const quotedCode = code.replace(
    /(\w+)\[([^\]]+)\]/g,
    (_, node, label) => `${node}["${label.replace(/"/g, "'")}"]`
  );
  const id2 = `mermaid-${++mermaidCounter}`;
  try {
    const result = await mermaid.render(id2, quotedCode);
    return result.svg;
  } catch (e) {
    cleanupOrphan(id2);
  }

  // Attempt 3: Simplify - strip subgraphs and try as flat graph
  const flatCode = code
    .replace(/subgraph[^\n]*/g, '')
    .replace(/^\s*end\s*$/gm, '');
  const id3 = `mermaid-${++mermaidCounter}`;
  try {
    const result = await mermaid.render(id3, flatCode);
    return result.svg;
  } catch (e) {
    cleanupOrphan(id3);
  }

  return null;
}

function cleanupOrphan(id) {
  const el = document.getElementById('d' + id);
  if (el) el.remove();
}

export default function MermaidDiagram({ code }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const sanitized = sanitizeMermaidCode(code);
    if (!sanitized) return;

    let cancelled = false;
    setStatus('loading');

    (async () => {
      const svg = await tryRender(sanitized);
      if (cancelled) return;

      if (svg && containerRef.current) {
        containerRef.current.innerHTML = svg;
        setStatus('success');
      } else {
        setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  if (status === 'error') {
    return (
      <div className="my-4 border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Architecture Diagram
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
              }}
              className="text-xs bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Copy code
            </button>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded"
            >
              {showRaw ? 'Hide' : 'View source'}
            </button>
          </div>
        </div>
        {showRaw && (
          <pre className="text-xs text-gray-700 bg-gray-900 text-green-300 p-4 overflow-x-auto max-h-64 overflow-y-auto">
            <code>{code}</code>
          </pre>
        )}
        {!showRaw && (
          <div className="px-4 py-3 text-sm text-gray-500 italic">
            Diagram source available — click "View source" to inspect or "Copy code" to paste into{' '}
            <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
              mermaid.live
            </a>
          </div>
        )}
      </div>
    );
  }

  return <div ref={containerRef} className="mermaid-wrapper" />;
}
