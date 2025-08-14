import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { NotesService } from '@core/services';
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
  notesService = inject(NotesService);

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
    this.notesService.togglePinNote(noteId);
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
    this.notesService.toggleTag(tag);
  }

  onSearchChange(searchTerm: string): void {
    this.notesService.setSearchTerm(searchTerm);
  }

  onSearchClear(): void {
    this.notesService.setSearchTerm('');
  }

  onTagToggle(tag: string): void {
    this.notesService.toggleTag(tag);
  }

  onClearTagFilters(): void {
    this.notesService.setSelectedTags([]);
  }

  onTogglePinnedFilter(): void {
    this.notesService.togglePinnedFilter();
  }

  onClearFilters(): void {
    this.notesService.clearFilters();
  }

  onRetry(): void {
    this.notesService.loadNotes();
  }

  getEmptyTitle(): string {
    if (this.notesService.hasActiveFilters()) {
      return 'No matching notes';
    }
    return 'No notes yet';
  }

  getEmptyMessage(): string {
    if (this.notesService.hasActiveFilters()) {
      return 'Try adjusting your search or filters to find what you\'re looking for.';
    }
    return 'Create your first note to get started organizing your thoughts and ideas.';
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.selectedNote.set(null);
  }

  async onModalSubmit(request: CreateNoteRequest | UpdateNoteRequest): Promise<void> {
    this._isSubmitting.set(true);
    try {
      if ('id' in request) {
        const updated = await this.notesService.updateNote(request);
        if (updated) {
          this.onCloseModal();
        }
      } else {
        const created = await this.notesService.createNote(request);
        if (created) {
          this.onCloseModal();
        }
      }
    } finally {
      this._isSubmitting.set(false);
    }
  }

  onEditFromMenu(note: Note): void {
    this.selectedNote.set(note);
    this.isModalOpen.set(true);
  }

  onDuplicateNote(note: Note): void {
    this.notesService.duplicateNote(note.id);
  }

  onDeleteNote(note: Note): void {
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      this.notesService.deleteNote(note.id);
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