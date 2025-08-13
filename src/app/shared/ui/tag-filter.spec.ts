import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagFilter } from './tag-filter';

describe('TagFilter', () => {
  let component: TagFilter;
  let fixture: ComponentFixture<TagFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(TagFilter);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('availableTags', ['a', 'b']);
    fixture.componentRef.setInput('selectedTags', ['a']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


