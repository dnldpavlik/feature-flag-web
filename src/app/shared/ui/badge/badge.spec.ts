import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { BadgeComponent } from './badge';
import {
  createComponentFixture,
  query,
  expectExists,
  expectNotExists,
  getComponent,
} from '@/app/testing';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  let component: BadgeComponent;

  const getHostElement = () => fixture.debugElement.nativeElement as HTMLElement;

  beforeEach(async () => {
    fixture = await createComponentFixture(BadgeComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render content via ng-content', () => {
    @Component({
      template: `<app-badge>Test Label</app-badge>`,
      imports: [BadgeComponent],
    })
    class TestHost {}

    const hostFixture = TestBed.createComponent(TestHost);
    hostFixture.detectChanges();

    const badge = query(hostFixture, 'app-badge');
    expect(badge?.nativeElement.textContent).toContain('Test Label');
  });

  describe('variants', () => {
    it('should apply success variant class', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--success');
    });

    it('should apply info variant class', () => {
      fixture.componentRef.setInput('variant', 'info');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--info');
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

    it('should default to info variant when none specified', () => {
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--info');
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

    it('should add dismissible class when dismissible is true', () => {
      fixture.componentRef.setInput('dismissible', true);
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--dismissible');
    });
  });

  describe('size', () => {
    it('should default to medium size', () => {
      fixture.detectChanges();

      expect(getHostElement().classList).not.toContain('badge--sm');
      expect(getHostElement().classList).not.toContain('badge--lg');
    });

    it('should apply small size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--sm');
    });

    it('should apply large size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      expect(getHostElement().classList).toContain('badge--lg');
    });
  });
});
