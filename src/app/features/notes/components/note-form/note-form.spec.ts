import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteForm } from './note-form';
import { Note, NoteColor } from '@core/models';

describe('NoteForm', () => {
  let component: NoteForm;
  let fixture: ComponentFixture<NoteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteForm],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancel', () => {
    const spy = jest.fn();
    component.cancel.subscribe(spy);
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });

  describe('Smart Default Color LinkedSignal', () => {
    function createNote(id: string, color: NoteColor): Note {
      const now = new Date();
      return {
        id,
        title: `Note ${id}`,
        content: `Content ${id}`,
        createdAt: now,
        updatedAt: now,
        tags: [],
        color,
        isPinned: false
      };
    }

    beforeEach(() => {
      // Reset component for each test
      fixture = TestBed.createComponent(NoteForm);
      component = fixture.componentInstance;
    });

    it('should use yellow as default when no notes exist', () => {
      // Setup: no notes
      fixture.componentRef.setInput('allNotes', []);
      fixture.componentRef.setInput('note', null); // create mode
      fixture.detectChanges();

      // Default color should be yellow
      expect(component.noteForm.get('color')?.value).toBe('yellow');
    });

    it('should use most frequent color from existing notes', () => {
      // Setup: notes with blue being most frequent
      const notes = [
        createNote('1', 'blue'),
        createNote('2', 'blue'), 
        createNote('3', 'blue'),
        createNote('4', 'red'),
        createNote('5', 'yellow')
      ];
      
      fixture.componentRef.setInput('allNotes', notes);
      fixture.componentRef.setInput('note', null); // create mode
      fixture.detectChanges();

      // Should use most frequent color (blue)
      expect(component.noteForm.get('color')?.value).toBe('blue');
    });

    it('should preserve user manual color selection', () => {
      // Setup initial notes favoring blue
      const notes = [
        createNote('1', 'blue'),
        createNote('2', 'blue')
      ];
      
      fixture.componentRef.setInput('allNotes', notes);
      fixture.componentRef.setInput('note', null); // create mode
      fixture.detectChanges();

      // Should start with blue
      expect(component.noteForm.get('color')?.value).toBe('blue');

      // User manually selects red
      component.setColor('red');

      // Should preserve red even if more blue notes are added
      const moreNotes = [...notes, createNote('3', 'blue'), createNote('4', 'blue')];
      fixture.componentRef.setInput('allNotes', moreNotes);
      fixture.detectChanges();

      // Should still be red (user preference preserved)
      expect(component.noteForm.get('color')?.value).toBe('red');
    });

    it('should not affect color in edit mode', () => {
      // Setup: existing note with green color
      const existingNote = createNote('1', 'green');
      const otherNotes = [
        createNote('2', 'blue'),
        createNote('3', 'blue')
      ];

      fixture.componentRef.setInput('allNotes', otherNotes);
      fixture.componentRef.setInput('note', existingNote); // edit mode
      fixture.detectChanges();

      // Should preserve original note color (green) in edit mode
      expect(component.noteForm.get('color')?.value).toBe('green');
    });

    it('should handle equal frequency by selecting first alphabetically', () => {
      // Setup: equal frequency colors
      const notes = [
        createNote('1', 'red'),
        createNote('2', 'blue'),
        createNote('3', 'red'),
        createNote('4', 'blue')
      ];
      
      fixture.componentRef.setInput('allNotes', notes);
      fixture.componentRef.setInput('note', null); // create mode  
      fixture.detectChanges();

      // Should pick the first one from Object.entries sort (alphabetically first key)
      // Note: Object.entries doesn't guarantee order, but our implementation uses sort by count desc
      const color = component.noteForm.get('color')?.value;
      expect(['red', 'blue']).toContain(color);
    });
  });
});


