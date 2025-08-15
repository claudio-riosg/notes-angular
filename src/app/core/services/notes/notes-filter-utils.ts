import { Injectable } from '@angular/core';
import { Note, NotesFilter, NoteColor } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class NotesFilterUtils {
  // Precompute for diacritics removal
  private readonly diacriticsMap: Record<string, string> = {
    á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n',
    Á: 'a', É: 'e', Í: 'i', Ó: 'o', Ú: 'u', Ü: 'u', Ñ: 'n'
  };

  private normalizeText(value: string): string {
    if (!value) return '';
    // Lowercase, trim and strip diacritics quickly (avoid heavy regex)
    const trimmed = value.toLowerCase().trim();
    let out = '';
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i] as keyof typeof this.diacriticsMap;
      out += this.diacriticsMap[ch] ?? trimmed[i];
    }
    return out;
  }
  
  filterNotes(notes: Note[], filter: NotesFilter): Note[] {
    // Normalize filter inputs once
    const normalizedSearch = this.normalizeText(filter.searchTerm);
    const hasSearch = normalizedSearch.length > 0;
    const selectedTags = filter.selectedTags;
    const hasTagFilter = selectedTags.length > 0;
    const selectedColor = filter.selectedColor;
    const showPinnedOnly = filter.showPinnedOnly;

    return notes.filter(note => {
      // Search term filter
      if (hasSearch) {
        const titleNorm = this.normalizeText(note.title);
        const contentNorm = this.normalizeText(note.content);
        let matches = titleNorm.includes(normalizedSearch) || contentNorm.includes(normalizedSearch);
        if (!matches && note.tags.length > 0) {
          for (let i = 0; i < note.tags.length; i++) {
            if (this.normalizeText(note.tags[i]).includes(normalizedSearch)) {
              matches = true;
              break;
            }
          }
        }
        if (!matches) {
          return false;
        }
      }

      if (hasTagFilter) {
        let ok = false;
        for (let i = 0; i < selectedTags.length; i++) {
          if (note.tags.includes(selectedTags[i])) { ok = true; break; }
        }
        if (!ok) return false;
      }

      if (selectedColor && note.color !== selectedColor) {
        return false;
      }

      if (showPinnedOnly && !note.isPinned) {
        return false;
      }

      return true;
    });
  }

  sortNotes(notes: Note[]): Note[] {
    return [...notes].sort((a, b) => {
      // Pinned notes come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  searchNotes(notes: Note[], searchTerm: string): Note[] {
    if (!searchTerm.trim()) {
      return notes;
    }

    const searchLower = searchTerm.toLowerCase();
    return notes.filter(note => {
      return (
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  }

  filterByTags(notes: Note[], tags: string[]): Note[] {
    if (tags.length === 0) {
      return notes;
    }

    return notes.filter(note =>
      tags.some(tag => note.tags.includes(tag))
    );
  }

  filterByColor(notes: Note[], color: NoteColor): Note[] {
    return notes.filter(note => note.color === color);
  }

  filterByPinned(notes: Note[], showPinnedOnly: boolean): Note[] {
    if (!showPinnedOnly) {
      return notes;
    }
    
    return notes.filter(note => note.isPinned);
  }

  getNotesWithTag(notes: Note[], tag: string): Note[] {
    return notes.filter(note => note.tags.includes(tag));
  }

  getNotesStats(notes: Note[]) {
    const stats = {
      total: notes.length,
      pinned: 0,
      byColor: {} as Record<NoteColor, number>,
      tagsCount: {} as Record<string, number>
    };

    notes.forEach(note => {
      if (note.isPinned) {
        stats.pinned++;
      }

      stats.byColor[note.color] = (stats.byColor[note.color] || 0) + 1;

      note.tags.forEach(tag => {
        stats.tagsCount[tag] = (stats.tagsCount[tag] || 0) + 1;
      });
    });

    return stats;
  }
}