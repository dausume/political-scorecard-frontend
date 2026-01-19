// This environment.ts file auto-detects the deployment mode based on the current URL.
// - Suite mode (Docker): Accessed via proxy at ports 2053, 2083, 8443
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
// Suite mode uses proxy port 2053 for frontend
const isSuiteMode = typeof window !== 'undefined' && window.location.port === '2053';

// Suite mode configuration (Docker with proxy)
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
export const environment: Environment = isSuiteMode ? suiteConfig : bareMetalConfig;

// Log the detected mode for debugging
if (typeof window !== 'undefined') {
  console.log(`Environment: ${isSuiteMode ? 'Suite (Docker proxy)' : 'Bare metal'} mode detected`);
}