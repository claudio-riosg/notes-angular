import { Injectable } from '@angular/core';
import { Note, NotesFilter, NoteColor } from '@core/models';

/**
 * Utility service for filtering and sorting notes with optimized performance
 */
@Injectable({
  providedIn: 'root'
})
export class NotesFilterUtils {
  private readonly diacriticsMap: Record<string, string> = {
    á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n',
    Á: 'a', É: 'e', Í: 'i', Ó: 'o', Ú: 'u', Ü: 'u', Ñ: 'n'
  };

  /**
   * Normalizes text by removing diacritics and converting to lowercase
   * @param value - Text to normalize
   * @returns Normalized text
   */
  private normalizeText(value: string): string {
    if (!value) return '';
    const trimmed = value.toLowerCase().trim();
    let out = '';
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i] as keyof typeof this.diacriticsMap;
      out += this.diacriticsMap[ch] ?? trimmed[i];
    }
    return out;
  }
  
  /**
   * Filters notes based on provided criteria with optimized performance
   * @param notes - Notes array to filter
   * @param filter - Filter criteria to apply
   * @returns Filtered notes array
   */
  filterNotes(notes: Note[], filter: NotesFilter): Note[] {
    const normalizedSearch = this.normalizeText(filter.searchTerm);
    const hasSearch = normalizedSearch.length > 0;
    const selectedTags = filter.selectedTags;
    const hasTagFilter = selectedTags.length > 0;
    const selectedColor = filter.selectedColor;
    const showPinnedOnly = filter.showPinnedOnly;

    return notes.filter(note => {
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

  /**
   * Sorts notes with pinned notes first, then by updated date descending
   * @param notes - Notes array to sort
   * @returns Sorted notes array
   */
  sortNotes(notes: Note[]): Note[] {
    return [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  /**
   * Searches notes by term in title, content, and tags
   * @param notes - Notes array to search
   * @param searchTerm - Term to search for
   * @returns Notes matching search term
   */
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

  /**
   * Filters notes by tags (OR logic - notes with any of the specified tags)
   * @param notes - Notes array to filter
   * @param tags - Tags to filter by
   * @returns Notes containing any of the specified tags
   */
  filterByTags(notes: Note[], tags: string[]): Note[] {
    if (tags.length === 0) {
      return notes;
    }

    return notes.filter(note =>
      tags.some(tag => note.tags.includes(tag))
    );
  }

  /**
   * Filters notes by color
   * @param notes - Notes array to filter
   * @param color - Color to filter by
   * @returns Notes with the specified color
   */
  filterByColor(notes: Note[], color: NoteColor): Note[] {
    return notes.filter(note => note.color === color);
  }

  /**
   * Filters notes by pinned status
   * @param notes - Notes array to filter
   * @param showPinnedOnly - If true, returns only pinned notes
   * @returns Filtered notes based on pinned status
   */
  filterByPinned(notes: Note[], showPinnedOnly: boolean): Note[] {
    if (!showPinnedOnly) {
      return notes;
    }
    
    return notes.filter(note => note.isPinned);
  }

  /**
   * Gets all notes containing a specific tag
   * @param notes - Notes array to filter
   * @param tag - Tag to find
   * @returns Notes containing the specified tag
   */
  getNotesWithTag(notes: Note[], tag: string): Note[] {
    return notes.filter(note => note.tags.includes(tag));
  }

  /**
   * Generates statistics about notes collection
   * @param notes - Notes array to analyze
   * @returns Statistics including total count, pinned count, color distribution, and tag counts
   */
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