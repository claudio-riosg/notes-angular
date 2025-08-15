import { TestBed } from '@angular/core/testing';
import { NotesService } from './notes-facade';
import { NotesStateService } from './notes-state';
import { NotesFilterService } from './notes-filter';
import { NotesApiClient } from './notes-api-client';
import { of } from 'rxjs';

class NotesApiClientMock {
  getNotes = jest.fn(() => of([]));
  createNote = jest.fn(() => of({
    id: 'x', title: 't', content: 'c', createdAt: new Date(), updatedAt: new Date(), tags: [], color: 'yellow', isPinned: false
  }));
  updateNote = jest.fn(() => of({
    id: 'x', title: 't2', content: 'c2', createdAt: new Date(), updatedAt: new Date(), tags: [], color: 'yellow', isPinned: false
  }));
  deleteNote = jest.fn(() => of(void 0));
}

describe('NotesService (facade)', () => {
  let service: NotesService;
  let api: NotesApiClientMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotesService,
        NotesStateService,
        NotesFilterService,
        { provide: NotesApiClient, useClass: NotesApiClientMock },
      ],
    });
    service = TestBed.inject(NotesService);
    api = TestBed.inject(NotesApiClient) as unknown as NotesApiClientMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadNotes should call data.fetchNotes and set state', async () => {
    await service.loadNotes();
    expect(api.getNotes).toHaveBeenCalled();
  });

  it('createNote should add note', async () => {
    const created = await service.createNote({ title: 't', content: 'c', tags: [], color: 'yellow', isPinned: false });
    expect(created?.id).toBe('x');
  });

  it('updateNote should update and possibly set selectedNote', async () => {
    const updated = await service.updateNote({ id: 'x', title: 't2' });
    expect(updated?.title).toBe('t2');
  });

  it('deleteNote should remove and return true', async () => {
    const ok = await service.deleteNote('x');
    expect(ok).toBe(true);
  });

  it('togglePinNote should call updateNote indirectly', () => {
    const spy = jest.spyOn(service, 'updateNote');
    (service as any).notesStateService.setNotes([{ id: 'a', title: 't', content: 'c', createdAt: new Date(), updatedAt: new Date(), tags: [], color: 'yellow', isPinned: false }]);
    service.togglePinNote('a');
    expect(spy).toHaveBeenCalled();
  });
});


