import { NotesStateService } from './notes-state';
import { Note } from '../../../core/models';

describe('NotesStateService', () => {
  let service: NotesStateService;

  beforeEach(() => {
    service = new NotesStateService();
  });

  function makeNote(id: string, overrides: Partial<Note> = {}): Note {
    const now = new Date();
    return {
      id,
      title: `Title ${id}`,
      content: `Content ${id}`,
      createdAt: now,
      updatedAt: now,
      tags: [],
      color: 'yellow',
      isPinned: false,
      ...overrides,
    };
  }

  it('adds, updates and deletes notes', () => {
    const a = makeNote('a');
    const b = makeNote('b');
    service.setNotes([a]);
    expect(service.notes().length).toBe(1);

    service.addNote(b);
    expect(service.notes().map(n => n.id)).toEqual(['b', 'a']);

    const bUpdated = { ...b, title: 'Updated' };
    service.updateNote(bUpdated);
    expect(service.notes().find(n => n.id === 'b')?.title).toBe('Updated');

    service.deleteNote('b');
    expect(service.notes().map(n => n.id)).toEqual(['a']);
  });

  it('manages selected note and clears it when deleted', () => {
    const a = makeNote('a');
    const b = makeNote('b');
    service.setNotes([a, b]);
    service.setSelectedNote(b);
    expect(service.selectedNote()?.id).toBe('b');

    service.deleteNote('b');
    expect(service.selectedNote()).toBeNull();
  });

  it('computes allTags and totalNotesCount', () => {
    const a = makeNote('a', { tags: ['x', 'y'] });
    const b = makeNote('b', { tags: ['y', 'z'] });
    service.setNotes([a, b]);

    expect(service.totalNotesCount()).toBe(2);
    expect(service.allTags()).toEqual(['x', 'y', 'z']);
  });

  it('updates filter parts with dedicated setters', () => {
    service.setSearchTerm('abc');
    service.setSelectedTags(['t1']);
    service.setSelectedColor('blue');
    service.setShowPinnedOnly(true);

    const f = service.filter();
    expect(f.searchTerm).toBe('abc');
    expect(f.selectedTags).toEqual(['t1']);
    expect(f.selectedColor).toBe('blue');
    expect(f.showPinnedOnly).toBe(true);

    service.clearFilters();
    const cleared = service.filter();
    expect(cleared.searchTerm).toBe('');
    expect(cleared.selectedTags).toEqual([]);
    expect(cleared.selectedColor).toBeUndefined();
    expect(cleared.showPinnedOnly).toBe(false);
  });
});


