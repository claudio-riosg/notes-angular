import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Notes } from './notes';
import { NotesService } from '@core/services';

class NotesServiceMock {
  notes = jest.fn(() => [] as any);
  pinnedNotes = jest.fn(() => [] as any);
  unpinnedNotes = jest.fn(() => [] as any);
  totalNotesCount = jest.fn(() => 0 as any);
  error = jest.fn(() => null as any);
  isLoading = jest.fn(() => false as any);
  allTags = jest.fn(() => [] as any);
  filter = jest.fn(() => ({ searchTerm: '', selectedTags: [], showPinnedOnly: false } as any));
  hasActiveFilters = jest.fn(() => false);
  isCreating = jest.fn(() => false as any);
  togglePinNote = jest.fn();
  toggleTag = jest.fn();
  setSearchTerm = jest.fn();
  setSelectedTags = jest.fn();
  togglePinnedFilter = jest.fn();
  clearFilters = jest.fn();
  loadNotes = jest.fn();
  updateNote = jest.fn();
  createNote = jest.fn();
  deleteNote = jest.fn();
}

describe('Notes container', () => {
  let component: Notes;
  let fixture: ComponentFixture<Notes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notes],
      providers: [{ provide: NotesService, useClass: NotesServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Notes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getEmptyTitle should reflect active filters', () => {
    const svc = TestBed.inject(NotesService) as unknown as NotesServiceMock;
    svc.hasActiveFilters.mockReturnValueOnce(true);
    expect(component.getEmptyTitle()).toBe('No matching notes');
  });
});


