import { Component, inject, input, output, ChangeDetectionStrategy, signal, computed, effect, linkedSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Note, CreateNoteRequest, UpdateNoteRequest, NoteColor } from '@core/models';

@Component({
  selector: 'note-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.note-form--submitting]': 'isSubmitting()',
    '[class.note-form--edit-mode]': 'isEditMode()',
    '[attr.data-note-color]': 'noteForm.get("color")?.value || null',
    '[style.--note-border-color]': 'getBorderColor()'
  },
  templateUrl: './note-form.html',
  styleUrl: './note-form.css',
})
export class NoteForm {
  private fb = inject(FormBuilder);

  // Inputs
  note = input<Note | null>(null);
  availableTags = input<string[]>([]);
  allNotes = input<Note[]>([]); // Para smart default color
  isSubmitting = input(false);

  // Outputs
  submit = output<CreateNoteRequest | UpdateNoteRequest>();
  cancel = output<void>();

  // Signals
  private _currentTag = signal('');
  private _showSuggestions = signal(false);
  private _temporalTags = signal<string[]>([]);
  private _removedTags = signal<Set<string>>(new Set());
  private _userHasManuallySelectedColor = signal(false); // Para linkedSignal

  readonly currentTag = this._currentTag.asReadonly();
  readonly showSuggestions = this._showSuggestions.asReadonly();
  readonly temporalTags = this._temporalTags.asReadonly();
  readonly removedTags = this._removedTags.asReadonly();

