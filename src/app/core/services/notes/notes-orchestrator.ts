import {
  Injectable,
  inject,
  computed,
  effect,
  signal,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { toSignal, toObservable } from "@angular/core/rxjs-interop";
import {
  switchMap,
  catchError,
  of,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
} from "rxjs";
import { NotesStateStore } from "./notes-state-store";
import { NotesFilterUtils } from "./notes-filter-utils";
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteColor,
} from "@core/models";
import { NotesApiClient } from "./notes-api-client";

/**
 * Domain orchestrator for Notes using signal-first architecture
 * 
 * Manages CRUD operations with trigger-based patterns and reactive data streams
 */
@Injectable({ providedIn: "root" })
export class NotesOrchestrator {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private stateStore = inject(NotesStateStore);
  private apiClient = inject(NotesApiClient);
  private filterUtils = inject(NotesFilterUtils);

  private createTrigger = signal<CreateNoteRequest | null>(null);
  private updateTrigger = signal<UpdateNoteRequest | null>(null);
  private deleteTrigger = signal<string | null>(null);

  private notesData = toSignal(
    !this.isBrowser
      ? of([])
      : toObservable(this.stateStore.filter).pipe(
          debounceTime(200),
          distinctUntilChanged((prev, curr) => {
            if (prev.searchTerm !== curr.searchTerm) return false;
            if (prev.selectedColor !== curr.selectedColor) return false;
            if (prev.showPinnedOnly !== curr.showPinnedOnly) return false;
            const a = prev.selectedTags;
            const b = curr.selectedTags;
            if (a.length !== b.length) return false;
            const setB = new Set(b);
            for (let i = 0; i < a.length; i++) {
              if (!setB.has(a[i])) return false;
            }
            return true;
          }),
          switchMap(() => this.apiClient.getNotes(this.stateStore.filter())),
          catchError((error) => {
            this.stateStore.setError(error.message || "Failed to load notes");
            return of([]);
          })
        ),
    { initialValue: [] }
  );

  readonly notes = this.stateStore.notes;
  readonly selectedNote = this.stateStore.selectedNote;
  readonly isLoading = this.stateStore.isLoading;
  readonly error = this.stateStore.error;
  readonly filter = this.stateStore.filter;
  readonly allTags = this.stateStore.allTags;
  readonly totalNotesCount = this.stateStore.totalNotesCount;
  readonly isCreating = this.stateStore.isCreating;

  /**
   * Gets filtered and sorted notes based on current filter criteria
   * @returns Filtered notes array
   */
  readonly filteredNotes = computed(() => {
    const notes = this.notes();
    const filter = this.filter();
    const filtered = this.filterUtils.filterNotes(notes, filter);
    return this.filterUtils.sortNotes(filtered);
  });

  /**
   * Gets filtered pinned notes
   * @returns Pinned notes from filtered results
   */
  readonly pinnedNotes = computed(() =>
    this.filteredNotes().filter((note) => note.isPinned)
  );

  /**
   * Gets filtered unpinned notes
   * @returns Unpinned notes from filtered results
   */
  readonly unpinnedNotes = computed(() =>
    this.filteredNotes().filter((note) => !note.isPinned)
  );

  /**
   * Checks if any filters are currently active
   * @returns True if any filter is applied
   */
  readonly hasActiveFilters = computed(() => {
    const filter = this.filter();
    return !!(
      filter.searchTerm ||
      filter.selectedTags.length > 0 ||
      filter.selectedColor ||
      filter.showPinnedOnly
    );
  });

  /**
   * Checks if a note is currently being updated
   * @param id - Note ID to check
   * @returns True if note is being updated
   */
  isUpdating = (id: string) => this.stateStore.isUpdating(id);
  
  /**
   * Checks if a note is currently being deleted
   * @param id - Note ID to check
   * @returns True if note is being deleted
   */
  isDeleting = (id: string) => this.stateStore.isDeleting(id);

  /**
   * Gets statistics about all notes
   * @returns Notes statistics including counts by color, tags, etc.
   */
  readonly notesStats = computed(() => {
    const notes = this.notes();
    return this.filterUtils.getNotesStats(notes);
  });

