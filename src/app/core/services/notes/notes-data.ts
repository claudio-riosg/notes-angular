import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Note, CreateNoteRequest, UpdateNoteRequest, NoteColor } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class NotesDataService {
  private storageKey = 'notes-app-data';

  // Mock data for demonstration
  private mockNotes: Note[] = [
    {
      id: '1',
      title: 'Welcome to Notes App',
      content: 'This is your first note! You can create, edit, and organize your notes using this application. Try adding some tags and changing colors.',
      createdAt: new Date('2025-01-01T10:00:00'),
      updatedAt: new Date('2025-01-01T10:00:00'),
      tags: ['welcome', 'tutorial'],
      color: 'yellow',
      isPinned: true
    },
    {
      id: '2',
      title: 'Angular 20 Signals',
      content: 'Angular 20 introduces signal-based reactivity as a stable feature. Signals provide fine-grained reactivity and better performance.',
      createdAt: new Date('2025-01-02T09:30:00'),
      updatedAt: new Date('2025-01-02T09:30:00'),
      tags: ['angular', 'signals', 'development'],
      color: 'blue',
      isPinned: false
    },
    {
      id: '3',
      title: 'Shopping List',
      content: 'Milk\\nBread\\nEggs\\nApples\\nOrange juice\\nPasta',
      createdAt: new Date('2025-01-03T15:20:00'),
      updatedAt: new Date('2025-01-03T15:20:00'),
      tags: ['shopping', 'groceries'],
      color: 'green',
      isPinned: false
    }
  ];

  fetchNotes(): Observable<Note[]> {
    const stored = this.getStoredNotes();
    const notes = stored.length > 0 ? stored : this.mockNotes;
    
    // Simulate API delay
    return of(notes).pipe(delay(300));
  }

  createNote(request: CreateNoteRequest): Observable<Note> {
    const note: Note = {
      id: this.generateId(),
      title: request.title,
      content: request.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: request.tags || [],
      color: request.color || 'yellow',
      isPinned: request.isPinned || false
    };

    // Simulate API delay
    return of(note).pipe(delay(200));
  }

  updateNote(request: UpdateNoteRequest): Observable<Note> {
    const storedNotes = this.getStoredNotes();
    const existingNote = storedNotes.find(note => note.id === request.id);
    
    if (!existingNote) {
      throw new Error('Note not found');
    }

    const updatedNote: Note = {
      ...existingNote,
      ...request,
      updatedAt: new Date()
    };

    // Simulate API delay
    return of(updatedNote).pipe(delay(200));
  }

  deleteNote(noteId: string): Observable<void> {
    // Simulate API delay
    return of(void 0).pipe(delay(200));
  }

  // Local storage methods
  saveToStorage(notes: Note[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to storage:', error);
    }
  }

  private getStoredNotes(): Note[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load notes from storage:', error);
      return [];
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}