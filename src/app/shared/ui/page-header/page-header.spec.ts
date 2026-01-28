import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PageHeaderComponent } from './page-header';

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

    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1).toBeTruthy();
    expect(h1.nativeElement.textContent.trim()).toBe('Feature Flags');
  });

  it('should render the description when provided', () => {
    fixture.componentRef.setInput('title', 'Flags');
    fixture.componentRef.setInput('description', 'Ship safely with targeted rollouts.');
    fixture.detectChanges();

    const p = fixture.debugElement.query(By.css('.page-header__description'));
    expect(p).toBeTruthy();
    expect(p.nativeElement.textContent.trim()).toBe('Ship safely with targeted rollouts.');
  });

  it('should not render the description paragraph when not provided', () => {
    fixture.componentRef.setInput('title', 'Settings');
    fixture.detectChanges();

    const p = fixture.debugElement.query(By.css('.page-header__description'));
    expect(p).toBeFalsy();
  });

  it('should apply the page-header class to the host element', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('page-header')).toBe(true);
  });

  it('should use a header element as the root', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('header'));
    expect(header).toBeTruthy();
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
    const projected = fixture.debugElement.query(By.css('.project-name'));
    expect(projected).toBeTruthy();
    expect(projected.nativeElement.textContent).toBe('My Project');
  });

  it('should render the title alongside projected content', () => {
    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1.nativeElement.textContent.trim()).toBe('Dashboard');
  });
});
