// This environment.ts file auto-detects the deployment mode based on the current URL.
// - Production mode: Accessed via psc.polari-systems.org domain
// - Suite dev mode (Docker): Accessed via proxy at ports 2053, 2083, 8443
// - Bare metal mode: Accessed directly at ports 4200, 8580, 8443

export interface Environment {
  production: boolean;
  backendHttpsUri: string;
  backendUri: string;
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

// Auto-detect mode based on current URL
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const port = typeof window !== 'undefined' ? window.location.port : '';
const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

// Production mode: Running on polari-systems.org domain
const isProductionMode = hostname.includes('polari-systems.org');

// Suite dev mode: Uses proxy port 2053 for frontend
const isSuiteMode = !isProductionMode && port === '2053';

// Production configuration (polari-systems.org domains)
const productionConfig: Environment = {
  production: true,
  backendHttpsUri: 'https://api.psc.polari-systems.org/',
  backendUri: 'https://api.psc.polari-systems.org/',
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

// Suite dev mode configuration (Docker with proxy)
const suiteConfig: Environment = {
  production: false,
  backendHttpsUri: 'https://localhost:2083/',
  backendUri: 'https://localhost:2083/',
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

// Bare metal configuration (direct access)
const bareMetalConfig: Environment = {
  production: false,
  backendHttpsUri: 'https://localhost:8580/',
  backendUri: 'http://localhost:8580/',
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

// Export the appropriate config based on detected mode
function getEnvironment(): Environment {
  if (isProductionMode) return productionConfig;
  if (isSuiteMode) return suiteConfig;
  return bareMetalConfig;
}

export const environment: Environment = getEnvironment();

// Log the detected mode for debugging
if (typeof window !== 'undefined') {
  const mode = isProductionMode ? 'Production' : (isSuiteMode ? 'Suite (Docker proxy)' : 'Bare metal');
  console.log(`Environment: ${mode} mode detected`);
  console.log(`  Hostname: ${hostname}, Port: ${port}`);
  console.log(`  Backend: ${environment.backendUri}`);
}