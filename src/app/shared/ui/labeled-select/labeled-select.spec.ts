import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LabeledSelectComponent } from './labeled-select';
import { SelectOption } from './labeled-select.types';

describe('LabeledSelect', () => {
  let component: LabeledSelectComponent;
  let fixture: ComponentFixture<LabeledSelectComponent>;

  const mockOptions: SelectOption[] = [
    { value: 'all', label: 'All Resources' },
    { value: 'flag', label: 'Flag' },
    { value: 'segment', label: 'Segment' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabeledSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabeledSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('label', 'Resource');
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Resource');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should render a label element with the provided text', () => {
      const label = fixture.debugElement.query(By.css('.labeled-select__label'));

      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toContain('Resource');
    });

    it('should render a select element', () => {
      const select = fixture.debugElement.query(By.css('select'));

      expect(select).toBeTruthy();
    });

    it('should render all options', () => {
      const options = fixture.debugElement.queryAll(By.css('option'));

      expect(options.length).toBe(3);
      expect(options[0].nativeElement.textContent.trim()).toBe('All Resources');
      expect(options[1].nativeElement.textContent.trim()).toBe('Flag');
      expect(options[2].nativeElement.textContent.trim()).toBe('Segment');
    });

    it('should set option values correctly', () => {
      const options = fixture.debugElement.queryAll(By.css('option'));

      expect(options[0].nativeElement.value).toBe('all');
      expect(options[1].nativeElement.value).toBe('flag');
      expect(options[2].nativeElement.value).toBe('segment');
    });
  });

  describe('value binding', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Resource');
      fixture.componentRef.setInput('options', mockOptions);
    });

    it('should select the first option by default when no value provided', () => {
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.value).toBe('all');
    });

    it('should select the option matching the provided value', () => {
      fixture.componentRef.setInput('value', 'segment');
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.value).toBe('segment');
    });

    it('should update selection when value input changes', () => {
      fixture.componentRef.setInput('value', 'flag');
      fixture.detectChanges();

      let select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.value).toBe('flag');

      fixture.componentRef.setInput('value', 'segment');
      fixture.detectChanges();

      select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.value).toBe('segment');
    });
  });

  describe('valueChange output', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Resource');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should emit valueChange when user selects a different option', () => {
      const valueChangeSpy = jest.fn();
      component.valueChange.subscribe(valueChangeSpy);

      const select = fixture.debugElement.query(By.css('select'));
      select.nativeElement.value = 'flag';
      select.nativeElement.dispatchEvent(new Event('change'));

      expect(valueChangeSpy).toHaveBeenCalledWith('flag');
    });

    it('should emit the correct value for each selection', () => {
      const emittedValues: string[] = [];
      component.valueChange.subscribe((value) => emittedValues.push(value));

      const select = fixture.debugElement.query(By.css('select'));

      select.nativeElement.value = 'segment';
      select.nativeElement.dispatchEvent(new Event('change'));

      select.nativeElement.value = 'all';
      select.nativeElement.dispatchEvent(new Event('change'));

      expect(emittedValues).toEqual(['segment', 'all']);
    });
  });

  describe('styling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Resource');
      fixture.componentRef.setInput('options', mockOptions);
    });

    it('should apply the labeled-select class to the container', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.labeled-select'));
      expect(container).toBeTruthy();
    });

    it('should apply the labeled-select__control class to the select', () => {
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('.labeled-select__control'));
      expect(select).toBeTruthy();
    });

    it('should apply custom minWidth when provided', () => {
      fixture.componentRef.setInput('minWidth', '200px');
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.style.minWidth).toBe('200px');
    });

    it('should use default minWidth when not provided', () => {
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.style.minWidth).toBe('140px');
    });
  });

  describe('disabled state', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Resource');
      fixture.componentRef.setInput('options', mockOptions);
    });

    it('should not be disabled by default', () => {
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.disabled).toBe(false);
    });

    it('should be disabled when disabled input is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('select'));
      expect(select.nativeElement.disabled).toBe(true);
    });

    it('should apply disabled class to container when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.labeled-select'));
      expect(container.nativeElement.classList.contains('labeled-select--disabled')).toBe(true);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('label', 'Resource');
      fixture.componentRef.setInput('options', mockOptions);
      fixture.detectChanges();
    });

    it('should associate label with select via for/id attributes', () => {
      const labelElement = fixture.debugElement.query(By.css('label'));
      const selectElement = fixture.debugElement.query(By.css('select'));

      const labelFor = labelElement.nativeElement.getAttribute('for');
      const selectId = selectElement.nativeElement.getAttribute('id');

      expect(labelFor).toBeTruthy();
      expect(selectId).toBeTruthy();
      expect(labelFor).toBe(selectId);
    });

    it('should generate unique id for each instance', () => {
      const fixture2 = TestBed.createComponent(LabeledSelectComponent);
      fixture2.componentRef.setInput('label', 'Action');
      fixture2.componentRef.setInput('options', mockOptions);
      fixture2.detectChanges();

      const select1 = fixture.debugElement.query(By.css('select'));
      const select2 = fixture2.debugElement.query(By.css('select'));

      expect(select1.nativeElement.id).not.toBe(select2.nativeElement.id);
    });
  });
});
