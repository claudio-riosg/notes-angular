import { NotesFilterUtils } from './notes-filter-utils';
import { Note, NotesFilter } from '../../../core/models';

describe('NotesFilterUtils', () => {
  let service: NotesFilterUtils;
  let baseNotes: Note[];

  beforeEach(() => {
    service = new NotesFilterUtils();

    const now = new Date('2025-01-10T10:00:00');
    baseNotes = [
      {
        id: '1',
        title: 'Angular Signals',
        content: 'Learn signal-first patterns',
        createdAt: new Date('2025-01-01T10:00:00'),
        updatedAt: new Date('2025-01-09T12:00:00'),
        tags: ['angular', 'signals'],
        color: 'blue',
        isPinned: true,
      },
      {
        id: '2',
        title: 'Groceries',
        content: 'Milk, Bread, Eggs',
        createdAt: new Date('2025-01-02T10:00:00'),
        updatedAt: new Date('2025-01-08T12:00:00'),
        tags: ['shopping'],
        color: 'green',
        isPinned: false,
      },
      {
        id: '3',
        title: 'Work',
        content: 'Prepare presentation about Angular 20',
        createdAt: new Date('2025-01-03T10:00:00'),
        updatedAt: now,
        tags: ['work', 'angular'],
        color: 'yellow',
        isPinned: false,
      },
    ];
  });

  it('filters by search term across title, content and tags', () => {
    const filter: NotesFilter = {
      searchTerm: 'angul',
      selectedTags: [],
      selectedColor: undefined,
      showPinnedOnly: false,
    };

    const result = service.filterNotes(baseNotes, filter);
    expect(result.map(n => n.id)).toEqual(['1', '3']);
  });

  it('filters by tags (any match)', () => {
    const filter: NotesFilter = {
      searchTerm: '',
      selectedTags: ['signals'],
      selectedColor: undefined,
      showPinnedOnly: false,
    };
    const result = service.filterNotes(baseNotes, filter);
    expect(result.map(n => n.id)).toEqual(['1']);
  });

  it('filters by color and pinned state', () => {
    const filter: NotesFilter = {
      searchTerm: '',
      selectedTags: [],
      selectedColor: 'blue',
      showPinnedOnly: true,
    };
    const result = service.filterNotes(baseNotes, filter);
    expect(result.map(n => n.id)).toEqual(['1']);
  });

  it('sorts pinned first, then by updatedAt desc', () => {
    const filtered = service.filterNotes(baseNotes, {
      searchTerm: '',
      selectedTags: [],
      selectedColor: undefined,
      showPinnedOnly: false,
    });

    const sorted = service.sortNotes(filtered);
    expect(sorted.map(n => n.id)).toEqual(['1', '3', '2']);
  });
});


