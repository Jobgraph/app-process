export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
  isConfigured: boolean;
  status?: 'ACTIVE' | 'PILOT' | 'EXPIRED' | 'PAUSED';
  pilotEndsAt?: string | null;
}

const DEFAULTS: AppConfig = {
  deploymentId: 'local',
  appName: 'Process',
  orgName: 'Your Organisation',
  brandColour: '#d97757',
  logoUrl: null,
  systemPrompt: 'You are a document data extraction assistant.',
  capabilities: ['extraction-templates'],
  isConfigured: false,
  status: 'ACTIVE',
};

let cached: AppConfig | null = null;

/** @internal — exposed for tests only */
export function resetConfigCache() {
  cached = null;
}

export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached;
  const injected = (window as any).__JOBGRAPH_CONFIG__;
  if (injected?.deploymentId) {
    const config: AppConfig = { ...DEFAULTS, ...injected, isConfigured: true };
    cached = config;
    return config;
  }
  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) {
    cached = DEFAULTS;
    return DEFAULTS;
  }
  const fallback: AppConfig = { ...DEFAULTS, deploymentId: id };
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) {
      cached = fallback;
      return fallback;
    }
    const result: AppConfig = { ...DEFAULTS, ...(await res.json()), deploymentId: id, isConfigured: true };
    cached = result;
    return result;
  } catch {
    cached = fallback;
    return fallback;
  }
}
