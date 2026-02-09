import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { OidcService } from '../services/auth/oidc.service';
import { environment } from '../../environment';

/**
 * HTTP Interceptor to add Authorization header with Bearer token
 * to outgoing requests to the backend API.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oidcService = inject(OidcService);

  // Skip auth for requests marked with X-Skip-Auth header (e.g., health checks)
  if (req.headers.has('X-Skip-Auth')) {
    const clonedRequest = req.clone({
      headers: req.headers.delete('X-Skip-Auth')
    });
    return next(clonedRequest);
  }

  // Only add token to requests to the backend
  const backendUri = environment.backendUri;
  const backendHttpsUri = environment.backendHttpsUri;
  const isBackendRequest = req.url.includes('/api/') ||
                          req.url.startsWith(backendUri) ||
                          (backendHttpsUri && req.url.startsWith(backendHttpsUri));

  if (!isBackendRequest) {
    return next(req);
  }

  // Get the access token and add it to the request
  return from(oidcService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedRequest);
      }
      return next(req);
    })
  );
};
