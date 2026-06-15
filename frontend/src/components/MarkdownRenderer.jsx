import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';

export default function MarkdownRenderer({ content, isStreaming = false }) {
  if (!content) return null;

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (!inline && language === 'mermaid') {
              const code = String(children).replace(/\n$/, '');

              // During streaming, show mermaid as raw code (it's likely incomplete)
              if (isStreaming) {
                return (
                  <pre className="bg-gray-800 text-green-300 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">mermaid (rendering after completion...)</div>
                    <code>{code}</code>
                  </pre>
                );
              }

              return <MermaidDiagram code={code} />;
            }

            if (!inline) {
              return (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
