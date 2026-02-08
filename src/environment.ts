// ==============================================================================
// ENVIRONMENT CONFIGURATION
// ==============================================================================
// This file provides environment configuration with support for:
// - Tier 1 (Build-time): Default configurations baked into the build
// - Tier 2 (Startup-time): Runtime override via /assets/runtime-config.json
// - Tier 3 (Runtime): URL-based auto-detection as fallback
//
// Priority: runtime-config.json > URL detection > build-time defaults
// ==============================================================================

export interface Environment {
  production: boolean;
  backendHttpsUri: string;
  backendUri: string;
  polariResearchFrameworkUrl: string;
  keycloak: {
    authority: string;
    clientId: string;
    realm: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    responseType: string;
    scope: string;
    silentRedirectUri?: string;
  };
}

// Build-time default configurations
const productionConfig: Environment = {
  production: true,
  backendHttpsUri: 'https://api.psc.polari-systems.org/',
  backendUri: 'https://api.psc.polari-systems.org/',
  polariResearchFrameworkUrl: 'https://prf.polari-systems.org',
  keycloak: {
    authority: 'https://auth.polari-systems.org/realms/Political-Scorecard',
    clientId: 'political-scorecard-frontend',
    realm: 'Political-Scorecard',
    redirectUri: 'https://psc.polari-systems.org',
    postLogoutRedirectUri: 'https://psc.polari-systems.org',
    responseType: 'code',
    scope: 'openid profile email roles',
    silentRedirectUri: 'https://psc.polari-systems.org/silent-refresh.html'
  }
};

const suiteConfig: Environment = {
  production: false,
  backendHttpsUri: 'https://localhost:2083/',
  backendUri: 'https://localhost:2083/',
  polariResearchFrameworkUrl: 'https://localhost:2087',
  keycloak: {
    authority: 'https://localhost:8443/realms/Political-Scorecard',
    clientId: 'political-scorecard-frontend',
    realm: 'Political-Scorecard',
    redirectUri: 'https://localhost:2053',
    postLogoutRedirectUri: 'https://localhost:2053',
    responseType: 'code',
    scope: 'openid profile email roles',
    silentRedirectUri: 'https://localhost:2053/silent-refresh.html'
  }
};

const bareMetalConfig: Environment = {
  production: false,
  backendHttpsUri: 'https://localhost:8580/',
  backendUri: 'http://localhost:8580/',
  polariResearchFrameworkUrl: 'http://localhost:4201',
  keycloak: {
    authority: 'https://localhost:8443/realms/Political-Scorecard',
    clientId: 'political-scorecard-frontend',
    realm: 'Political-Scorecard',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    responseType: 'code',
    scope: 'openid profile email roles',
    silentRedirectUri: 'http://localhost:4200/silent-refresh.html'
  }
};

// Runtime configuration state
let runtimeConfig: Partial<Environment> | null = null;
let configLoaded = false;
let configLoadPromise: Promise<void> | null = null;

/**
 * Load runtime configuration from /assets/runtime-config.json
 * This is called during app initialization
 */
export async function loadRuntimeConfig(): Promise<void> {
  if (configLoaded) return;
  if (configLoadPromise) return configLoadPromise;

  configLoadPromise = (async () => {
    try {
      const response = await fetch('/assets/runtime-config.json');
      if (response.ok) {
        runtimeConfig = await response.json();
        console.log('[Environment] Loaded runtime-config.json:', runtimeConfig);
      }
    } catch (error) {
      console.log('[Environment] No runtime-config.json found, using URL detection');
    }
    configLoaded = true;
  })();

  return configLoadPromise;
}

/**
 * Get environment based on runtime config, URL detection, or defaults
 */
function getEnvironment(): Environment {
  // If runtime config is loaded, use it
  if (runtimeConfig && runtimeConfig.backendUri) {
    return {
      production: runtimeConfig.production ?? false,
      backendHttpsUri: runtimeConfig.backendHttpsUri || runtimeConfig.backendUri || '',
      backendUri: runtimeConfig.backendUri || '',
      polariResearchFrameworkUrl: runtimeConfig.polariResearchFrameworkUrl || '',
      keycloak: {
        authority: runtimeConfig.keycloak?.authority || '',
        clientId: runtimeConfig.keycloak?.clientId || 'political-scorecard-frontend',
        realm: runtimeConfig.keycloak?.realm || 'Political-Scorecard',
        redirectUri: runtimeConfig.keycloak?.redirectUri || '',
        postLogoutRedirectUri: runtimeConfig.keycloak?.postLogoutRedirectUri || '',
        responseType: runtimeConfig.keycloak?.responseType || 'code',
        scope: runtimeConfig.keycloak?.scope || 'openid profile email roles',
        silentRedirectUri: runtimeConfig.keycloak?.silentRedirectUri
      }
    };
  }

  // URL-based detection (runtime in browser)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Production mode: polari-systems.org domain
    if (hostname.includes('polari-systems.org')) {
      return productionConfig;
    }

    // Nip.io mode: *.nip.io domain (prod-local testing)
    if (hostname.includes('.nip.io')) {
      const nipIoBase = hostname.replace(/^[^.]+\./, '');
      const frontendBase = `https://psc.${nipIoBase}`;
      return {
        production: false,
        backendHttpsUri: `https://api.psc.${nipIoBase}/`,
        backendUri: `https://api.psc.${nipIoBase}/`,
        polariResearchFrameworkUrl: `https://prf.${nipIoBase}`,
        keycloak: {
          authority: `https://auth.${nipIoBase}/realms/Political-Scorecard`,
          clientId: 'political-scorecard-frontend',
          realm: 'Political-Scorecard',
          redirectUri: frontendBase,
          postLogoutRedirectUri: frontendBase,
          responseType: 'code',
          scope: 'openid profile email roles',
          silentRedirectUri: `${frontendBase}/silent-refresh.html`
        }
      };
    }

    // Suite dev mode: port 2053
    if (port === '2053') {
      return suiteConfig;
    }
  }

  // Default: bare metal
  return bareMetalConfig;
}

// Create a proxy that always returns the current environment
// This ensures runtime config is used once loaded
const environmentProxy = new Proxy({} as Environment, {
  get(target, prop) {
    const env = getEnvironment();
    return (env as any)[prop];
  }
});

export const environment: Environment = environmentProxy;

// Log detected mode
if (typeof window !== 'undefined') {
  // Defer logging until after potential runtime config load
  setTimeout(() => {
    const env = getEnvironment();
    const hostname = window.location.hostname;
    const mode = runtimeConfig ? 'Runtime Config' :
      (hostname.includes('polari-systems.org') ? 'Production' :
      (hostname.includes('.nip.io') ? 'Nip.io (Prod-Local)' :
      (window.location.port === '2053' ? 'Suite (Docker)' : 'Bare Metal')));
    console.log(`[Environment] Mode: ${mode}`);
    console.log(`[Environment] Backend: ${env.backendUri}`);
    console.log(`[Environment] Keycloak: ${env.keycloak.authority}`);
  }, 100);
}
