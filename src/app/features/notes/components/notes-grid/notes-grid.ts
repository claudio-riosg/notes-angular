import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Note } from '@core/models';
import { NoteCard } from '@shared/ui';

/**
 * Grid component for displaying notes with separate pinned and unpinned sections
 */
@Component({
  selector: 'notes-grid',
  imports: [NoteCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes-grid.html',
  styleUrl: './notes-grid.css'
})
export class NotesGrid {
  pinnedNotes = input.required<Note[]>();
  unpinnedNotes = input.required<Note[]>();
  emptyTitle = input('No notes yet');
  emptyMessage = input('Create your first note to get started organizing your thoughts and ideas.');
  showCreateButton = input(true);

  noteClick = output<Note>();
  togglePin = output<string>();
  menuClick = output<{ event: Event; note: Note }>();
  tagClick = output<string>();
  createNote = output<void>();

  /**
   * Handles note card clicks
   * @param note - Note that was clicked
   */
  onNoteClick(note: Note): void {
    this.noteClick.emit(note);
  }

  /**
   * Handles pin toggle events
   * @param noteId - ID of note to toggle pin status
   */
  onTogglePin(noteId: string): void {
    this.togglePin.emit(noteId);
  }

  /**
   * Handles context menu click events
   * @param data - Event and note data for menu positioning
   */
  onMenuClick(data: { event: Event; note: Note }): void {
    this.menuClick.emit(data);
  }

  /**
   * Handles tag click events
   * @param tag - Tag that was clicked
   */
  onTagClick(tag: string): void {
    this.tagClick.emit(tag);
  }

  /**
   * Handles create note button clicks
   */
  onCreateNote(): void {
    this.createNote.emit();
  }
}