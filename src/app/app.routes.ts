import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./menu/menu.component').then((m) => m.MenuComponent)
  },
  {
    path: 'game',
    loadComponent: () => import('./game/game.component').then((m) => m.GameComponent)
  },
  {
    path: 'configure-pack',
    loadComponent: () => import('./pack-config/pack-config.component').then((m) => m.PackConfigComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.component').then((m) => m.HistoryComponent)
  },
  { path: '**', redirectTo: '' }
];
