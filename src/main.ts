import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    // Los design tokens ahora se definen en :root desde styles.css
    console.log('✅ Application bootstrapped successfully');
  })
  .catch((err) => console.error(err));
