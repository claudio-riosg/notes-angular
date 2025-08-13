import { TestBed } from '@angular/core/testing';
import { NotesDataService } from './notes-data';
import { firstValueFrom } from 'rxjs';

describe('NotesDataService', () => {
  let service: NotesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchNotes should return notes (mock or stored)', async () => {
    const notes = await firstValueFrom(service.fetchNotes());
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBeGreaterThan(0);
  });

  it('createNote should return a new note with id and timestamps', async () => {
    const note = await firstValueFrom(
      service.createNote({ title: 't', content: 'c', tags: ['x'], color: 'yellow', isPinned: false })
    );
    expect(note.id).toBeTruthy();
    expect(note.createdAt instanceof Date).toBe(true);
    expect(note.updatedAt instanceof Date).toBe(true);
  });

  it('updateNote should throw when id not found', () => {
    expect(() => service['getStoredNotes']()).not.toThrow();
    expect(() => service.updateNote({ id: 'missing', title: 't' } as any)).toThrow('Note not found');
  });

  it('deleteNote should complete', async () => {
    await expect(firstValueFrom(service.deleteNote('1'))).resolves.toBeUndefined();
  });

  it('saveToStorage should call localStorage', () => {
    const spy = jest.spyOn(window.localStorage, 'setItem');
    service.saveToStorage([]);
    expect(spy).toHaveBeenCalled();
  });
});


