import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotesGrid } from './notes-grid';
import { Note } from '@core/models';
import { provideHttpClient } from '@angular/common/http';
import { NotesService } from '@core/services';
import { NotesApiClient } from '@core/services/notes/notes-api-client';

class NotesApiClientMock {
  getNotes = jest.fn();
  createNote = jest.fn();
  updateNote = jest.fn();
  deleteNote = jest.fn();
}

describe('NotesGrid', () => {
  let component: NotesGrid;
  let fixture: ComponentFixture<NotesGrid>;

  const pinned: Note[] = [{ id: '1', title: 'a', content: 'c', createdAt: new Date(), updatedAt: new Date(), tags: [], color: 'yellow', isPinned: true }];
  const unpinned: Note[] = [{ id: '2', title: 'b', content: 'd', createdAt: new Date(), updatedAt: new Date(), tags: [], color: 'blue', isPinned: false }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesGrid],
      providers: [
        provideHttpClient(),
        NotesService,
        { provide: NotesApiClient, useClass: NotesApiClientMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pinnedNotes', pinned);
    fixture.componentRef.setInput('unpinnedNotes', unpinned);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit createNote', () => {
    const spy = jest.fn();
    component.createNote.subscribe(spy);
    component.onCreateNote();
    expect(spy).toHaveBeenCalled();
  });
});


