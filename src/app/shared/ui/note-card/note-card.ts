import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { Note, NoteColor } from '@core/models';
import { inject } from '@angular/core';
import { NotesOrchestrator } from '@core/services';

/**
 * Reusable note card component displaying note information with interactive features
 */
@Component({
  selector: 'note-card',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'computedClasses()',
    '[style.background-color]': 'noteColorValue()',
    '[attr.data-pinned]': 'note().isPinned',
    '[attr.data-color]': 'note().color',
    '(click)': 'onCardClick()'
  },
  templateUrl: './note-card.html',
  styleUrl: './note-card.css'
})
export class NoteCard {
  readonly note = input.required<Note>();
  orchestrator = inject(NotesOrchestrator);
  
  readonly cardClick = output<Note>();
  readonly togglePin = output<string>();
  readonly menuClick = output<{ event: Event; note: Note }>();
  readonly tagClick = output<string>();

  /**
   * Computes CSS classes based on note state
   * @returns Space-separated CSS class string
   */
  computedClasses = computed(() => {
    const classes = ['note-card'];
    
    if (this.note().isPinned) {
      classes.push('note-card--pinned');
    }
    if (this.orchestrator.isUpdating(this.note().id)) {
      classes.push('note-card--updating');
    }
    if (this.orchestrator.isDeleting(this.note().id)) {
      classes.push('note-card--deleting');
    }
    
    return classes.join(' ');
  });

  /**
   * Maps note color to CSS custom property value
   * @returns CSS color value for note background
   */
  noteColorValue = computed(() => {
    const colorMap: Record<NoteColor, string> = {
      yellow: 'var(--color-noteYellow)',
      blue: 'var(--color-noteBlue)',
      green: 'var(--color-noteGreen)',
      red: 'var(--color-noteRed)',
      purple: 'var(--color-notePurple)',
      orange: 'var(--color-noteOrange)',
      pink: 'var(--color-notePink)',
      gray: 'var(--color-noteGray)',
    };
    
    return colorMap[this.note().color] || 'var(--color-background)';
  });

  /**
   * Handles card click events
   */
  onCardClick(): void {
    this.cardClick.emit(this.note());
  }

  /**
   * Handles pin toggle button clicks
   * @param event - Click event to stop propagation
   */
  onTogglePin(event: Event): void {
    event.stopPropagation();
    this.togglePin.emit(this.note().id);
  }

  /**
   * Handles menu button clicks
   * @param event - Click event to stop propagation and provide positioning
   */
  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClick.emit({ event, note: this.note() });
  }

  /**
   * Handles tag clicks
   * @param event - Click event to stop propagation
   * @param tag - Tag that was clicked
   */
  onTagClick(event: Event, tag: string): void {
    event.stopPropagation();
    this.tagClick.emit(tag);
  }

  /**
   * Gets truncated content for preview display
   * @returns Truncated content string with ellipsis if needed
   */
  getPreviewContent(): string {
    const content = this.note().content || '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  /**
   * Formats date for display with relative time
   * @param date - Date to format
   * @returns Human-readable date string
   */
  formatDate(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown date';
    }
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}