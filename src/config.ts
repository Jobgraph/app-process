export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
  isConfigured: boolean;
}

const DEFAULTS: AppConfig = {
  deploymentId: 'local',
  appName: 'Process',
  orgName: 'Your Organisation',
  brandColour: '#6366f1',
  logoUrl: null,
  systemPrompt: 'You are a document processing assistant that extracts structured data.',
  capabilities: ['data-extraction'],
  isConfigured: false,
};

export async function loadConfig(): Promise<AppConfig> {
  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) return DEFAULTS;
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) return DEFAULTS;
    return { ...DEFAULTS, ...await res.json(), deploymentId: id, isConfigured: true };
  } catch {
    return DEFAULTS;
  }
}
