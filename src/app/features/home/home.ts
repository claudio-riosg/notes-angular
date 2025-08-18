import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FeatureCard } from '@core/models';

@Component({
  selector: 'home',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-page">
      <header class="hero">
        <h1 class="hero__title"><i class="lni lni-notepad"></i> Notes App</h1>
        <p class="hero__subtitle">
          A simple and elegant notes application built with Angular 20 and Signals
        </p>
        <div class="hero__actions">
          <a routerLink="/notes" class="btn btn--secondary btn--lg" aria-label="Go to notes">
            Get Started
          </a>
        </div>
      </header>

      <section class="features">
        <h2 class="features__title">Features</h2>
        <div class="features__grid">
          @for (card of featureCards; track $index) {
            <div class="feature-card">
            <div class="feature-card__icon" [innerHTML]="card.icon"></div>
            <h3 class="feature-card__title">{{card.title}}</h3>
            <p class="feature-card__description">
              {{card.description}}
            </p>
          </div>
          }
        </div>
      </section>
    </div>
  `,
  styleUrl: './home.css'
})
export class Home {

  featureCards: FeatureCard[] = [
    {
      icon: '<i class="lni lni-rocket"></i>',
      title: 'Signal-First',
      description: `Built with Angular 20's latest signal-based reactivity for optimal performance`
    },
    {
      icon: '<i class="lni lni-tag"></i>',
      title: 'Tag Organization',
      description: `Organize your notes with tags and powerful filtering capabilities`
    },
    {
      icon: '<i class="lni lni-pin"></i>',
      title: 'Pin Important Notes',
      description: `Keep your most important notes at the top with pinning functionality`
    },
    {
      icon: '<i class="lni lni-search"></i>',
      title: 'Search & Filter',
      description: `Quickly find your notes with real-time search and filtering`
    }
  ]
}