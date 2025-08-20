import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { NotesOrchestrator } from '@core/services';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@core/models';
import { NotesGrid } from '../components/notes-grid/notes-grid';
import { SearchBar } from '@app/shared/ui/search-bar/search-bar';
import { TagFilter } from '@shared/ui/tag-filter/tag-filter';
import { NoteModal } from '../components/note-modal/note-modal';
import { NoteContextMenu } from '../components/note-context-menu/note-context-menu';

/**
 * Main notes container component managing note operations and UI state
 */
@Component({
  selector: 'notes',
  imports: [NotesGrid, SearchBar, TagFilter, NoteModal, NoteContextMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes.html',
  styleUrl: './notes.css'
})
export class Notes {
  noteOrchestrator = inject(NotesOrchestrator);

  private isModalOpen = signal(false);
  private selectedNote = signal<Note | null>(null);
  private _isSubmitting = signal(false);

  private isContextMenuOpen = signal(false);
  private contextMenuNoteData = signal<Note | null>(null);
  private contextMenuPos = signal({ x: 0, y: 0 });

  constructor() {}

  /**
   * Opens modal for creating a new note
   */
  onCreateNote(): void {
    this.selectedNote.set(null);
    this.isModalOpen.set(true);
  }

  /**
   * Opens modal for editing an existing note
   * @param note - Note to edit
   */
  onNoteClick(note: Note): void {
    this.selectedNote.set(note);
    this.isModalOpen.set(true);
  }

  /**
   * Toggles the pinned status of a note
   * @param noteId - ID of note to toggle
   */
  onTogglePin(noteId: string): void {
    this.noteOrchestrator.togglePinNote(noteId);
  }

  /**
   * Opens context menu for a note
   * @param data - Event and note data for positioning and content
   */
  onMenuClick(data: { event: Event; note: Note }): void {
    const rect = (data.event.target as Element).getBoundingClientRect();
    this.contextMenuPos.set({ 
      x: rect.left + rect.width + 8, 
      y: rect.top 
    });
    this.contextMenuNoteData.set(data.note);
    this.isContextMenuOpen.set(true);
  }

  /**
   * Toggles a tag in the current filter
   * @param tag - Tag to toggle
   */
  onTagClick(tag: string): void {
    this.noteOrchestrator.toggleTag(tag);
  }

  /**
   * Updates the search term filter
   * @param searchTerm - Search term to apply
   */
  onSearchChange(searchTerm: string): void {
    this.noteOrchestrator.setSearchTerm(searchTerm);
  }

  /**
   * Clears the search term filter
   */
  onSearchClear(): void {
    this.noteOrchestrator.setSearchTerm('');
  }

  /**
   * Toggles a tag filter
   * @param tag - Tag to toggle in filter
   */
  onTagToggle(tag: string): void {
    this.noteOrchestrator.toggleTag(tag);
  }

  /**
   * Clears all selected tag filters
   */
  onClearTagFilters(): void {
    this.noteOrchestrator.setSelectedTags([]);
  }

  /**
   * Toggles the pinned-only filter
   */
  onTogglePinnedFilter(): void {
    this.noteOrchestrator.togglePinnedFilter();
  }

  /**
   * Clears all active filters
   */
  onClearFilters(): void {
    this.noteOrchestrator.clearFilters();
  }

  /**
   * Triggers a manual reload of notes data
   */
  onRetry(): void {
    this.noteOrchestrator.loadNotes();
  }

  /**
   * Gets appropriate empty state title based on filter status
   * @returns Title for empty state
   */
  getEmptyTitle(): string {
    if (this.noteOrchestrator.hasActiveFilters()) {
      return 'No matching notes';
    }
    return 'No notes yet';
  }

  /**
   * Gets appropriate empty state message based on filter status
   * @returns Message for empty state
   */
  getEmptyMessage(): string {
    if (this.noteOrchestrator.hasActiveFilters()) {
      return 'Try adjusting your search or filters to find what you\'re looking for.';
    }
    return 'Create your first note to get started organizing your thoughts and ideas.';
  }

  /**
   * Closes the note modal and resets selection
   */
  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.selectedNote.set(null);
  }

  /**
   * Handles note creation or update from modal
   * @param request - Note data for creation or update
   */
  onModalSubmit(request: CreateNoteRequest | UpdateNoteRequest): void {
    if ('id' in request) {
      this.noteOrchestrator.updateNote(request);
    } else {
      this.noteOrchestrator.createNote(request);
    }
    this.onCloseModal();
  }

  /**
   * Opens edit modal for a note from context menu
   * @param note - Note to edit
   */
  onEditFromMenu(note: Note): void {
    this.selectedNote.set(note);
    this.isModalOpen.set(true);
  }

  /**
   * Creates a duplicate of the specified note
   * @param note - Note to duplicate
   */
  onDuplicateNote(note: Note): void {
    this.noteOrchestrator.duplicateNote(note.id);
  }

  /**
   * Deletes a note after confirmation
   * @param note - Note to delete
   */
  onDeleteNote(note: Note): void {
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      this.noteOrchestrator.deleteNote(note.id);
    }
  }

  /**
   * Closes the context menu and clears data
   */
  onCloseContextMenu(): void {
    this.isContextMenuOpen.set(false);
    this.contextMenuNoteData.set(null);
  }

  protected get modalOpen() { return this.isModalOpen.asReadonly(); }
  protected get noteForEdit() { return this.selectedNote.asReadonly(); }
  protected get isSubmitting() { return this._isSubmitting.asReadonly(); }
  protected get contextMenuOpen() { return this.isContextMenuOpen.asReadonly(); }
  protected get contextMenuNote() { return this.contextMenuNoteData.asReadonly(); }
  protected get contextMenuPosition() { return this.contextMenuPos.asReadonly(); }
}