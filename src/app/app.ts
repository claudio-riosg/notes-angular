import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  template: `
    <nav class="app-nav">
      <div class="app-nav__container">
        <a routerLink="/" class="app-nav__brand">
          <i class="lni lni-notepad"></i> Notes App
        </a>
        <div class="app-nav__links">
          <a routerLink="/" routerLinkActive="app-nav__link--active" [routerLinkActiveOptions]="{exact: true}" class="app-nav__link">
            Home
          </a>
          <a routerLink="/notes" routerLinkActive="app-nav__link--active" class="app-nav__link">
            My Notes
          </a>
        </div>
      </div>
    </nav>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-nav {
      background: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: var(--zIndex-sticky);
    }

    .app-nav__container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-2xl);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .app-nav__brand {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      text-decoration: none;
      transition: color var(--animation-duration-normal) var(--animation-easing-out);
    }

    .app-nav__brand:hover {
      color: var(--color-primary);
    }

    .app-nav__links {
      display: flex;
      gap: var(--spacing-2xl);
    }

    .app-nav__link {
      color: var(--color-textMuted);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-md);
      transition: all var(--animation-duration-normal) var(--animation-easing-out);
    }

    .app-nav__link:hover {
      color: var(--color-primary);
      background: var(--color-primaryLight);
    }

    .app-nav__link--active {
      color: var(--color-primary);
      background: var(--color-primaryLight);
    }

    .app-main {
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 640px) {
      .app-nav__container {
        padding: 0 16px;
        flex-direction: column;
        height: auto;
        padding-top: 16px;
        padding-bottom: 16px;
        gap: 16px;
      }

      .app-nav__links {
        gap: 16px;
      }
    }
  `]
})
export class App {
  protected readonly title = signal('notes-signals');
}
