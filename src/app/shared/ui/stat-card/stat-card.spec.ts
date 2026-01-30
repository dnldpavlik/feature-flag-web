import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCardComponent } from './stat-card';
import { expectExists, getText, getComponent } from '@/app/testing';

describe('StatCard', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  // Note: Cannot use createComponentFixture here because StatCardComponent
  // has required inputs that must be set before the first detectChanges()
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = getComponent(fixture);
  });

  describe('component initialization', () => {
    it('should create the component with required inputs', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Test');
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('displaying statistics', () => {
    it('should display string value in the value element', () => {
      fixture.componentRef.setInput('value', '42');
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__value')).toBe('42');
    });

    it('should display numeric value in the value element', () => {
      fixture.componentRef.setInput('value', 100);
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__value')).toBe('100');
    });

    it('should display zero values correctly', () => {
      fixture.componentRef.setInput('value', 0);
      fixture.componentRef.setInput('label', 'Empty Count');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__value')).toBe('0');
    });

    it('should display large numbers correctly', () => {
      fixture.componentRef.setInput('value', 1000000);
      fixture.componentRef.setInput('label', 'Large Value');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__value')).toBe('1000000');
    });

    it('should display formatted string values', () => {
      fixture.componentRef.setInput('value', '1,234');
      fixture.componentRef.setInput('label', 'Formatted');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__value')).toBe('1,234');
    });
  });

  describe('displaying labels', () => {
    it('should display the label text', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Total Flags');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__label')).toBe('Total Flags');
    });

    it('should display multi-word labels correctly', () => {
      fixture.componentRef.setInput('value', '5');
      fixture.componentRef.setInput('label', 'Active Feature Flags');
      fixture.detectChanges();

      expect(getText(fixture, '.stat-card__label')).toBe('Active Feature Flags');
    });
  });

  describe('host element styling', () => {
    it('should use Card component with stat-card class', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Test');
      fixture.detectChanges();

      expectExists(fixture, 'app-card.stat-card');
    });
  });

  describe('accessibility', () => {
    it('should have value and label as separate readable elements', () => {
      fixture.componentRef.setInput('value', '10');
      fixture.componentRef.setInput('label', 'Environments');
      fixture.detectChanges();

      expectExists(fixture, '.stat-card__value');
      expectExists(fixture, '.stat-card__label');
    });
  });
});
