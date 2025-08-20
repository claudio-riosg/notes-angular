import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Search input component with clear functionality and accessibility features
 */
@Component({
  selector: 'search-bar',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar">
      <div class="search-bar__input-container">
        <span class="search-bar__icon"><i class="lni lni-search"></i></span>
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
            <i class="lni lni-close"></i>
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './search-bar.css'
})
export class SearchBar {
  readonly searchTerm = input('');
  readonly placeholder = input('Search notes...');
  
  readonly searchChange = output<string>();
  readonly clear = output<void>();

  /**
   * Handles search input changes
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  /**
   * Clears the search input
   */
  onClear(): void {
    this.clear.emit();
  }
}