import { NotesStateStore } from './notes-state-store';
import { Note } from '@core/models';

describe('NotesStateStore', () => {
  let service: NotesStateStore;

  beforeEach(() => {
    service = new NotesStateStore();
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

  // 🎯 Test específico para linkedSignal behavior
  describe('linkedSignal selectedNote auto-reset', () => {
    it('should auto-reset selectedNote when the selected note is deleted from notes array', () => {
      const note1 = makeNote('1');
      const note2 = makeNote('2');
      const note3 = makeNote('3');
      
      // Setup initial state
      service.setNotes([note1, note2, note3]);
      service.setSelectedNote(note2);
      expect(service.selectedNote()?.id).toBe('2');
      
      // Delete the selected note
      service.deleteNote('2');
      
      // LinkedSignal should auto-reset selectedNote to null
      expect(service.selectedNote()).toBeNull();
      expect(service.notes().length).toBe(2);
      expect(service.notes().map(n => n.id)).toEqual(['1', '3']);
    });

    it('should preserve selectedNote when a different note is deleted', () => {
      const note1 = makeNote('1');
      const note2 = makeNote('2'); 
      const note3 = makeNote('3');
      
      service.setNotes([note1, note2, note3]);
      service.setSelectedNote(note2);
      expect(service.selectedNote()?.id).toBe('2');
      
      // Delete a different note
      service.deleteNote('3');
      
      // SelectedNote should remain unchanged
      expect(service.selectedNote()?.id).toBe('2');
      expect(service.notes().length).toBe(2);
    });

    it('should handle manual selectedNote changes correctly', () => {
      const note1 = makeNote('1');
      const note2 = makeNote('2');
      
      service.setNotes([note1, note2]);
      service.setSelectedNote(note1);
      expect(service.selectedNote()?.id).toBe('1');
      
      // Manual change should work
      service.setSelectedNote(note2);
      expect(service.selectedNote()?.id).toBe('2');
      
      // Clear selection manually
      service.setSelectedNote(null);
      expect(service.selectedNote()).toBeNull();
    });
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


