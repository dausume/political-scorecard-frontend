import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { OidcService } from '../services/auth/oidc.service';

/**
 * HTTP Interceptor to add Authorization header with Bearer token
 * to outgoing requests to the backend API.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oidcService = inject(OidcService);

  // Only add token to requests to the backend
  // Check if request is to backend (you can customize this logic)
  const isBackendRequest = req.url.includes('/api/') ||
                          req.url.startsWith('http://localhost:8080/');

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
