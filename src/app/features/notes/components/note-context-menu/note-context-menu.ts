import { Component, input, output, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { Note } from '@core/models';

@Component({
  selector: 'note-context-menu',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './note-context-menu.html',
  styleUrl: './note-context-menu.css'
})
export class NoteContextMenu {
  // Inputs
  isVisible = input.required<boolean>();
  note = input<Note | null>(null);
  position = input<{ x: number; y: number }>({ x: 0, y: 0 });

  // Outputs
  edit = output<Note>();
  togglePin = output<Note>();
  duplicate = output<Note>();
  delete = output<Note>();
  close = output<void>();

  constructor() {
    // Handle click outside to close menu
    effect(() => {
      if (this.isVisible()) {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Element;
          if (!target.closest('.note-context-menu') && !target.closest('.note-card__menu-btn')) {
            this.close.emit();
          }
        };

        const handleEscape = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            this.close.emit();
          }
        };

        // Add small delay to prevent immediate closure
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
          document.addEventListener('keydown', handleEscape);
        }, 0);

        return () => {
          document.removeEventListener('click', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
        };
      }
      return () => {};
    });
  }

  onEdit(note: Note): void {
    this.edit.emit(note);
    this.close.emit();
  }

  onTogglePin(note: Note): void {
    this.togglePin.emit(note);
    this.close.emit();
  }

  onDuplicate(note: Note): void {
    this.duplicate.emit(note);
    this.close.emit();
  }

  onDelete(note: Note): void {
    this.delete.emit(note);
    this.close.emit();
  }
}