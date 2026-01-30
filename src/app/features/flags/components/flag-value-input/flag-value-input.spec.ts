import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Component, signal } from '@angular/core';

import { FlagValueInputComponent } from './flag-value-input';
import { FlagType } from '@/app/features/flags/models/flag.model';
import { query, expectExists, expectNotExists } from '@/app/testing';

@Component({
  standalone: true,
  imports: [FlagValueInputComponent],
  template: `
    <app-flag-value-input
      [type]="type()"
      [booleanControl]="booleanControl"
      [stringControl]="stringControl"
      [numberControl]="numberControl"
      [jsonControl]="jsonControl"
      [jsonError]="jsonError()"
      (jsonBlur)="onJsonBlur()"
    />
  `,
})
class TestHostComponent {
  type = signal<FlagType>('boolean');
  booleanControl = new FormControl(false, { nonNullable: true });
  stringControl = new FormControl('', { nonNullable: true });
  numberControl = new FormControl(0, { nonNullable: true });
  jsonControl = new FormControl('{}', { nonNullable: true });
  jsonError = signal<string | null>(null);
  jsonBlurCalled = false;

  onJsonBlur(): void {
    this.jsonBlurCalled = true;
  }
}

describe('FlagValueInputComponent', () => {
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

  describe('boolean type', () => {
    it('should render checkbox for boolean type', () => {
      host.type.set('boolean');
      fixture.detectChanges();

      expectExists(fixture, 'input[type="checkbox"]');
    });

    it('should bind to booleanControl value', () => {
      host.type.set('boolean');
      host.booleanControl.setValue(true);
      fixture.detectChanges();

      const checkbox = query(fixture, 'input[type="checkbox"]');
      expect(checkbox?.nativeElement.checked).toBe(true);

      host.booleanControl.setValue(false);
      fixture.detectChanges();
      expect(checkbox?.nativeElement.checked).toBe(false);
    });
  });

  describe('string type', () => {
    it('should render text input for string type', () => {
      host.type.set('string');
      fixture.detectChanges();

      expectExists(fixture, 'app-form-field');
      expectNotExists(fixture, 'input[type="checkbox"]');
    });
  });

  describe('number type', () => {
    it('should render number input for number type', () => {
      host.type.set('number');
      fixture.detectChanges();

      expectExists(fixture, 'app-form-field');
    });
  });

  describe('json type', () => {
    it('should render textarea for json type', () => {
      host.type.set('json');
      fixture.detectChanges();

      expectExists(fixture, 'app-form-field');
    });

    it('should display json error when provided', () => {
      host.type.set('json');
      host.jsonError.set('Invalid JSON');
      fixture.detectChanges();

      const formField = query(fixture, 'app-form-field');
      expect(formField).toBeTruthy();
    });
  });

  describe('type switching', () => {
    it('should switch between types correctly', () => {
      host.type.set('boolean');
      fixture.detectChanges();
      expectExists(fixture, 'input[type="checkbox"]');

      host.type.set('string');
      fixture.detectChanges();
      expectNotExists(fixture, 'input[type="checkbox"]');
      expectExists(fixture, 'app-form-field');

      host.type.set('number');
      fixture.detectChanges();
      expectExists(fixture, 'app-form-field');

      host.type.set('json');
      fixture.detectChanges();
      expectExists(fixture, 'app-form-field');
    });
  });
});
