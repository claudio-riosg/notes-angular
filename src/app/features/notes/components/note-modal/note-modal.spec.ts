import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteModal } from './note-modal';
import { Note } from '@core/models';

describe('NoteModal', () => {
  let component: NoteModal;
  let fixture: ComponentFixture<NoteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteModal],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close on cancel', () => {
    const spy = jest.fn();
    component.close.subscribe(spy);
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });
});


