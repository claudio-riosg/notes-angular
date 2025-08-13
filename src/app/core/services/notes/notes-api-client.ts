import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Note, CreateNoteRequest, UpdateNoteRequest, NotesFilter } from '@core/models';

interface NoteDto {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  tags: string[];
  color: Note['color'];
  isPinned: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotesApiClient {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/notes';

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

  createNote(payload: CreateNoteRequest): Observable<Note> {
    return this.http.post<NoteDto>(this.baseUrl, payload).pipe(map(mapNoteDtoToModel));
  }

  updateNote(payload: UpdateNoteRequest): Observable<Note> {
    return this.http.patch<NoteDto>(`${this.baseUrl}/${payload.id}`, payload).pipe(map(mapNoteDtoToModel));
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

function mapNoteDtoToModel(dto: NoteDto): Note {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}


