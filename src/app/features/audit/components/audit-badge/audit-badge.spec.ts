import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { AuditBadgeComponent, AuditBadgeVariant, ExtendedBadgeVariant } from './audit-badge';
import {
  createComponentFixture,
  query,
  expectExists,
  expectNotExists,
  getComponent,
} from '@/app/testing';

describe('AuditBadgeComponent', () => {
  let fixture: ComponentFixture<AuditBadgeComponent>;
  let component: AuditBadgeComponent;

  const getHostElement = () => fixture.debugElement.nativeElement as HTMLElement;

  beforeEach(async () => {
    fixture = await createComponentFixture(AuditBadgeComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render content via ng-content', () => {
    @Component({
      template: `<app-audit-badge>Test Label</app-audit-badge>`,
      imports: [AuditBadgeComponent],
    })
    class TestHost {}

    const hostFixture = TestBed.createComponent(TestHost);
    hostFixture.detectChanges();

    const badge = query(hostFixture, 'app-audit-badge');
    expect(badge?.nativeElement.textContent).toContain('Test Label');
  });

  describe('audit action variants', () => {
    it('should apply created variant class', () => {
      fixture.componentRef.setInput('variant', 'created');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--created');
    });

    it('should apply updated variant class', () => {
      fixture.componentRef.setInput('variant', 'updated');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--updated');
    });

    it('should apply deleted variant class', () => {
      fixture.componentRef.setInput('variant', 'deleted');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--deleted');
    });

    it('should apply toggled variant class', () => {
      fixture.componentRef.setInput('variant', 'toggled');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--toggled');
    });
  });

  describe('standard variants', () => {
    it('should apply success variant class', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--success');
    });

    it('should apply warning variant class', () => {
      fixture.componentRef.setInput('variant', 'warning');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--warning');
    });

    it('should apply error variant class', () => {
      fixture.componentRef.setInput('variant', 'error');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--error');
    });

    it('should apply info variant class', () => {
      fixture.componentRef.setInput('variant', 'info');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--info');
    });
  });

  describe('default variant', () => {
    it('should default to info variant when none specified', () => {
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--info');
    });

    it('should always have the base badge class', () => {
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge');
    });
  });

  describe('dismissible', () => {
    it('should not show dismiss button by default', () => {
      fixture.detectChanges();
      expectNotExists(fixture, '.badge__dismiss');
    });

    it('should show dismiss button when dismissible is true', () => {
      fixture.componentRef.setInput('dismissible', true);
      fixture.detectChanges();
      expectExists(fixture, '.badge__dismiss');
    });

    it('should emit dismissed event when dismiss button is clicked', () => {
      fixture.componentRef.setInput('dismissible', true);
      fixture.detectChanges();

      const dismissedSpy = jest.fn();
      component.dismissed.subscribe(dismissedSpy);

      const dismissBtn = query(fixture, '.badge__dismiss');
      dismissBtn?.nativeElement.click();

      expect(dismissedSpy).toHaveBeenCalled();
    });
  });

  describe('types', () => {
    it('should accept AuditBadgeVariant values', () => {
      const variants: AuditBadgeVariant[] = ['created', 'updated', 'deleted', 'toggled'];
      expect(variants).toHaveLength(4);
    });

    it('should accept ExtendedBadgeVariant values', () => {
      const variants: ExtendedBadgeVariant[] = [
        'success',
        'warning',
        'error',
        'info',
        'created',
        'updated',
        'deleted',
        'toggled',
      ];
      expect(variants).toHaveLength(8);
    });
  });
});
