import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SegmentRule } from '../../models/segment-rule.model';
import { RuleRowComponent } from './rule-row';

describe('RuleRowComponent', () => {
  let component: RuleRowComponent;
  let fixture: ComponentFixture<RuleRowComponent>;

  const mockRule: SegmentRule = {
    id: 'rule_123',
    attribute: 'email',
    operator: 'contains',
    value: '@company.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const getButtonByText = (text: string) => {
    const buttons = fixture.debugElement.queryAll(By.css('ui-button'));
    return buttons.find((btn) => btn.nativeElement.textContent.trim() === text);
  };

  const clickButton = (text: string) => {
    const btn = getButtonByText(text);
    btn?.query(By.css('button')).nativeElement.click();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleRowComponent);
    component = fixture.componentInstance;
  });

  describe('component initialization', () => {
    it('should create with required rule input', () => {
      fixture.componentRef.setInput('rule', mockRule);
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('display mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rule', mockRule);
      fixture.detectChanges();
    });

    it('should display rule attribute', () => {
      const attributeEl = fixture.debugElement.query(By.css('.rule-row__attribute'));
      expect(attributeEl.nativeElement.textContent).toContain('email');
    });

    it('should display rule operator with human-readable label', () => {
      const operatorEl = fixture.debugElement.query(By.css('.rule-row__operator'));
      expect(operatorEl.nativeElement.textContent).toContain('contains');
    });

    it('should display rule value', () => {
      const valueEl = fixture.debugElement.query(By.css('.rule-row__value'));
      expect(valueEl.nativeElement.textContent).toContain('@company.com');
    });

    it('should display array value as comma-separated list', () => {
      const arrayRule: SegmentRule = {
        ...mockRule,
        operator: 'in',
        value: ['pro', 'enterprise'],
      };
      fixture.componentRef.setInput('rule', arrayRule);
      fixture.detectChanges();

      const valueEl = fixture.debugElement.query(By.css('.rule-row__value'));
      expect(valueEl.nativeElement.textContent).toContain('pro, enterprise');
    });

    it('should show edit button', () => {
      const editBtn = getButtonByText('Edit');
      expect(editBtn).toBeTruthy();
    });

    it('should show remove button', () => {
      const removeBtn = getButtonByText('Remove');
      expect(removeBtn).toBeTruthy();
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rule', mockRule);
      fixture.detectChanges();
    });

    it('should enter edit mode when edit button clicked', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const editForm = fixture.debugElement.query(By.css('.rule-row__edit-form'));
      expect(editForm).toBeTruthy();
    });

    it('should show attribute input in edit mode', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.rule-row__attribute-input'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.value).toBe('email');
    });

    it('should show operator select in edit mode', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.css('.rule-row__operator-select'));
      expect(select).toBeTruthy();
      expect(select.nativeElement.value).toBe('contains');
    });

    it('should show value input in edit mode', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.rule-row__value-input'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.value).toBe('@company.com');
    });

    it('should show save button in edit mode', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const saveBtn = getButtonByText('Save');
      expect(saveBtn).toBeTruthy();
    });

    it('should show cancel button in edit mode', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const cancelBtn = getButtonByText('Cancel');
      expect(cancelBtn).toBeTruthy();
    });

    it('should exit edit mode when cancel clicked', () => {
      clickButton('Edit');
      fixture.detectChanges();

      clickButton('Cancel');
      fixture.detectChanges();

      const editForm = fixture.debugElement.query(By.css('.rule-row__edit-form'));
      expect(editForm).toBeFalsy();
    });

    it('should reset form values when cancel clicked', () => {
      // Enter edit mode
      clickButton('Edit');
      fixture.detectChanges();

      // Change the value
      const input = fixture.debugElement.query(By.css('.rule-row__value-input'));
      input.nativeElement.value = 'changed';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Cancel
      clickButton('Cancel');
      fixture.detectChanges();

      // Re-enter edit mode to verify value was reset
      clickButton('Edit');
      fixture.detectChanges();

      const valueInput = fixture.debugElement.query(By.css('.rule-row__value-input'));
      expect(valueInput.nativeElement.value).toBe('@company.com');
    });
  });

  describe('outputs', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rule', mockRule);
      fixture.detectChanges();
    });

    it('should emit updated event when save clicked with changes', () => {
      const updatedSpy = jest.fn();
      component.updated.subscribe(updatedSpy);

      clickButton('Edit');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.rule-row__value-input'));
      input.nativeElement.value = '@new.com';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save');
      fixture.detectChanges();

      expect(updatedSpy).toHaveBeenCalledWith({
        attribute: 'email',
        operator: 'contains',
        value: '@new.com',
      });
    });

    it('should emit removed event when remove button clicked', () => {
      const removedSpy = jest.fn();
      component.removed.subscribe(removedSpy);

      clickButton('Remove');
      fixture.detectChanges();

      expect(removedSpy).toHaveBeenCalledWith('rule_123');
    });

    it('should exit edit mode after save', () => {
      clickButton('Edit');
      fixture.detectChanges();

      clickButton('Save');
      fixture.detectChanges();

      const editForm = fixture.debugElement.query(By.css('.rule-row__edit-form'));
      expect(editForm).toBeFalsy();
    });
  });

  describe('different operators', () => {
    it('should display "does not equal" for not_equals operator', () => {
      fixture.componentRef.setInput('rule', { ...mockRule, operator: 'not_equals' });
      fixture.detectChanges();

      const operatorEl = fixture.debugElement.query(By.css('.rule-row__operator'));
      expect(operatorEl.nativeElement.textContent).toContain('does not equal');
    });

    it('should display "is one of" for in operator', () => {
      fixture.componentRef.setInput('rule', { ...mockRule, operator: 'in', value: ['a', 'b'] });
      fixture.detectChanges();

      const operatorEl = fixture.debugElement.query(By.css('.rule-row__operator'));
      expect(operatorEl.nativeElement.textContent).toContain('is one of');
    });

    it('should display "starts with" for starts_with operator', () => {
      fixture.componentRef.setInput('rule', { ...mockRule, operator: 'starts_with' });
      fixture.detectChanges();

      const operatorEl = fixture.debugElement.query(By.css('.rule-row__operator'));
      expect(operatorEl.nativeElement.textContent).toContain('starts with');
    });
  });

  describe('edit mode input handlers', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rule', mockRule);
      fixture.detectChanges();
      clickButton('Edit');
      fixture.detectChanges();
    });

    it('should update attribute when attribute input changes', () => {
      const input = fixture.debugElement.query(By.css('.rule-row__attribute-input'));
      input.nativeElement.value = 'country';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const updatedSpy = jest.fn();
      component.updated.subscribe(updatedSpy);

      clickButton('Save');
      fixture.detectChanges();

      expect(updatedSpy).toHaveBeenCalledWith(expect.objectContaining({ attribute: 'country' }));
    });

    it('should update operator when operator select changes', () => {
      const select = fixture.debugElement.query(By.css('.rule-row__operator-select'));
      select.nativeElement.value = 'equals';
      select.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const updatedSpy = jest.fn();
      component.updated.subscribe(updatedSpy);

      clickButton('Save');
      fixture.detectChanges();

      expect(updatedSpy).toHaveBeenCalledWith(expect.objectContaining({ operator: 'equals' }));
    });

    it('should emit array value when saving with in operator', () => {
      const updatedSpy = jest.fn();
      component.updated.subscribe(updatedSpy);

      const select = fixture.debugElement.query(By.css('.rule-row__operator-select'));
      select.nativeElement.value = 'in';
      select.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('.rule-row__value-input'));
      input.nativeElement.value = 'pro, enterprise, starter';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save');
      fixture.detectChanges();

      expect(updatedSpy).toHaveBeenCalledWith(
        expect.objectContaining({ value: ['pro', 'enterprise', 'starter'] }),
      );
    });
  });
});
