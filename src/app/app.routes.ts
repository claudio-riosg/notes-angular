import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(r => r.HOME_ROUTES)
  },
  {
    path: 'notes',
    loadChildren: () => import('./features/notes/notes.routes').then(r => r.NOTES_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
