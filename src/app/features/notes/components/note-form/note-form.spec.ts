import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteForm } from './note-form';

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
});


