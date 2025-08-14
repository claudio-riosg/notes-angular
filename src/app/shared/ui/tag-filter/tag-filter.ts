import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tag-filter',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (availableTags().length > 0) {
      <div class="tag-filter">
        <h4 class="tag-filter__title">Filter by Tags</h4>
          <div class="tag-filter__tags" role="list">
          @for (tag of availableTags(); track tag) {
            <button
              class="tag-filter__tag"
              [class.tag-filter__tag--active]="selectedTags().includes(tag)"
              (click)="onTagToggle(tag)"
              type="button">
              #{{ tag }}
            </button>
          }
        </div>
        @if (selectedTags().length > 0) {
          <button
            class="tag-filter__clear btn btn--ghost btn--sm"
            (click)="onClearTags()"
            type="button">
            Clear Tags
          </button>
        }
      </div>
    }
  `,
  styleUrl: './tag-filter.css'
})
export class TagFilter {
  readonly availableTags = input.required<string[]>();
  readonly selectedTags = input.required<string[]>();
  readonly tagToggle = output<string>();
  readonly clearTags = output<void>();

  onTagToggle(tag: string): void {
    this.tagToggle.emit(tag);
  }

  onClearTags(): void {
    this.clearTags.emit();
  }
}