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
 * Orchestrador de dominio para Notas (signal-first puro).
 *
 * Responsabilidades:
 * - Orquesta operaciones CRUD con patrones trigger-based
 * - Convierte HTTP Observables a Signals con toSignal
 * - Maneja streams reactivos de datos principales 
 * - Delega estado a NotesStateStore
 * - Delega filtrado a NotesFilterUtils
 * - API limpia para componentes (solo triggers)
 */
@Injectable({ providedIn: "root" })
export class NotesOrchestrator {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private stateStore = inject(NotesStateStore);
  private apiClient = inject(NotesApiClient);
  private filterUtils = inject(NotesFilterUtils);

  // 🎯 CRUD Triggers (input signals)
  private createTrigger = signal<CreateNoteRequest | null>(null);
  private updateTrigger = signal<UpdateNoteRequest | null>(null);
  private deleteTrigger = signal<string | null>(null);

  // 🎯 Main data stream (reactive loading)
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

  // 🎯 Public readonly signals (delegados al state store)
  readonly notes = this.stateStore.notes;
  readonly selectedNote = this.stateStore.selectedNote;
  readonly isLoading = this.stateStore.isLoading;
  readonly error = this.stateStore.error;
  readonly filter = this.stateStore.filter;
  readonly allTags = this.stateStore.allTags;
  readonly totalNotesCount = this.stateStore.totalNotesCount;
  readonly isCreating = this.stateStore.isCreating;

  // 🎯 Computed derived state (usa filterUtils)
  readonly filteredNotes = computed(() => {
    const notes = this.notes();
    const filter = this.filter();
    const filtered = this.filterUtils.filterNotes(notes, filter);
    return this.filterUtils.sortNotes(filtered);
  });

  readonly pinnedNotes = computed(() =>
    this.filteredNotes().filter((note) => note.isPinned)
  );

  readonly unpinnedNotes = computed(() =>
    this.filteredNotes().filter((note) => !note.isPinned)
  );

  readonly hasActiveFilters = computed(() => {
    const filter = this.filter();
    return !!(
      filter.searchTerm ||
      filter.selectedTags.length > 0 ||
      filter.selectedColor ||
      filter.showPinnedOnly
    );
  });

  // 🎯 Per-operation state helpers
  isUpdating = (id: string) => this.stateStore.isUpdating(id);
  isDeleting = (id: string) => this.stateStore.isDeleting(id);

  readonly notesStats = computed(() => {
    const notes = this.notes();
    return this.filterUtils.getNotesStats(notes);
  });

  constructor() {
    // 🎯 Main data stream effect
    if (this.isBrowser) {
      effect(() => {
        const notes = this.notesData();
        this.stateStore.setNotes(notes);
      });
    }

    // 🎯 CREATE: toSignal auto-processes triggers
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

    // 🎯 UPDATE: toSignal auto-processes triggers
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

    // 🎯 DELETE: toSignal auto-processes triggers
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

  // 🎯 SIGNAL-FIRST CRUD API (solo triggers - sin async/await)
  createNote(request: CreateNoteRequest): void {
    this.createTrigger.set(request);
  }

  updateNote(request: UpdateNoteRequest): void {
    this.updateTrigger.set(request);
  }

  deleteNote(noteId: string): void {
    this.deleteTrigger.set(noteId);
  }

  loadNotes(): void {
    // Reactive loading is handled by notesData signal automatically
    // Manual loading only needed for explicit refresh
    this.stateStore.setLoading(true);
    this.stateStore.setError(null);
  }

  // 🎯 Selection methods (delegadas al state store)
  selectNote(note: Note): void {
    this.stateStore.setSelectedNote(note);
  }

  clearSelection(): void {
    this.stateStore.setSelectedNote(null);
  }

  // 🎯 Filter methods (delegadas al state store)
  setSearchTerm(searchTerm: string): void {
    this.stateStore.setSearchTerm(searchTerm);
  }

  setSelectedTags(tags: string[]): void {
    this.stateStore.setSelectedTags(tags);
  }

  toggleTag(tag: string): void {
    const currentTags = this.filter().selectedTags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    this.stateStore.setSelectedTags(newTags);
  }

  setColorFilter(color: NoteColor | undefined): void {
    this.stateStore.setSelectedColor(color);
  }

  togglePinnedFilter(): void {
    const current = this.filter().showPinnedOnly;
    this.stateStore.setShowPinnedOnly(!current);
  }

  clearFilters(): void {
    this.stateStore.clearFilters();
  }

  // 🎯 Utility methods (Signal-first triggers)
  togglePinNote(noteId: string): void {
    const note = this.notes().find((n) => n.id === noteId);
    if (note) {
      this.updateNote({
        id: noteId,
        isPinned: !note.isPinned,
      });
    }
  }

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