  /**
   * LinkedSignal for smart default color based on user preferences and existing notes.
   * Computes the most frequently used color from existing notes as default.
   * Preserves user manual color selection when specified.
   */
  private smartDefaultColor = linkedSignal<Note[], NoteColor>({
    source: () => this.allNotes(),
    computation: (notes: Note[], previous?: { source: Note[]; value: NoteColor }) => {
     
      if (notes.length === 0) return 'yellow';
      
      if (this._userHasManuallySelectedColor() && previous?.value) {
        return previous.value;
      }

      const colorCounts = notes.reduce((acc, note) => {
        acc[note.color] = (acc[note.color] || 0) + 1;
        return acc;
      }, {} as Record<NoteColor, number>);
      
      const mostUsedColor = Object.entries(colorCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as NoteColor;
      
      return mostUsedColor || 'yellow';
    }
  });

  // Computed properties
  readonly isEditMode = computed(() => !!this.note());
  readonly currentTags = computed(() => this.noteForm.get('tags')?.value || []);
  
  // Computed temporal tags for display
  readonly displayTags = computed(() => {
    const formTags = this.currentTags();
    const temporal = this.temporalTags();
    const removed = this.removedTags();
    
    // In edit mode, show temporal tags, otherwise show form tags
    if (this.isEditMode() && temporal.length > 0) {
      return temporal.filter(tag => !removed.has(tag));
    }
    
    return formTags.filter(tag => !removed.has(tag));
  });
  
  readonly tagsToRemove = computed(() => {
    return Array.from(this.removedTags());
  });

  readonly filteredSuggestions = computed(() => {
    const currentTagValue = this.currentTag().toLowerCase().trim();
    const existingTags = this.currentTags();

    if (!currentTagValue) return [];

    return this.availableTags()
      .filter(tag =>
        tag.toLowerCase().includes(currentTagValue) &&
        !existingTags.includes(tag)
      )
      .slice(0, 6);
  });

  // Available colors
  readonly availableColors: NoteColor[] = [
    'yellow',
    'blue',
    'gray',
    'green',
    'orange',
    'pink',
    'purple',
    'red'
  ];

  // Reactive Form
  noteForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10000)]],
    tags: [[] as string[]],
    color: ['yellow'],
    isPinned: [false]
  });

  constructor() {
    effect(() => {
      const note = this.note();
      if (note) {
        this.noteForm.patchValue({
          title: note.title,
          content: note.content,
          tags: [...note.tags],
          color: note.color,
          isPinned: note.isPinned
        });
        this._temporalTags.set([...note.tags]);
        this._removedTags.set(new Set());
        this._userHasManuallySelectedColor.set(false);
      } else {
        const smartColor = this.smartDefaultColor();
        const currentColor = this.noteForm.get('color')?.value;
        this.noteForm.reset({
          title: '',
          content: '',
          tags: [],
          color: this._userHasManuallySelectedColor() ? currentColor : smartColor,
          isPinned: false
        });
        this._temporalTags.set([]);
        this._removedTags.set(new Set());
      }
    });
  }

  getBorderColor(): string {
    const color = this.noteForm.get('color')?.value as NoteColor | null;
    switch (color) {
      case 'yellow': return 'var(--color-noteYellow)';
      case 'blue': return 'var(--color-noteBlue)';
      case 'green': return 'var(--color-noteGreen)';
      case 'red': return 'var(--color-noteRed)';
      case 'purple': return 'var(--color-notePurple)';
      case 'orange': return 'var(--color-noteOrange)';
      case 'pink': return 'var(--color-notePink)';
      case 'gray': return 'var(--color-noteGray)';
      default: return 'transparent';
    }
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('onSubmit called: ', { event, formData: this.noteForm.value });
    // Prevent submission if already submitting
    if (this.isSubmitting()) {
      console.log('Already submitting, ignoring...');
      return;
    }

    if (!this.noteForm.valid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.noteForm.value;
    const note = this.note();

    if (note) {
      // Update existing note
      const updateRequest: UpdateNoteRequest = {
        id: note.id,
        title: formValue.title!,
        content: formValue.content!,
        tags: formValue.tags || [],
        color: formValue.color as NoteColor || 'yellow',
        isPinned: formValue.isPinned || false
      };
      this.submit.emit(updateRequest);
    } else {
      // Create new note
      const createRequest: CreateNoteRequest = {
        title: formValue.title!,
        content: formValue.content!,
        tags: formValue.tags || [],
        color: formValue.color as NoteColor || 'yellow',
        isPinned: formValue.isPinned || false
      };
      this.submit.emit(createRequest);
    }
  }

  onCancel(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.cancel.emit();
  }

  /**
   * Sets the color for the note form.
   * In create mode, marks that user has manually selected a color to preserve their choice.
   * @param color - The color to set
   */
  setColor(color: NoteColor): void {
    this.noteForm.patchValue({ color });
    if (!this.isEditMode()) {
      this._userHasManuallySelectedColor.set(true);
    }
  }

  togglePin(): void {
    const currentValue = this.noteForm.get('isPinned')?.value;
    this.noteForm.patchValue({ isPinned: !currentValue });
  }

  onTagInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this._currentTag.set(input.value);
    this._showSuggestions.set(!!input.value.trim());
  }

  onTagKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const tagValue = input.value.trim();

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (tagValue) {
        this.addTag(tagValue);
        input.value = '';
      }
    } else if (event.key === 'Escape') {
      this._showSuggestions.set(false);
      input.blur();
    }
  }

  addTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    
    if (this.isEditMode()) {
      // In edit mode, update temporal tags
      const temporal = this.temporalTags();
      const removed = new Set(this.removedTags());
      
      if (normalizedTag && !temporal.includes(normalizedTag)) {
        // Add to temporal tags
        this._temporalTags.set([...temporal, normalizedTag]);
        // Remove from removed set if it was there
        removed.delete(normalizedTag);
        this._removedTags.set(removed);
        // Update form for final submission
        this.noteForm.patchValue({
          tags: [...temporal, normalizedTag]
        });
      }
    } else {
      // In create mode, update form directly
      const currentTags = this.noteForm.get('tags')?.value || [];
      if (normalizedTag && !currentTags.includes(normalizedTag)) {
        this.noteForm.patchValue({
          tags: [...currentTags, normalizedTag]
        });
      }
    }

    this._currentTag.set('');
    this._showSuggestions.set(false);
  }

  removeTag(tag: string): void {
    if (this.isEditMode()) {
      // In edit mode, mark as removed temporarily
      const removed = new Set(this.removedTags());
      removed.add(tag);
      this._removedTags.set(removed);
      
      // Update form for final submission (remove from temporal tags)
      const temporal = this.temporalTags().filter(t => t !== tag);
      this._temporalTags.set(temporal);
      this.noteForm.patchValue({
        tags: temporal
      });
    } else {
      // In create mode, remove from form directly
      const currentTags = this.noteForm.get('tags')?.value || [];
      this.noteForm.patchValue({
        tags: currentTags.filter((t: string) => t !== tag)
      });
    }
  }

  getColorName(color: NoteColor): string {
    return color;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.noteForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
    }

    if (field.errors['maxlength']) {
      const requiredLength = field.errors['maxlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be no more than ${requiredLength} characters`;
    }

    return 'Invalid input';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      'title': 'Title',
      'content': 'Content',
      'tags': 'Tags'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.noteForm.controls).forEach(key => {
      const control = this.noteForm.get(key);
      control?.markAsTouched();
    });
  }

}