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
  styles: [`
    .tag-filter {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
    }

    .tag-filter__title {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .tag-filter__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .tag-filter__tag {
      background: #ffffff;
      border: 1px solid #d1d5db;
      color: #4b5563;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tag-filter__tag:hover {
      border-color: #9ca3af;
      background: #f3f4f6;
    }

    .tag-filter__tag--active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
    }

    .tag-filter__tag--active:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    .tag-filter__clear {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }

    .tag-filter__clear:hover {
      color: #dc2626;
    }
  `]
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