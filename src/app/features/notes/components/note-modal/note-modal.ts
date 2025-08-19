import { Component, input, output, ChangeDetectionStrategy, effect } from '@angular/core';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@core/models';
import { NoteForm } from '../note-form/note-form';

@Component({
  selector: 'note-modal',
  imports: [NoteForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      @let submitting = isSubmitting();
      
      <div class="note-modal" (click)="onBackdropClick($event)">
        <div class="note-modal__content" (click)="$event.stopPropagation()">
          <note-form
            [note]="note()"
            [availableTags]="availableTags()"
            [allNotes]="allNotes()"
            [isSubmitting]="submitting"
            (submit)="onSubmit($event)"
            (cancel)="onCancel()">
          </note-form>
        </div>
      </div>
    }
  `,
  styleUrl: './note-modal.css'
 
})
export class NoteModal {
  // Inputs
  isOpen = input.required<boolean>();
  note = input<Note | null>(null);
  availableTags = input<string[]>([]);
  allNotes = input<Note[]>([]);
  isSubmitting = input(false);

  // Outputs
  close = output<void>();
  submit = output<CreateNoteRequest | UpdateNoteRequest>();

  constructor() {
    // Handle escape key and body scroll management
    effect(() => {
      if (this.isOpen()) {
        // Save original overflow value
        const originalOverflow = document.body.style.overflow;

        const handleEscape = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            this.onCancel();
          }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
          document.removeEventListener('keydown', handleEscape);
          // Restore original overflow or default
          document.body.style.overflow = originalOverflow || '';
        };
      } else {
        // Ensure overflow is restored when modal is closed
        document.body.style.overflow = '';
      }
      return () => {};
    });
  }

  async onSubmit(request: CreateNoteRequest | UpdateNoteRequest): Promise<void> {
    this.submit.emit(request);
  }

  onCancel(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

}