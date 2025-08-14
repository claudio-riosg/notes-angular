import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { Note, NoteColor } from '@core/models';
import { inject } from '@angular/core';
import { NotesService } from '@core/services';

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
  notesService = inject(NotesService);
  
  readonly cardClick = output<Note>();
  readonly togglePin = output<string>();
  readonly menuClick = output<{ event: Event; note: Note }>();
  readonly tagClick = output<string>();

  // Computed properties for host bindings
  computedClasses = computed(() => {
    const classes = ['note-card'];
    
    if (this.note().isPinned) {
      classes.push('note-card--pinned');
    }
    if (this.notesService.isUpdating(this.note().id)) {
      classes.push('note-card--updating');
    }
    if (this.notesService.isDeleting(this.note().id)) {
      classes.push('note-card--deleting');
    }
    
    return classes.join(' ');
  });

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

  onCardClick(): void {
    this.cardClick.emit(this.note());
  }

  onTogglePin(event: Event): void {
    event.stopPropagation();
    this.togglePin.emit(this.note().id);
  }

  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClick.emit({ event, note: this.note() });
  }

  onTagClick(event: Event, tag: string): void {
    event.stopPropagation();
    this.tagClick.emit(tag);
  }

  getPreviewContent(): string {
    const content = this.note().content || '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

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