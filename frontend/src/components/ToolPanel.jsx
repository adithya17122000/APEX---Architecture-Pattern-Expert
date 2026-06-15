const TOOLS = [
  {
    id: 'generate',
    label: 'Architecture',
    icon: '🏗️',
    description: 'Generated design',
  },
  {
    id: 'review',
    label: 'Review',
    icon: '🔍',
    description: 'Security, scalability & cost review',
  },
  {
    id: 'terraform',
    label: 'Terraform',
    icon: '📦',
    description: 'Export as Infrastructure-as-Code',
  },
  {
    id: 'adr',
    label: 'ADRs',
    icon: '📋',
    description: 'Architecture Decision Records',
  },
  {
    id: 'cost-compare',
    label: 'Multi-Cloud Cost',
    icon: '💰',
    description: 'AWS vs GCP vs Azure comparison',
  },
];

export default function ToolPanel({ activeTab, onAction, isLoading }) {
  return (
    <div className="section-card !p-3 mb-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        <span className="text-xs font-medium text-gray-500 mr-2 whitespace-nowrap">
          Tools:
        </span>
        {TOOLS.map(({ id, label, icon, description }) => (
          <button
            key={id}
            onClick={() => id !== 'generate' && onAction(id)}
            disabled={isLoading && activeTab !== id}
            title={description}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium 
                       whitespace-nowrap transition-all duration-200
                       ${activeTab === id
                         ? 'bg-primary-600 text-white shadow-sm'
                         : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                       }
                       disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>{icon}</span>
            {label}
            {isLoading && activeTab === id && (
              <svg className="animate-spin h-3 w-3 ml-1" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
