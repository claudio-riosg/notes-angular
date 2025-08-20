import { Injectable, signal, computed, linkedSignal } from '@angular/core';
import { Note, NotesFilter, NoteColor } from '@core/models';

/**
 * State management store for notes application using Angular signals
 */
@Injectable({
  providedIn: 'root'
})
export class NotesStateStore {
  private notesSignal = signal<Note[]>([]);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private isCreatingSignal = signal(false);
  private updatingIdsSignal = signal<Set<string>>(new Set());
  private deletingIdsSignal = signal<Set<string>>(new Set());

  private filterSignal = signal<NotesFilter>({
    searchTerm: '',
    selectedTags: [],
    selectedColor: undefined,
    showPinnedOnly: false
  });

  /**
   * LinkedSignal for selected note with auto-reset behavior
   * Automatically clears selection when note is deleted
   */
  private selectedNoteLinked = linkedSignal<Note[], Note | null>({
    source: () => this.notesSignal(),
    computation: (notes: Note[], previous?: { source: Note[]; value: Note | null }) => {
      if (!previous?.value) return null;

      const selectedNote = previous.value;
      const stillExists = notes.find((n: Note) => n.id === selectedNote.id);
      return stillExists ? selectedNote : null;
    }
  });

  // Read-only computed signals
  readonly notes = this.notesSignal.asReadonly();
  readonly selectedNote = this.selectedNoteLinked.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly filter = this.filterSignal.asReadonly();
  readonly isCreating = this.isCreatingSignal.asReadonly();

  /**
   * Gets all unique tags from all notes, sorted alphabetically
   * @returns Sorted array of unique tag strings
   */
  readonly allTags = computed(() => {
    const notes = this.notes();
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  });

  /**
   * Gets all pinned notes
   * @returns Array of pinned notes
   */
  readonly pinnedNotes = computed(() => 
    this.notes().filter(note => note.isPinned)
  );

  /**
   * Gets all unpinned notes
   * @returns Array of unpinned notes
   */
  readonly unpinnedNotes = computed(() => 
    this.notes().filter(note => !note.isPinned)
  );

  /**
   * Gets total count of notes
   * @returns Number of notes
   */
  readonly totalNotesCount = computed(() => this.notes().length);

  /**
   * Sets the complete notes array
   * @param notes - Array of notes to set
   */
  setNotes(notes: Note[]): void {
    this.notesSignal.set(notes);
  }

  /**
   * Adds a new note to the beginning of the notes array
   * @param note - Note to add
   */
  addNote(note: Note): void {
    this.notesSignal.update(notes => [note, ...notes]);
  }

  /**
   * Updates an existing note by replacing it with the updated version
   * @param updatedNote - Updated note data
   */
  updateNote(updatedNote: Note): void {
    this.notesSignal.update(notes => 
      notes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  }

  /**
   * Removes a note by ID. LinkedSignal automatically cleans up selected note if deleted
   * @param noteId - ID of note to delete
   */
  deleteNote(noteId: string): void {
    this.notesSignal.update(notes => notes.filter(note => note.id !== noteId));
  }

  /**
   * Sets the currently selected note
   * @param note - Note to select or null to deselect
   */
  setSelectedNote(note: Note | null): void {
    this.selectedNoteLinked.set(note);
  }

  /**
   * Sets the loading state
   * @param loading - Loading state
   */
  setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  /**
   * Sets error message or clears error
   * @param error - Error message or null to clear
   */
  setError(error: string | null): void {
    this.errorSignal.set(error);
  }

  /**
   * Helper method for Set operations following DRY principle
   * @param targetSignal - Signal containing Set to modify
   * @param operation - Operation to perform ('add' or 'delete')
   * @param id - ID to add or remove from Set
   */
  private updateIdSet(targetSignal: typeof this.updatingIdsSignal, operation: 'add' | 'delete', id: string): void {
    targetSignal.update((currentSet: Set<string>) => {
      const newSet = new Set(currentSet);
      operation === 'add' ? newSet.add(id) : newSet.delete(id);
      return newSet;
    });
  }

  /**
   * Sets the creating state for notes
   * @param value - Creating state
   */
  setCreating(value: boolean): void {
    this.isCreatingSignal.set(value);
  }

  /**
   * Marks a note as being updated
   * @param id - ID of note being updated
   */
  startUpdating(id: string): void {
    this.updateIdSet(this.updatingIdsSignal, 'add', id);
  }

  /**
   * Removes update state for a note
   * @param id - ID of note no longer being updated
   */
  stopUpdating(id: string): void {
    this.updateIdSet(this.updatingIdsSignal, 'delete', id);
  }

  /**
   * Checks if a note is currently being updated
   * @param id - ID of note to check
   * @returns True if note is being updated
   */
  isUpdating(id: string): boolean {
    return this.updatingIdsSignal().has(id);
  }

  /**
   * Marks a note as being deleted
   * @param id - ID of note being deleted
   */
  startDeleting(id: string): void {
    this.updateIdSet(this.deletingIdsSignal, 'add', id);
  }

  /**
   * Removes delete state for a note
   * @param id - ID of note no longer being deleted
   */
  stopDeleting(id: string): void {
    this.updateIdSet(this.deletingIdsSignal, 'delete', id);
  }

  /**
   * Checks if a note is currently being deleted
   * @param id - ID of note to check
   * @returns True if note is being deleted
   */
  isDeleting(id: string): boolean {
    return this.deletingIdsSignal().has(id);
  }

  /**
   * Updates the search term filter
   * @param searchTerm - Search term to filter notes
   */
  setSearchTerm(searchTerm: string): void {
    this.filterSignal.update(filter => ({ ...filter, searchTerm }));
  }

  /**
   * Updates the selected tags filter
   * @param selectedTags - Array of tags to filter by
   */
  setSelectedTags(selectedTags: string[]): void {
    this.filterSignal.update(filter => ({ ...filter, selectedTags }));
  }

  /**
   * Updates the selected color filter
   * @param selectedColor - Color to filter by or undefined for all colors
   */
  setSelectedColor(selectedColor: NoteColor | undefined): void {
    this.filterSignal.update(filter => ({ ...filter, selectedColor }));
  }

  /**
   * Updates the pinned-only filter
   * @param showPinnedOnly - True to show only pinned notes
   */
  setShowPinnedOnly(showPinnedOnly: boolean): void {
    this.filterSignal.update(filter => ({ ...filter, showPinnedOnly }));
  }

  /**
   * Resets all filters to default values
   */
  clearFilters(): void {
    this.filterSignal.set({
      searchTerm: '',
      selectedTags: [],
      selectedColor: undefined,
      showPinnedOnly: false
    });
  }
}