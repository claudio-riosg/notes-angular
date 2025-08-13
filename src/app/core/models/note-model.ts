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

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  color?: NoteColor;
  isPinned?: boolean;
}

export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'gray';

export interface NotesFilter {
  searchTerm: string;
  selectedTags: string[];
  selectedColor?: NoteColor;
  showPinnedOnly: boolean;
}

export interface NotesState {
  notes: Note[];
  filter: NotesFilter;
  isLoading: boolean;
  selectedNote: Note | null;
  error: string | null;
}