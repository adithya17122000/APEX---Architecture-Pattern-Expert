export default function ProviderSelector({ providers, selected, onChange }) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500">AI:</label>
      <select
        value={selected || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 
                   bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {providers.map((provider) => (
          <option
            key={provider.id}
            value={provider.id}
            disabled={!provider.configured}
          >
            {provider.name} {provider.configured ? '' : '(not configured)'}
          </option>
        ))}
      </select>
    </div>
  );
}
