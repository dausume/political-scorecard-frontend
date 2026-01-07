import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OidcService } from '../services/auth/oidc.service';

/**
 * HTTP Error Interceptor
 * Handles common HTTP errors and provides user-friendly feedback
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  const oidcService = inject(OidcService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            // Unauthorized - token expired or invalid
            errorMessage = 'Your session has expired. Please log in again.';
            console.warn('401 Unauthorized - prompting user to log in');

            // Show notification with action button
            const snackBarRef = snackBar.open(
              'Session expired. Please log in again.',
              'Log In',
              {
                duration: 10000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              }
            );

            // If user clicks "Log In", trigger authentication
            snackBarRef.onAction().subscribe(() => {
              oidcService.login();
            });
            break;

          case 403:
            // Forbidden
            errorMessage = 'You do not have permission to perform this action.';
            snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            break;

          case 404:
            // Not Found
            errorMessage = 'The requested resource was not found.';
            console.error('404 Not Found:', req.url);
            break;

          case 500:
            // Internal Server Error
            errorMessage = 'Server error. Please try again later.';
            snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            break;

          case 0:
            // Network error or CORS issue
            errorMessage = 'Unable to connect to the server. Please check your connection.';
            snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            break;

          default:
            // Other errors
            errorMessage = `Error ${error.status}: ${error.message}`;
            console.error('HTTP error:', error.status, error.message);
        }
      }

      // Return the error for further handling by the calling code
      return throwError(() => error);
    })
  );
};
