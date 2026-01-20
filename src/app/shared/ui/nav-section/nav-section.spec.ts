import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NavSectionComponent } from './nav-section';

@Component({
  selector: 'app-nav-section-host',
  template: `
    <app-nav-section [title]="title">
      <ul class="nav-list">
        <li class="nav-item">Environments</li>
      </ul>
    </app-nav-section>
  `,
  imports: [NavSectionComponent],
})
class NavSectionHostComponent {
  title = 'Group';
}

describe('NavSection', () => {
  let fixture: ComponentFixture<NavSectionHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavSectionHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavSectionHostComponent);
    fixture.detectChanges();
  });

  it('should render the section wrapper', () => {
    const section = fixture.debugElement.query(By.css('.nav-section'));
    expect(section).toBeTruthy();
  });

  it('should render the title', () => {
    const title = fixture.debugElement.query(By.css('.nav-section__title'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toContain('Group');
  });

  it('should project section content', () => {
    const content = fixture.debugElement.query(By.css('.nav-section .nav-list'));
    expect(content).toBeTruthy();
    expect(content.nativeElement.textContent).toContain('Environments');
  });
});
