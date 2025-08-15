import { Injectable, signal, computed } from '@angular/core';
import { Note, NotesFilter, NoteColor } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class NotesStateStore {
  private notesSignal = signal<Note[]>([]);
  private selectedNoteSignal = signal<Note | null>(null);
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

  // Read-only computed signals
  readonly notes = this.notesSignal.asReadonly();
  readonly selectedNote = this.selectedNoteSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly filter = this.filterSignal.asReadonly();
  readonly isCreating = this.isCreatingSignal.asReadonly();

  // Computed derived state
  readonly allTags = computed(() => {
    const notes = this.notes();
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  });

  readonly pinnedNotes = computed(() => 
    this.notes().filter(note => note.isPinned)
  );

  readonly unpinnedNotes = computed(() => 
    this.notes().filter(note => !note.isPinned)
  );

  readonly totalNotesCount = computed(() => this.notes().length);

  // State mutations
  setNotes(notes: Note[]): void {
    this.notesSignal.set(notes);
  }

  addNote(note: Note): void {
    this.notesSignal.update(notes => [note, ...notes]);
  }

  updateNote(updatedNote: Note): void {
    this.notesSignal.update(notes => 
      notes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  }

  deleteNote(noteId: string): void {
    this.notesSignal.update(notes => notes.filter(note => note.id !== noteId));
    // Clear selected note if it was deleted
    if (this.selectedNote()?.id === noteId) {
      this.selectedNoteSignal.set(null);
    }
  }

  setSelectedNote(note: Note | null): void {
    this.selectedNoteSignal.set(note);
  }

  setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  setError(error: string | null): void {
    this.errorSignal.set(error);
  }

  // Helper method for Set operations - DRY principle
  private updateIdSet(targetSignal: typeof this.updatingIdsSignal, operation: 'add' | 'delete', id: string): void {
    targetSignal.update((currentSet: Set<string>) => {
      const newSet = new Set(currentSet);
      operation === 'add' ? newSet.add(id) : newSet.delete(id);
      return newSet;
    });
  }

  // Per-operation signals
  setCreating(value: boolean): void {
    this.isCreatingSignal.set(value);
  }

  startUpdating(id: string): void {
    this.updateIdSet(this.updatingIdsSignal, 'add', id);
  }

  stopUpdating(id: string): void {
    this.updateIdSet(this.updatingIdsSignal, 'delete', id);
  }

  isUpdating(id: string): boolean {
    return this.updatingIdsSignal().has(id);
  }

  startDeleting(id: string): void {
    this.updateIdSet(this.deletingIdsSignal, 'add', id);
  }

  stopDeleting(id: string): void {
    this.updateIdSet(this.deletingIdsSignal, 'delete', id);
  }

  isDeleting(id: string): boolean {
    return this.deletingIdsSignal().has(id);
  }

  // Filter mutations
  setSearchTerm(searchTerm: string): void {
    this.filterSignal.update(filter => ({ ...filter, searchTerm }));
  }

  setSelectedTags(selectedTags: string[]): void {
    this.filterSignal.update(filter => ({ ...filter, selectedTags }));
  }

  setSelectedColor(selectedColor: NoteColor | undefined): void {
    this.filterSignal.update(filter => ({ ...filter, selectedColor }));
  }

  setShowPinnedOnly(showPinnedOnly: boolean): void {
    this.filterSignal.update(filter => ({ ...filter, showPinnedOnly }));
  }

  clearFilters(): void {
    this.filterSignal.set({
      searchTerm: '',
      selectedTags: [],
      selectedColor: undefined,
      showPinnedOnly: false
    });
  }
}