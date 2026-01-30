import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleComponent } from './toggle';
import {
  createComponentFixture,
  query,
  expectExists,
  expectNotExists,
  getText,
} from '@/app/testing';

@Component({
  imports: [ToggleComponent],
  template: `
    <app-toggle
      [checked]="isChecked"
      [label]="label"
      [disabled]="isDisabled"
      (toggled)="onToggle($event)"
    />
  `,
})
class TestHostComponent {
  isChecked = false;
  label = '';
  isDisabled = false;
  lastToggleValue: boolean | null = null;

  onToggle(value: boolean): void {
    this.lastToggleValue = value;
  }
}

describe('Toggle', () => {
  let fixture: ComponentFixture<ToggleComponent>;

  beforeEach(async () => {
    fixture = await createComponentFixture(ToggleComponent);
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a label element with toggle class', () => {
    fixture.detectChanges();
    expectExists(fixture, 'label.toggle');
  });

  it('should render a checkbox input', () => {
    fixture.detectChanges();
    expectExists(fixture, 'input[type="checkbox"]');
  });

  it('should render the slider span', () => {
    fixture.detectChanges();
    expectExists(fixture, '.toggle__slider');
  });

  it('should not render label text when not provided', () => {
    fixture.detectChanges();
    expectNotExists(fixture, '.toggle__label');
  });

  it('should render label text when provided', () => {
    fixture.componentRef.setInput('label', 'Enable feature');
    fixture.detectChanges();
    expectExists(fixture, '.toggle__label');
    expect(getText(fixture, '.toggle__label')).toBe('Enable feature');
  });

  it('should reflect checked state on the input', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('should reflect unchecked state on the input', () => {
    fixture.componentRef.setInput('checked', false);
    fixture.detectChanges();
    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('should disable the input when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should apply disabled class to host when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('toggle--disabled')).toBe(true);
  });
});

describe('Toggle with host component', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit toggled event with true when checked', () => {
    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    input.click();
    fixture.detectChanges();

    expect(host.lastToggleValue).toBe(true);
  });

  it('should emit toggled event with false when unchecked', () => {
    host.isChecked = true;
    fixture.detectChanges();

    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    input.click();
    fixture.detectChanges();

    expect(host.lastToggleValue).toBe(false);
  });

  it('should not emit when disabled', () => {
    host.isDisabled = true;
    fixture.detectChanges();

    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    input.click();
    fixture.detectChanges();

    expect(host.lastToggleValue).toBeNull();
  });

  it('should display label text from input', () => {
    host.label = 'My Toggle';
    fixture.detectChanges();
    expect(getText(fixture, '.toggle__label')).toBe('My Toggle');
  });

  it('should update checked state when input changes', () => {
    host.isChecked = true;
    fixture.detectChanges();

    const input = query(fixture, 'input')?.nativeElement as HTMLInputElement;
    expect(input.checked).toBe(true);

    host.isChecked = false;
    fixture.detectChanges();
    expect(input.checked).toBe(false);
  });
});
