import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'search-bar',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar">
      <div class="search-bar__input-container">
        <span class="search-bar__icon">🔍</span>
        <input 
          type="text"
          class="search-bar__input"
          [value]="searchTerm()"
          (input)="onSearchChange($event)"
          [placeholder]="placeholder()"
          autocomplete="off"
          role="searchbox"
          aria-label="Search notes">
        @if (searchTerm()) {
          <button 
            class="search-bar__clear"
            (click)="onClear()"
            type="button">
            ✕
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-bar {
      width: 100%;
      max-width: 400px;
    }

    .search-bar__input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-bar__icon {
      position: absolute;
      left: 12px;
      color: var(--color-textDisabled);
      font-size: 16px;
      z-index: 1;
    }

    .search-bar__input {
      width: 100%;
      padding: 12px 16px 12px 40px;
      border: 2px solid var(--color-border);
      border-radius: 24px;
      font-size: 14px;
      background: var(--color-background);
      transition: all var(--animation-duration-fast) var(--animation-easing-out);
      outline: none;
    }

    .search-bar__input:focus {
      border-color: var(--color-info);
      box-shadow: 0 0 0 3px var(--color-infoLight);
    }

    .search-bar__input::placeholder {
      color: var(--color-textDisabled);
    }

    .search-bar__clear {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: var(--color-textDisabled);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      font-size: 12px;
      transition: all var(--animation-duration-fast) var(--animation-easing-out);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .search-bar__clear:hover {
      background: var(--color-backgroundMuted);
      color: var(--color-text);
    }
  `]
})
export class SearchBar {
  readonly searchTerm = input('');
  readonly placeholder = input('Search notes...');
  
  readonly searchChange = output<string>();
  readonly clear = output<void>();

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  onClear(): void {
    this.clear.emit();
  }
}