/**
 * Base note entity with core properties
 */
interface BaseNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
}

/**
 * Timestamp fields for entities
 */
interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Core note entity representing a user's note
 */
export interface Note extends BaseNote, TimestampFields {}

/**
 * Data transfer object for note API responses
 */
export interface NoteDto extends BaseNote {
  createdAt: string;
  updatedAt: string;
}

/**
 * Required fields for note creation
 */
type CreateNoteRequiredFields = Pick<BaseNote, 'title' | 'content'>;

/**
 * Optional fields for note creation
 */
type CreateNoteOptionalFields = Partial<Pick<BaseNote, 'tags' | 'color' | 'isPinned'>>;

/**
 * Request payload for creating a new note
 */
export interface CreateNoteRequest extends CreateNoteRequiredFields, CreateNoteOptionalFields {}

/**
 * Request payload for updating an existing note
 */
export interface UpdateNoteRequest extends Pick<BaseNote, 'id'>, Partial<Omit<BaseNote, 'id'>> {}

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


