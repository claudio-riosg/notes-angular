import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Notes } from './notes';
import { NotesService } from '@core/services';

class NotesServiceMock {
  // Signal-based mocks that return values like real signals
  notes = signal([]);
  pinnedNotes = signal([]);
  unpinnedNotes = signal([]);
  totalNotesCount = signal(0);
  error = signal(null);
  isLoading = signal(false);
  allTags = signal([]);
  filter = signal({ searchTerm: '', selectedTags: [], showPinnedOnly: false });
  hasActiveFilters = signal(false);
  isCreating = signal(false);
  
  // Method mocks
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
  duplicateNote = jest.fn();
  isUpdating = jest.fn(() => false);
  isDeleting = jest.fn(() => false);
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
    svc.hasActiveFilters.set(true);
    expect(component.getEmptyTitle()).toBe('No matching notes');
  });
});


