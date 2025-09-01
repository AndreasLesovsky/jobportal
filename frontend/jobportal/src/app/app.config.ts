import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { appRoutes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',    // ↑ immer auf [0,0] scrollen bei routing
        anchorScrolling: 'enabled'           // scrollen zu #id-Sprungmarke
      })
    
    ),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
        },
        defaultLanguage: 'de',
    })
    ]),
    ReactiveFormsModule,
    RouterModule,
    provideHttpClient(withInterceptorsFromDi())
  ]
};
