import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Note, CreateNoteRequest, UpdateNoteRequest, NotesFilter, NoteDto } from '@core/models';


/**
 * HTTP client service for notes API operations
 */
@Injectable({ providedIn: 'root' })
export class NotesApiClient {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/notes';

  /**
   * Retrieves notes with optional filtering
   * @param filters - Optional filters to apply
   * @returns Observable of filtered notes array
   */
  getNotes(filters?: NotesFilter): Observable<Note[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.searchTerm) params = params.set('search', filters.searchTerm);
      if (filters.selectedTags?.length) params = params.set('tags', filters.selectedTags.join(','));
      if (filters.selectedColor) params = params.set('color', filters.selectedColor);
      if (filters.showPinnedOnly) params = params.set('pinned', 'true');
    }
    return this.http
      .get<NoteDto[]>(this.baseUrl, { params })
      .pipe(map((dtos) => dtos.map(mapNoteDtoToModel)));
  }

  /**
   * Creates a new note
   * @param payload - Note creation data
   * @returns Observable of created note
   */
  createNote(payload: CreateNoteRequest): Observable<Note> {
    return this.http.post<NoteDto>(this.baseUrl, payload).pipe(map(mapNoteDtoToModel));
  }

  /**
   * Updates an existing note
   * @param payload - Note update data including ID
   * @returns Observable of updated note
   */
  updateNote(payload: UpdateNoteRequest): Observable<Note> {
    return this.http.patch<NoteDto>(`${this.baseUrl}/${payload.id}`, payload).pipe(map(mapNoteDtoToModel));
  }

  /**
   * Deletes a note by ID
   * @param id - ID of note to delete
   * @returns Observable that completes when deletion is done
   */
  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

/**
 * Maps API DTO to domain model with date conversion
 * @param dto - Note DTO from API
 * @returns Note domain model
 */
function mapNoteDtoToModel(dto: NoteDto): Note {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}


