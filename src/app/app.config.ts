import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';

import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zoneless change detection for optimal performance
    provideZonelessChangeDetection(),
    // Router with modern features
    provideRouter(
      routes,
      withComponentInputBinding(),
      withEnabledBlockingInitialNavigation()
    ),
    // HTTP client with functional interceptors
    provideHttpClient(
      withFetch(),
    ),
    // Client-side hydration with incremental hydration (Angular v20 stable)
    provideClientHydration(
      withIncrementalHydration()
    ),
  ],
};