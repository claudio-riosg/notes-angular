import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotesOrchestrator } from './notes-orchestrator';
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

describe('NotesOrchestrator', () => {
  let orchestrator: NotesOrchestrator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotesOrchestrator,
        { provide: NotesApiClient, useClass: NotesApiClientMock },
      ],
    });
    orchestrator = TestBed.inject(NotesOrchestrator);
  });

  it('should be created', () => {
    expect(orchestrator).toBeTruthy();
  });

  it('should have initial empty state', () => {
    expect(orchestrator.notes()).toEqual([]);
    expect(orchestrator.isLoading()).toBe(false);
    expect(orchestrator.isCreating()).toBe(false);
    expect(orchestrator.error()).toBeNull();
  });

  it('should have computed properties', () => {
    expect(orchestrator.filteredNotes).toBeDefined();
    expect(orchestrator.pinnedNotes).toBeDefined();
    expect(orchestrator.unpinnedNotes).toBeDefined();
    expect(orchestrator.hasActiveFilters).toBeDefined();
  });

  it('should trigger filter updates', () => {
    orchestrator.setSearchTerm('test');
    expect(orchestrator.filter().searchTerm).toBe('test');
    
    orchestrator.setSelectedTags(['tag1']);
    expect(orchestrator.filter().selectedTags).toEqual(['tag1']);
    
    orchestrator.togglePinnedFilter();
    expect(orchestrator.filter().showPinnedOnly).toBe(true);
  });

  it('should clear filters', () => {
    orchestrator.setSearchTerm('test');
    orchestrator.setSelectedTags(['tag1']);
    orchestrator.togglePinnedFilter();
    
    orchestrator.clearFilters();
    
    const filter = orchestrator.filter();
    expect(filter.searchTerm).toBe('');
    expect(filter.selectedTags).toEqual([]);
    expect(filter.showPinnedOnly).toBe(false);
  });
});


