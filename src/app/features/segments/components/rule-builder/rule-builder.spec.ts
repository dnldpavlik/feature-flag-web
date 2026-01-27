import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CreateSegmentRuleInput } from '../../models/segment-rule.model';
import { RuleBuilderComponent } from './rule-builder';

describe('RuleBuilderComponent', () => {
  let component: RuleBuilderComponent;
  let fixture: ComponentFixture<RuleBuilderComponent>;

  const getAddButton = () => {
    const appButton = fixture.debugElement.query(By.css('app-button'));
    return appButton?.query(By.css('button'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleBuilderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('form elements', () => {
    it('should display attribute select', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      expect(select).toBeTruthy();
    });

    it('should display common attribute options', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      const options = select.queryAll(By.css('option'));
      const values = options.map((o) => o.nativeElement.value);

      expect(values).toContain('email');
      expect(values).toContain('country');
      expect(values).toContain('plan');
    });

    it('should display custom attribute option', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      const options = select.queryAll(By.css('option'));
      const labels = options.map((o) => o.nativeElement.textContent.trim());

      expect(labels).toContain('Custom...');
    });

    it('should display operator select', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__operator-select'));
      expect(select).toBeTruthy();
    });

    it('should display all operator options', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__operator-select'));
      const options = select.queryAll(By.css('option'));
      const values = options.map((o) => o.nativeElement.value);

      expect(values).toContain('equals');
      expect(values).toContain('not_equals');
      expect(values).toContain('contains');
      expect(values).toContain('in');
    });

    it('should display value input', () => {
      const input = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      expect(input).toBeTruthy();
    });

    it('should display add button', () => {
      const btn = getAddButton();
      expect(btn).toBeTruthy();
    });
  });

  describe('custom attribute', () => {
    it('should show custom attribute input when custom is selected', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      select.nativeElement.value = 'custom';
      select.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const customInput = fixture.debugElement.query(By.css('.rule-builder__custom-attribute-input'));
      expect(customInput).toBeTruthy();
    });

    it('should hide custom attribute input when standard attribute selected', () => {
      const customInput = fixture.debugElement.query(By.css('.rule-builder__custom-attribute-input'));
      expect(customInput).toBeFalsy();
    });
  });

  describe('value input placeholder', () => {
    it('should show "Value" placeholder for standard operators', () => {
      const input = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      expect(input.nativeElement.placeholder).toBe('Value');
    });

    it('should show comma-separated hint for in operator', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__operator-select'));
      select.nativeElement.value = 'in';
      select.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      expect(input.nativeElement.placeholder).toContain('comma');
    });

    it('should show comma-separated hint for not_in operator', () => {
      const select = fixture.debugElement.query(By.css('.rule-builder__operator-select'));
      select.nativeElement.value = 'not_in';
      select.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      expect(input.nativeElement.placeholder).toContain('comma');
    });
  });

  describe('add button state', () => {
    it('should disable add button when form is empty', () => {
      const btn = getAddButton();
      expect(btn.nativeElement.disabled).toBe(true);
    });

    it('should enable add button when form is valid', () => {
      // Select attribute
      const attrSelect = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      attrSelect.nativeElement.value = 'email';
      attrSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Enter value
      const valueInput = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      valueInput.nativeElement.value = '@test.com';
      valueInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const btn = getAddButton();
      expect(btn.nativeElement.disabled).toBe(false);
    });

    it('should disable add button when value is empty', () => {
      const attrSelect = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      attrSelect.nativeElement.value = 'email';
      attrSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const btn = getAddButton();
      expect(btn.nativeElement.disabled).toBe(true);
    });
  });

  describe('ruleAdded output', () => {
    it('should emit ruleAdded with correct data for string value', () => {
      const addedSpy = jest.fn();
      component.ruleAdded.subscribe(addedSpy);

      // Select attribute
      const attrSelect = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      attrSelect.nativeElement.value = 'email';
      attrSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Enter value
      const valueInput = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      valueInput.nativeElement.value = '@company.com';
      valueInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Click add
      const btn = getAddButton();
      btn.nativeElement.click();
      fixture.detectChanges();

      expect(addedSpy).toHaveBeenCalledWith({
        attribute: 'email',
        operator: 'equals',
        value: '@company.com',
      } as CreateSegmentRuleInput);
    });

    it('should emit ruleAdded with array value for in operator', () => {
      const addedSpy = jest.fn();
      component.ruleAdded.subscribe(addedSpy);

      // Select attribute
      const attrSelect = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      attrSelect.nativeElement.value = 'plan';
      attrSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Select in operator
      const opSelect = fixture.debugElement.query(By.css('.rule-builder__operator-select'));
      opSelect.nativeElement.value = 'in';
      opSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Enter comma-separated values
      const valueInput = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      valueInput.nativeElement.value = 'pro, enterprise';
      valueInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Click add
      const btn = getAddButton();
      btn.nativeElement.click();
      fixture.detectChanges();

      expect(addedSpy).toHaveBeenCalledWith({
        attribute: 'plan',
        operator: 'in',
        value: ['pro', 'enterprise'],
      } as CreateSegmentRuleInput);
    });

    it('should emit ruleAdded with custom attribute', () => {
      const addedSpy = jest.fn();
      component.ruleAdded.subscribe(addedSpy);

      // Select custom
      const attrSelect = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      attrSelect.nativeElement.value = 'custom';
      attrSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Enter custom attribute
      const customInput = fixture.debugElement.query(By.css('.rule-builder__custom-attribute-input'));
      customInput.nativeElement.value = 'subscription_tier';
      customInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Enter value
      const valueInput = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      valueInput.nativeElement.value = 'premium';
      valueInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Click add
      const btn = getAddButton();
      btn.nativeElement.click();
      fixture.detectChanges();

      expect(addedSpy).toHaveBeenCalledWith({
        attribute: 'subscription_tier',
        operator: 'equals',
        value: 'premium',
      } as CreateSegmentRuleInput);
    });

    it('should not emit when addRule is called with invalid form', () => {
      const addedSpy = jest.fn();
      component.ruleAdded.subscribe(addedSpy);

      // Directly invoke addRule when form is empty (canAdd() returns false)
      (component as never)['addRule']();

      expect(addedSpy).not.toHaveBeenCalled();
    });

    it('should reset form after adding rule', () => {
      // Select attribute and enter value
      const attrSelect = fixture.debugElement.query(By.css('.rule-builder__attribute-select'));
      attrSelect.nativeElement.value = 'email';
      attrSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const valueInput = fixture.debugElement.query(By.css('.rule-builder__value-input'));
      valueInput.nativeElement.value = '@test.com';
      valueInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Click add
      const btn = getAddButton();
      btn.nativeElement.click();
      fixture.detectChanges();

      // Verify form reset
      expect(fixture.debugElement.query(By.css('.rule-builder__attribute-select')).nativeElement.value).toBe('');
      expect(fixture.debugElement.query(By.css('.rule-builder__value-input')).nativeElement.value).toBe('');
    });
  });
});
