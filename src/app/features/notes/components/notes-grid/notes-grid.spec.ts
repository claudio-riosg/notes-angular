import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotesGrid } from './notes-grid';
import { Note } from '@core/models';
import { NotesOrchestrator } from '@core/services';

class NotesOrchestratorMock {
  isUpdating = jest.fn(() => false);
  isDeleting = jest.fn(() => false);
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
        provideHttpClientTesting(),
        { provide: NotesOrchestrator, useClass: NotesOrchestratorMock },
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


