import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Note } from '@core/models';
import { NoteCard } from '@shared/ui';

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

  onNoteClick(note: Note): void {
    this.noteClick.emit(note);
  }

  onTogglePin(noteId: string): void {
    this.togglePin.emit(noteId);
  }

  onMenuClick(data: { event: Event; note: Note }): void {
    this.menuClick.emit(data);
  }

  onTagClick(tag: string): void {
    this.tagClick.emit(tag);
  }

  onCreateNote(): void {
    this.createNote.emit();
  }
}