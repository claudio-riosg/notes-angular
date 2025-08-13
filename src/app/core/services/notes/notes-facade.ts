import { Injectable, inject, computed, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { switchMap, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { NotesStateService } from './notes-state';
import { NotesFilterService } from './notes-filter';
import { Note, CreateNoteRequest, UpdateNoteRequest, NoteColor } from '@core/models';
import { NotesApiClient } from './notes-api-client';

/**
 * Facade de dominio para Notas (signal-first).
 *
 * Responsabilidades:
 * - Orquestar carga/guardado de datos (delegando en data service)
 * - Exponer estado readonly desde el state service
 * - Definir estado derivado con `computed()`
 * - Gestionar efectos de auto-guardado y carga inicial
 * - Ofrecer API CRUD + filtros/selección para contenedores
 *
 * No contiene lógica de UI ni detalles de presentación.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private notesStateService = inject(NotesStateService);
  private notesApiClient = inject(NotesApiClient);
  private notesFilterService = inject(NotesFilterService);

  // Reactive data loading with platform awareness
  private notesData = toSignal(
    // Skip reactive chain during SSR
    !this.isBrowser 
      ? of([])
      : toObservable(this.notesStateService.filter).pipe(
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
          switchMap(() => this.notesApiClient.getNotes(this.notesStateService.filter())),
          catchError(error => {
            this.notesStateService.setError(error.message || 'Failed to load notes');
            return of([]);
          })
        ),
    { initialValue: [] }
  );

  // Public readonly signals (expuestos a componentes contenedores)
  readonly notes = this.notesStateService.notes;
  readonly selectedNote = this.notesStateService.selectedNote;
  readonly isLoading = this.notesStateService.isLoading;
  readonly error = this.notesStateService.error;
  readonly filter = this.notesStateService.filter;
  readonly allTags = this.notesStateService.allTags;
  readonly totalNotesCount = this.notesStateService.totalNotesCount;
  readonly isCreating = this.notesStateService.isCreating;

  // Computed derived state (estado derivado solo-lectura)
  readonly filteredNotes = computed(() => {
    const notes = this.notes();
    const filter = this.filter();
    const filtered = this.notesFilterService.filterNotes(notes, filter);
    return this.notesFilterService.sortNotes(filtered);
  });

  readonly pinnedNotes = computed(() => 
    this.filteredNotes().filter(note => note.isPinned)
  );

  readonly unpinnedNotes = computed(() => 
    this.filteredNotes().filter(note => !note.isPinned)
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

  // Per-operation read helpers for UI (delegated to state service)
  isUpdating = (id: string) => this.notesStateService.isUpdating(id);
  isDeleting = (id: string) => this.notesStateService.isDeleting(id);

  readonly notesStats = computed(() => {
    const notes = this.notes();
    return this.notesFilterService.getNotesStats(notes);
  });

  constructor() {
    // Efectos: carga inicial + auto-guardado (solo en browser)
    if (this.isBrowser) {
      effect(() => {
        const notes = this.notesData();
        this.notesStateService.setNotes(notes);
      });
    }
  }

  // Notes CRUD operations (API de dominio)
  async loadNotes(): Promise<void> {
    try {
      this.notesStateService.setLoading(true);
      this.notesStateService.setError(null);
      const notes = await firstValueFrom(this.notesApiClient.getNotes(this.notesStateService.filter()));
      if (notes) {
        this.notesStateService.setNotes(notes);
      }
    } catch (error: any) {
      this.notesStateService.setError(error.message || 'Failed to load notes');
    } finally {
      this.notesStateService.setLoading(false);
    }
  }

  async createNote(request: CreateNoteRequest): Promise<Note | null> {
    try {
      this.notesStateService.setCreating(true);
      this.notesStateService.setError(null);
      const note = await firstValueFrom(this.notesApiClient.createNote(request));
      if (note) {
        this.notesStateService.addNote(note);
        return note;
      }
      return null;
    } catch (error: any) {
      this.notesStateService.setError(error.message || 'Failed to create note');
      return null;
    } finally {
      this.notesStateService.setCreating(false);
    }
  }

  async updateNote(request: UpdateNoteRequest): Promise<Note | null> {
    try {
      this.notesStateService.startUpdating(request.id);
      this.notesStateService.setError(null);
      const updatedNote = await firstValueFrom(this.notesApiClient.updateNote(request));
      if (updatedNote) {
        this.notesStateService.updateNote(updatedNote);
        if (this.selectedNote()?.id === updatedNote.id) {
          this.notesStateService.setSelectedNote(updatedNote);
        }
        return updatedNote;
      }
      return null;
    } catch (error: any) {
      this.notesStateService.setError(error.message || 'Failed to update note');
      return null;
    } finally {
      this.notesStateService.stopUpdating(request.id);
    }
  }

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      this.notesStateService.startDeleting(noteId);
      this.notesStateService.setError(null);
      await firstValueFrom(this.notesApiClient.deleteNote(noteId));
      this.notesStateService.deleteNote(noteId);
      return true;
    } catch (error: any) {
      this.notesStateService.setError(error.message || 'Failed to delete note');
      return false;
    } finally {
      this.notesStateService.stopDeleting(noteId);
    }
  }

  // Selection methods
  selectNote(note: Note): void {
    this.notesStateService.setSelectedNote(note);
  }

  clearSelection(): void {
    this.notesStateService.setSelectedNote(null);
  }

  // Filter methods
  setSearchTerm(searchTerm: string): void {
    this.notesStateService.setSearchTerm(searchTerm);
  }

  setSelectedTags(tags: string[]): void {
    this.notesStateService.setSelectedTags(tags);
  }

  toggleTag(tag: string): void {
    const currentTags = this.filter().selectedTags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    this.notesStateService.setSelectedTags(newTags);
  }

  setColorFilter(color: NoteColor | undefined): void {
    this.notesStateService.setSelectedColor(color);
  }

  togglePinnedFilter(): void {
    const current = this.filter().showPinnedOnly;
    this.notesStateService.setShowPinnedOnly(!current);
  }

  clearFilters(): void {
    this.notesStateService.clearFilters();
  }

  // Utility methods
  togglePinNote(noteId: string): void {
    const note = this.notes().find(n => n.id === noteId);
    if (note) {
      void this.updateNote({
        id: noteId,
        isPinned: !note.isPinned
      });
    }
  }

  duplicateNote(noteId: string): void {
    const note = this.notes().find(n => n.id === noteId);
    if (note) {
      void this.createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        tags: [...note.tags],
        color: note.color,
        isPinned: false
      });
    }
  }
}