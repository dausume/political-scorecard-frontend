// This environment.ts file is meant to be replaced at build time according to how it is you want to
// configure the angular app environment, it will typically be replaced using either auto-templating
// via something like jinja-2, or through direct overwrite by a Dockerfile from a pre-existing template
// replacement file.

export interface Environment {
  production: boolean;
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

export const environment: Environment = {
  production: false,
  backendUri: 'https://localhost:8443/',
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