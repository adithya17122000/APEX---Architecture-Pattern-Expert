import { useState } from 'react';

const SAMPLE_REQUIREMENT = `Project: E-Commerce Platform for Fashion Retail

Business Requirements:
- Online marketplace for fashion brands to sell directly to consumers
- Support for 50,000 daily active users, scaling to 200,000 during sales events
- Product catalog with 500,000+ SKUs across 200 brands
- Real-time inventory management across multiple warehouses
- User accounts with order history, wishlists, and personalized recommendations
- Payment processing (credit cards, UPI, wallets)
- Order tracking with real-time delivery updates
- Admin dashboard for brands to manage products, pricing, and promotions

Non-Functional Requirements:
- 99.9% availability
- Page load time < 2 seconds
- Search results < 500ms
- Support for 1000 concurrent checkouts during peak
- GDPR and PCI-DSS compliance
- Multi-region deployment (India primary, SEA secondary)`;

export default function RequirementInput({ onSubmit, isLoading }) {
  const [document, setDocument] = useState('');
  const [scale, setScale] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (document.trim().length >= 50) {
      onSubmit(document, scale);
    }
  };

  const loadSample = () => {
    setDocument(SAMPLE_REQUIREMENT);
    setScale('large');
  };

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Requirement Document
        </h2>
        <button
          onClick={loadSample}
          className="btn-secondary text-sm"
          disabled={isLoading}
        >
          Load Sample
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="Paste your client requirement document here... (minimum 50 characters)"
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-y 
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     font-mono text-sm leading-relaxed"
          disabled={isLoading}
        />

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Expected Scale:
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm 
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            >
              <option value="small">Small (&lt; 1K users)</option>
              <option value="medium">Medium (1K - 100K users)</option>
              <option value="large">Large (100K - 1M users)</option>
              <option value="enterprise">Enterprise (1M+ users)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary ml-auto flex items-center gap-2"
            disabled={isLoading || document.trim().length < 50}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Generating...
              </>
            ) : (
              <>
                <ArchitectureIcon />
                Generate Architecture
              </>
            )}
          </button>
        </div>

        {document.trim().length > 0 && document.trim().length < 50 && (
          <p className="mt-2 text-sm text-amber-600">
            Please provide at least 50 characters of requirements.
          </p>
        )}
      </form>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function ArchitectureIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}
