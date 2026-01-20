import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { FlagCreateComponent } from './flag-create';
import { FlagStore } from '../../store/flag.store';

describe('FlagCreate', () => {
  let fixture: ComponentFixture<FlagCreateComponent>;
  let store: { addFlag: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    store = { addFlag: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FlagCreateComponent],
      providers: [
        provideRouter([]),
        { provide: FlagStore, useValue: store },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagCreateComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should render the create form', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Create Feature Flag');
  });

  it('should add a flag and navigate on submit', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.name = 'New Flag';
    fixture.componentInstance.key = 'new-flag';
    fixture.componentInstance.description = 'Description';
    fixture.componentInstance.type = 'boolean';
    fixture.componentInstance.enabled = true;
    fixture.componentInstance.tags = 'core, beta';

    fixture.componentInstance.createFlag();

    expect(store.addFlag).toHaveBeenCalledWith({
      key: 'new-flag',
      name: 'New Flag',
      description: 'Description',
      type: 'boolean',
      enabled: true,
      tags: ['core', 'beta'],
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
  });

  it('should not submit when name is missing', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.name = ' ';
    fixture.componentInstance.key = '';

    fixture.componentInstance.createFlag();

    expect(store.addFlag).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should derive a key when none is provided', () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.name = 'My Flag';
    fixture.componentInstance.key = '';

    fixture.componentInstance.createFlag();

    expect(store.addFlag).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'my-flag' })
    );
  });

  it('should navigate back when cancel is clicked', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
  });
});
