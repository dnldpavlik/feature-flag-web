import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { StatCard } from './stat-card';

describe('StatCard', () => {
  let component: StatCard;
  let fixture: ComponentFixture<StatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('value', '0');
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should display the value', () => {
      fixture.componentRef.setInput('value', '42');
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('42');
    });

    it('should display the label', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Total Flags');
      fixture.detectChanges();

      const labelElement = fixture.debugElement.query(By.css('.stat-card__label'));
      expect(labelElement.nativeElement.textContent.trim()).toBe('Total Flags');
    });

    it('should display numeric values', () => {
      fixture.componentRef.setInput('value', 100);
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      const valueElement = fixture.debugElement.query(By.css('.stat-card__value'));
      expect(valueElement.nativeElement.textContent.trim()).toBe('100');
    });
  });

  describe('rendering', () => {
    it('should have the stat-card class on the host element', () => {
      fixture.componentRef.setInput('value', '0');
      fixture.componentRef.setInput('label', 'Test');
      fixture.detectChanges();
      const hostElement = fixture.debugElement.nativeElement;
      expect(hostElement.classList.contains('stat-card')).toBe(true);
    });
  });
});
