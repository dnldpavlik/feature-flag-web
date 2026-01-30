import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { CardComponent } from './card';
import { createComponentFixture, query, getComponent } from '@/app/testing';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;
  let component: CardComponent;

  beforeEach(async () => {
    fixture = await createComponentFixture(CardComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have card class on host', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.classList).toContain('card');
  });

  it('should render content via ng-content', () => {
    @Component({
      template: `<app-card><p>Test content</p></app-card>`,
      imports: [CardComponent],
    })
    class TestHost {}

    const hostFixture = TestBed.createComponent(TestHost);
    hostFixture.detectChanges();

    const content = query(hostFixture, 'p');
    expect(content?.nativeElement.textContent).toBe('Test content');
  });

  describe('padding', () => {
    it('should default to medium padding', () => {
      fixture.detectChanges();
      const host = fixture.debugElement.nativeElement;
      expect(host.classList).not.toContain('card--padding-sm');
      expect(host.classList).not.toContain('card--padding-lg');
      expect(host.classList).not.toContain('card--padding-none');
    });

    it('should apply small padding class', () => {
      fixture.componentRef.setInput('padding', 'sm');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.classList).toContain('card--padding-sm');
    });

    it('should apply large padding class', () => {
      fixture.componentRef.setInput('padding', 'lg');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.classList).toContain('card--padding-lg');
    });

    it('should apply no padding class', () => {
      fixture.componentRef.setInput('padding', 'none');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.classList).toContain('card--padding-none');
    });
  });
});
