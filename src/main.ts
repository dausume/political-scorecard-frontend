import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { loadRuntimeConfig } from './environment';

// Load runtime configuration before bootstrapping the app
// This ensures environment settings are available from runtime-config.json
loadRuntimeConfig().then(() => {
  bootstrapApplication(AppComponent, appConfig);
});
