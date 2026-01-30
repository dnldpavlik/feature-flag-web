import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeaderComponent } from './page-header';
import { expectExists, expectNotExists, getText } from '@/app/testing';

@Component({
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Dashboard">
      <p page-header-description class="text-secondary">
        Project: <span class="project-name">{{ projectName }}</span>
      </p>
    </app-page-header>
  `,
})
class TestHostComponent {
  projectName = 'My Project';
}

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;

  // Note: Cannot use createComponentFixture here because PageHeaderComponent
  // has required inputs that must be set before the first detectChanges()
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title in an h1', () => {
    fixture.componentRef.setInput('title', 'Feature Flags');
    fixture.detectChanges();

    expectExists(fixture, 'h1');
    expect(getText(fixture, 'h1')).toBe('Feature Flags');
  });

  it('should render the description when provided', () => {
    fixture.componentRef.setInput('title', 'Flags');
    fixture.componentRef.setInput('description', 'Ship safely with targeted rollouts.');
    fixture.detectChanges();

    expectExists(fixture, '.page-header__description');
    expect(getText(fixture, '.page-header__description')).toBe(
      'Ship safely with targeted rollouts.',
    );
  });

  it('should not render the description paragraph when not provided', () => {
    fixture.componentRef.setInput('title', 'Settings');
    fixture.detectChanges();

    expectNotExists(fixture, '.page-header__description');
  });

  it('should apply the page-header class to the host element', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('page-header')).toBe(true);
  });

  it('should use a header element as the root', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expectExists(fixture, 'header');
  });
});

describe('PageHeader with content projection', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render projected content when no description input is provided', () => {
    expectExists(fixture, '.project-name');
    expect(getText(fixture, '.project-name')).toBe('My Project');
  });

  it('should render the title alongside projected content', () => {
    expect(getText(fixture, 'h1')).toBe('Dashboard');
  });
});
