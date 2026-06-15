const SECTION_CONFIG = [
  { id: 'full', label: 'Full Output', icon: '📄' },
  { id: 'problem_analysis', label: 'Problem Analysis', icon: '🔍' },
  { id: 'high_level_design', label: 'High-Level Design', icon: '🏗️' },
  { id: 'low_level_design', label: 'Low-Level Design', icon: '⚙️' },
  { id: 'cost_estimation', label: 'Cost Estimation', icon: '💰' },
];

export default function SectionNav({ activeSection, onSectionChange, availableSections }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 mb-4">
      {SECTION_CONFIG.map(({ id, label, icon }) => {
        const isAvailable = id === 'full' || availableSections.includes(id);
        if (!isAvailable) return null;

        return (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium 
                       whitespace-nowrap transition-colors duration-200
                       ${activeSection === id
                         ? 'bg-primary-600 text-white shadow-sm'
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                       }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
