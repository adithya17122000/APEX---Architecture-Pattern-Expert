const API_BASE = '/api';

export async function fetchProviders() {
  const response = await fetch(`${API_BASE}/architecture/providers`);
  if (!response.ok) throw new Error('Failed to fetch providers');
  return response.json();
}

export async function generateArchitectureStream(
  requirementDocument,
  scaleHint,
  aiProvider,
  onChunk,
  onDone,
  onError
) {
  const body = {
    requirement_document: requirementDocument,
    scale_hint: scaleHint,
    include_sections: ['problem_analysis', 'hld', 'lld', 'cost_estimation'],
  };
  if (aiProvider) body.ai_provider = aiProvider;

  await _streamRequest(`${API_BASE}/architecture/generate/stream`, body, onChunk, onDone, onError);
}

export async function reviewArchitectureStream(
  architectureMarkdown,
  reviewAspects,
  aiProvider,
  onChunk,
  onDone,
  onError
) {
  const body = {
    architecture_markdown: architectureMarkdown,
    review_aspects: reviewAspects,
  };
  if (aiProvider) body.ai_provider = aiProvider;

  await _streamRequest(`${API_BASE}/architecture/review/stream`, body, onChunk, onDone, onError);
}

export async function generateTerraformStream(
  architectureMarkdown,
  cloudProvider,
  aiProvider,
  onChunk,
  onDone,
  onError
) {
  const body = {
    architecture_markdown: architectureMarkdown,
    cloud_provider: cloudProvider,
  };
  if (aiProvider) body.ai_provider = aiProvider;

  await _streamRequest(`${API_BASE}/architecture/terraform/stream`, body, onChunk, onDone, onError);
}

export async function generateADRStream(
  architectureMarkdown,
  aiProvider,
  onChunk,
  onDone,
  onError
) {
  const body = { architecture_markdown: architectureMarkdown };
  if (aiProvider) body.ai_provider = aiProvider;

  await _streamRequest(`${API_BASE}/architecture/adr/stream`, body, onChunk, onDone, onError);
}

export async function compareCostsStream(
  architectureMarkdown,
  cloudProviders,
  aiProvider,
  onChunk,
  onDone,
  onError
) {
  const body = {
    architecture_markdown: architectureMarkdown,
    cloud_providers: cloudProviders,
  };
  if (aiProvider) body.ai_provider = aiProvider;

  await _streamRequest(`${API_BASE}/architecture/cost-compare/stream`, body, onChunk, onDone, onError);
}

// ─── Internal streaming helper ──────────────────────────────────────────

async function _streamRequest(url, body, onChunk, onDone, onError) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      onError(new Error(error.detail || 'Request failed'));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          if (data.startsWith('[ERROR]')) {
            onError(new Error(data.slice(8)));
            return;
          }
          // Decode JSON-encoded chunk to preserve newlines
          try {
            const decoded = JSON.parse(data);
            onChunk(decoded);
          } catch {
            onChunk(data);
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
}
