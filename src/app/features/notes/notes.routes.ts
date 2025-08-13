import { Routes } from '@angular/router';

export const NOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/notes').then(c => c.Notes)
  }
];