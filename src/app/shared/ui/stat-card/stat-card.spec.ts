import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StatCardComponent } from './stat-card';

describe('StatCard', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
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

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('42');
    });

    it('should display numeric value in the value element', () => {
      fixture.componentRef.setInput('value', 100);
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('100');
    });

    it('should display zero values correctly', () => {
      fixture.componentRef.setInput('value', 0);
      fixture.componentRef.setInput('label', 'Empty Count');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('0');
    });

    it('should display large numbers correctly', () => {
      fixture.componentRef.setInput('value', 1000000);
      fixture.componentRef.setInput('label', 'Large Value');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('1000000');
    });

    it('should display formatted string values', () => {
      fixture.componentRef.setInput('value', '1,234');
      fixture.componentRef.setInput('label', 'Formatted');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('1,234');
    });
  });

  describe('displaying labels', () => {
    it('should display the label text', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Total Flags');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.stat-card__label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Total Flags');
    });

    it('should display multi-word labels correctly', () => {
      fixture.componentRef.setInput('value', '5');
      fixture.componentRef.setInput('label', 'Active Feature Flags');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.stat-card__label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Active Feature Flags');
    });
  });

  describe('host element styling', () => {
    it('should apply stat-card class to host element for styling', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Test');
      fixture.detectChanges();

      const hostElement = fixture.debugElement.nativeElement;
      expect(hostElement.classList.contains('stat-card')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have value and label as separate readable elements', () => {
      fixture.componentRef.setInput('value', '10');
      fixture.componentRef.setInput('label', 'Environments');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      const labelElement = fixture.debugElement.query(By.css('.stat-card__label'));

      expect(valueElement).toBeTruthy();
      expect(labelElement).toBeTruthy();
    });
  });
});
