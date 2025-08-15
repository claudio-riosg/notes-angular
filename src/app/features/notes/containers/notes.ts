import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { NotesOrchestrator } from '@core/services';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@core/models';
import { NotesGrid } from '../components/notes-grid/notes-grid';
import { SearchBar } from '@app/shared/ui/search-bar/search-bar';
import { TagFilter } from '@shared/ui/tag-filter/tag-filter';
import { NoteModal } from '../components/note-modal/note-modal';
import { NoteContextMenu } from '../components/note-context-menu/note-context-menu';

@Component({
  selector: 'notes',
  imports: [NotesGrid, SearchBar, TagFilter, NoteModal, NoteContextMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes.html',
  styleUrl: './notes.css'
})
export class Notes {
  noteOrchestrator = inject(NotesOrchestrator);

  // Modal state
  private isModalOpen = signal(false);
  private selectedNote = signal<Note | null>(null);
  private _isSubmitting = signal(false);

  // Context menu state
  private isContextMenuOpen = signal(false);
  private contextMenuNoteData = signal<Note | null>(null);
  private contextMenuPos = signal({ x: 0, y: 0 });

  constructor() {}

  onCreateNote(): void {
    this.selectedNote.set(null);
    this.isModalOpen.set(true);
  }

  onNoteClick(note: Note): void {
    this.selectedNote.set(note);
    this.isModalOpen.set(true);
  }

  onTogglePin(noteId: string): void {
    this.noteOrchestrator.togglePinNote(noteId);
  }

  onMenuClick(data: { event: Event; note: Note }): void {
    const rect = (data.event.target as Element).getBoundingClientRect();
    this.contextMenuPos.set({ 
      x: rect.left + rect.width + 8, 
      y: rect.top 
    });
    this.contextMenuNoteData.set(data.note);
    this.isContextMenuOpen.set(true);
  }

  onTagClick(tag: string): void {
    this.noteOrchestrator.toggleTag(tag);
  }

  onSearchChange(searchTerm: string): void {
    this.noteOrchestrator.setSearchTerm(searchTerm);
  }

  onSearchClear(): void {
    this.noteOrchestrator.setSearchTerm('');
  }

  onTagToggle(tag: string): void {
    this.noteOrchestrator.toggleTag(tag);
  }

  onClearTagFilters(): void {
    this.noteOrchestrator.setSelectedTags([]);
  }

  onTogglePinnedFilter(): void {
    this.noteOrchestrator.togglePinnedFilter();
  }

  onClearFilters(): void {
    this.noteOrchestrator.clearFilters();
  }

  onRetry(): void {
    // Signal-first: trigger reactive reload
    this.noteOrchestrator.loadNotes();
  }

  getEmptyTitle(): string {
    if (this.noteOrchestrator.hasActiveFilters()) {
      return 'No matching notes';
    }
    return 'No notes yet';
  }

  getEmptyMessage(): string {
    if (this.noteOrchestrator.hasActiveFilters()) {
      return 'Try adjusting your search or filters to find what you\'re looking for.';
    }
    return 'Create your first note to get started organizing your thoughts and ideas.';
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.selectedNote.set(null);
  }

  onModalSubmit(request: CreateNoteRequest | UpdateNoteRequest): void {
    // 🎯 Signal-first: solo triggers, sin async/await
    if ('id' in request) {
      this.noteOrchestrator.updateNote(request);
    } else {
      this.noteOrchestrator.createNote(request);
    }
    // Modal se cierra inmediatamente, operación es reactiva
    this.onCloseModal();
  }

  onEditFromMenu(note: Note): void {
    this.selectedNote.set(note);
    this.isModalOpen.set(true);
  }

  onDuplicateNote(note: Note): void {
    this.noteOrchestrator.duplicateNote(note.id);
  }

  onDeleteNote(note: Note): void {
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      // 🎯 Signal-first: solo trigger
      this.noteOrchestrator.deleteNote(note.id);
    }
  }

  onCloseContextMenu(): void {
    this.isContextMenuOpen.set(false);
    this.contextMenuNoteData.set(null);
  }

  // Expose signals for template
  protected get modalOpen() { return this.isModalOpen.asReadonly(); }
  protected get noteForEdit() { return this.selectedNote.asReadonly(); }
  protected get isSubmitting() { return this._isSubmitting.asReadonly(); }
  protected get contextMenuOpen() { return this.isContextMenuOpen.asReadonly(); }
  protected get contextMenuNote() { return this.contextMenuNoteData.asReadonly(); }
  protected get contextMenuPosition() { return this.contextMenuPos.asReadonly(); }
}