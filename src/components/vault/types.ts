// ═══════════════════════════════════════════════════════════════
// BUNKER - Vault Types
// Shared types and constants for vault components
// ═══════════════════════════════════════════════════════════════

export interface Secret {
  name: string;
  value: string | null;
  category: string;
}

export interface VaultResult {
  success: boolean;
  message: string;
  data: Secret[] | null;
}

export interface ParsedSecret extends Secret {
  project: string | null;
  environment: string | null;
  service: string | null;
}

// Category icons and colors
export const categoryConfig: Record<string, { icon: string; color: string }> = {
  'AI Services': { icon: '🤖', color: 'text-safe' },
  'Database': { icon: '🗄️', color: 'text-vault-blue' },
  'Authentication': { icon: '🔐', color: 'text-caution' },
  'Automation': { icon: '⚡', color: 'text-terminal-amber' },
  'Monitoring': { icon: '📊', color: 'text-vault-yellow' },
  'Payments': { icon: '💳', color: 'text-safe' },
  'Cloud Services': { icon: '☁️', color: 'text-vault-blue' },
  'Version Control': { icon: '📦', color: 'text-terminal-amber' },
  'Sales & CRM': { icon: '📈', color: 'text-caution' },
  'Security': { icon: '🛡️', color: 'text-danger' },
  'Other': { icon: '📁', color: 'text-text-muted' },
};

// Known project names to detect
export const knownProjects = [
  'BUNKER', 'GALAXYCO', 'LAUNCHPAD', 'N8N', 'PERSONAL',
  'CLIENT', 'WORK', 'TEST', 'DEMO', 'SANDBOX'
];

// Environment indicators
export const environments = ['DEV', 'PROD', 'STAGING', 'TEST', 'LOCAL', 'PREVIEW'];

// Service names to detect
export const knownServices = [
  'OPENAI', 'ANTHROPIC', 'CLAUDE', 'GEMINI', 'GROQ', 'PERPLEXITY', 'MISTRAL', 'OLLAMA',
  'POSTGRES', 'MYSQL', 'MONGO', 'REDIS', 'SUPABASE',
  'CLERK', 'AUTH0', 'NEXTAUTH',
  'STRIPE', 'PAYPAL',
  'VERCEL', 'AWS', 'GCP', 'AZURE', 'CLOUDFLARE',
  'GITHUB', 'GITLAB',
  'SENTRY', 'DATADOG',
  'APOLLO', 'HUBSPOT', 'SALESFORCE'
];

// Parse secret name to extract project, environment, service
export function parseSecretName(name: string): { project: string | null; environment: string | null; service: string | null } {
  const parts = name.toUpperCase().split('_');

  let project: string | null = null;
  let environment: string | null = null;
  let service: string | null = null;

  for (const part of parts) {
    if (knownProjects.includes(part) && !project) {
      project = part;
    } else if (environments.includes(part) && !environment) {
      environment = part;
    } else if (knownServices.includes(part) && !service) {
      service = part;
    }
  }

  // Also check for compound service names
  const nameUpper = name.toUpperCase();
  for (const svc of knownServices) {
    if (nameUpper.includes(svc) && !service) {
      service = svc;
      break;
    }
  }

  return { project, environment, service };
}
