/**
 * Core note entity representing a user's note
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
}

/**
 * Request payload for creating a new note
 */
export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
}

/**
 * Request payload for updating an existing note
 */
export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
}

/**
 * Available colors for notes
 */
export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'gray';

/**
 * Filter criteria for notes search and filtering
 */
export interface NotesFilter {
  searchTerm: string;
  selectedTags: string[];
  selectedColor?: NoteColor;
  showPinnedOnly: boolean;
}

/**
 * Application state shape for notes feature
 */
export interface NotesState {
  notes: Note[];
  filter: NotesFilter;
  isLoading: boolean;
  selectedNote: Note | null;
  error: string | null;
}