import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoteCard } from './note-card';
import { NotesOrchestrator } from '@core/services';

class NotesOrchestratorMock {
  isUpdating = jest.fn(() => false);
  isDeleting = jest.fn(() => false);
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
        provideHttpClientTesting(),
        { provide: NotesOrchestrator, useClass: NotesOrchestratorMock },
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


