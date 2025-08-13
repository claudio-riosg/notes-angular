import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteCard } from './note-card';
import { provideHttpClient } from '@angular/common/http';
import { NotesService } from '@core/services';
import { NotesApiClient } from '@core/services/notes/notes-api-client';

class NotesApiClientMock {
  getNotes = jest.fn();
  createNote = jest.fn();
  updateNote = jest.fn();
  deleteNote = jest.fn();
}
import { Note } from '@core/models';

describe('NoteCard', () => {
  let component: NoteCard;
  let fixture: ComponentFixture<NoteCard>;

  const note: Note = {
    id: '1', title: 'Title', content: 'Content', createdAt: new Date(), updatedAt: new Date(), tags: ['a'], color: 'yellow', isPinned: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteCard],
      providers: [
        provideHttpClient(),
        NotesService,
        { provide: NotesApiClient, useClass: NotesApiClientMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('note', note);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cardClick on click', () => {
    const spy = jest.fn();
    component.cardClick.subscribe(spy);
    component.onCardClick();
    expect(spy).toHaveBeenCalledWith(note);
  });
});