  constructor() {
      effect(() => {
        const notes = this.notesData();
        this.stateStore.setNotes(notes);
      });
    toSignal(
      toObservable(this.createTrigger).pipe(
        filter((request): request is CreateNoteRequest => request !== null),
        tap(() => {
          this.stateStore.setCreating(true);
          this.stateStore.setError(null);
        }),
        switchMap(request => 
          this.apiClient.createNote(request).pipe(
            tap(note => {
              this.stateStore.addNote(note);
              this.stateStore.setCreating(false);
              this.createTrigger.set(null); // Reset for next
            }),
            catchError((error) => {
              this.stateStore.setError(error.message || "Failed to create note");
              this.stateStore.setCreating(false);
              this.createTrigger.set(null);
              return of(null);
            })
          )
        )
      ),
      { initialValue: null }
    );

    toSignal(
      toObservable(this.updateTrigger).pipe(
        filter((request): request is UpdateNoteRequest => request !== null),
        tap(request => {
          this.stateStore.startUpdating(request.id);
          this.stateStore.setError(null);
        }),
        switchMap(request =>
          this.apiClient.updateNote(request).pipe(
            tap(note => {
              this.stateStore.updateNote(note);
              if (this.stateStore.selectedNote()?.id === note.id) {
                this.stateStore.setSelectedNote(note);
              }
              this.stateStore.stopUpdating(request.id);
              this.updateTrigger.set(null);
            }),
            catchError((error) => {
              this.stateStore.setError(error.message || "Failed to update note");
              this.stateStore.stopUpdating(request.id);
              this.updateTrigger.set(null);
              return of(null);
            })
          )
        )
      ),
      { initialValue: null }
    );

    toSignal(
      toObservable(this.deleteTrigger).pipe(
        filter((noteId): noteId is string => noteId !== null),
        tap(noteId => {
          this.stateStore.startDeleting(noteId);
          this.stateStore.setError(null);
        }),
        switchMap(noteId =>
          this.apiClient.deleteNote(noteId).pipe(
            tap(() => {
              this.stateStore.deleteNote(noteId);
              this.stateStore.stopDeleting(noteId);
              this.deleteTrigger.set(null);
            }),
            catchError((error) => {
              this.stateStore.setError(error.message || "Failed to delete note");
              this.stateStore.stopDeleting(noteId);
              this.deleteTrigger.set(null);
              return of(null);
            })
          )
        )
      ),
      { initialValue: null }
    );
  }

  /**
   * Triggers note creation
   * @param request - Note creation data
   */
  createNote(request: CreateNoteRequest): void {
    this.createTrigger.set(request);
  }

  /**
   * Triggers note update
   * @param request - Note update data
   */
  updateNote(request: UpdateNoteRequest): void {
    this.updateTrigger.set(request);
  }

  /**
   * Triggers note deletion
   * @param noteId - ID of note to delete
   */
  deleteNote(noteId: string): void {
    this.deleteTrigger.set(noteId);
  }

  /**
   * Manually triggers notes loading for explicit refresh
   */
  loadNotes(): void {
    this.stateStore.setLoading(true);
    this.stateStore.setError(null);
  }

  /**
   * Selects a note
   * @param note - Note to select
   */
  selectNote(note: Note): void {
    this.stateStore.setSelectedNote(note);
  }

  /**
   * Clears the current note selection
   */
  clearSelection(): void {
    this.stateStore.setSelectedNote(null);
  }

  /**
   * Sets the search term filter
   * @param searchTerm - Search term to apply
   */
  setSearchTerm(searchTerm: string): void {
    this.stateStore.setSearchTerm(searchTerm);
  }

  /**
   * Sets the selected tags filter
   * @param tags - Array of tags to filter by
   */
  setSelectedTags(tags: string[]): void {
    this.stateStore.setSelectedTags(tags);
  }

  /**
   * Toggles a tag in the filter selection
   * @param tag - Tag to toggle
   */
  toggleTag(tag: string): void {
    const currentTags = this.filter().selectedTags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    this.stateStore.setSelectedTags(newTags);
  }

  /**
   * Sets the color filter
   * @param color - Color to filter by or undefined for all colors
   */
  setColorFilter(color: NoteColor | undefined): void {
    this.stateStore.setSelectedColor(color);
  }

  /**
   * Toggles the pinned-only filter
   */
  togglePinnedFilter(): void {
    const current = this.filter().showPinnedOnly;
    this.stateStore.setShowPinnedOnly(!current);
  }

  /**
   * Clears all active filters
   */
  clearFilters(): void {
    this.stateStore.clearFilters();
  }

  /**
   * Toggles the pinned status of a note
   * @param noteId - ID of note to toggle pin status
   */
  togglePinNote(noteId: string): void {
    const note = this.notes().find((n) => n.id === noteId);
    if (note) {
      this.updateNote({
        id: noteId,
        isPinned: !note.isPinned,
      });
    }
  }

  /**
   * Creates a duplicate of an existing note
   * @param noteId - ID of note to duplicate
   */
  duplicateNote(noteId: string): void {
    const note = this.notes().find((n) => n.id === noteId);
    if (note) {
      this.createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        tags: [...note.tags],
        color: note.color,
        isPinned: false,
      });
    }
  }
}