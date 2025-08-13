import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteContextMenu } from './note-context-menu';
import { Note } from '@core/models';

describe('NoteContextMenu', () => {
  let component: NoteContextMenu;
  let fixture: ComponentFixture<NoteContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteContextMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteContextMenu);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isVisible', true);
    fixture.componentRef.setInput('note', { id: '1', title: 't', content: 'c', createdAt: new Date(), updatedAt: new Date(), tags: [], color: 'yellow', isPinned: false });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close on delete', () => {
    const spy = jest.fn();
    component.close.subscribe(spy);
    component.onDelete(component.note());
    expect(spy).toHaveBeenCalled();
  });
});


