import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SegmentStore } from '../../store/segment.store';
import { SegmentDetailComponent } from './segment-detail';

describe('SegmentDetailComponent', () => {
  let component: SegmentDetailComponent;
  let fixture: ComponentFixture<SegmentDetailComponent>;
  let store: SegmentStore;

  const mockActivatedRoute = {
    paramMap: of({
      get: (key: string) => (key === 'segmentId' ? 'seg_beta' : null),
    }),
  };

  const getButtonByText = (text: string) => {
    const buttons = fixture.debugElement.queryAll(By.css('app-button'));
    return buttons.find((btn) => btn.nativeElement.textContent.trim() === text);
  };

  const clickButton = (text: string) => {
    const btn = getButtonByText(text);
    btn?.query(By.css('button')).nativeElement.click();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        SegmentStore,
      ],
    }).compileComponents();

    store = TestBed.inject(SegmentStore);
    fixture = TestBed.createComponent(SegmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load segment from route param', () => {
      const segment = store.getSegmentById('seg_beta');
      expect(segment).toBeDefined();
    });
  });

  describe('header section', () => {
    it('should display back link', () => {
      const backLink = fixture.debugElement.query(By.css('.segment-detail__back-link'));
      expect(backLink).toBeTruthy();
    });

    it('should display segment name', () => {
      const nameEl = fixture.debugElement.query(By.css('.segment-detail__name'));
      expect(nameEl.nativeElement.textContent).toContain('Beta Testers');
    });

    it('should display segment key', () => {
      const keyEl = fixture.debugElement.query(By.css('.segment-detail__key'));
      expect(keyEl.nativeElement.textContent).toContain('beta-testers');
    });
  });

  describe('details section', () => {
    it('should display segment description', () => {
      const descEl = fixture.debugElement.query(By.css('.segment-detail__description'));
      expect(descEl.nativeElement.textContent).toContain('testers');
    });

    it('should have edit button for details', () => {
      const editBtn = getButtonByText('Edit');
      expect(editBtn).toBeTruthy();
    });
  });

  describe('rules section', () => {
    it('should display rules header', () => {
      const header = fixture.debugElement.query(By.css('.segment-detail__rules-header'));
      expect(header).toBeTruthy();
      expect(header.nativeElement.textContent).toContain('Rules');
    });

    it('should display existing rules', () => {
      const ruleRows = fixture.debugElement.queryAll(By.css('app-rule-row'));
      expect(ruleRows.length).toBeGreaterThan(0);
    });

    it('should display rule builder', () => {
      const ruleBuilder = fixture.debugElement.query(By.css('app-rule-builder'));
      expect(ruleBuilder).toBeTruthy();
    });
  });

  describe('rule interactions', () => {
    it('should add rule when rule builder emits ruleAdded', () => {
      const segment = store.getSegmentById('seg_beta')!;
      const initialRuleCount = segment.rules.length;

      const ruleBuilder = fixture.debugElement.query(By.css('app-rule-builder'));
      ruleBuilder.triggerEventHandler('ruleAdded', {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      });
      fixture.detectChanges();

      const updatedSegment = store.getSegmentById('seg_beta')!;
      expect(updatedSegment.rules.length).toBe(initialRuleCount + 1);
    });

    it('should update rule when rule row emits updated', () => {
      const segment = store.getSegmentById('seg_beta')!;
      const ruleToUpdate = segment.rules[0];

      const ruleRows = fixture.debugElement.queryAll(By.css('app-rule-row'));
      ruleRows[0].triggerEventHandler('updated', {
        value: '@updated.com',
      });
      fixture.detectChanges();

      const updatedSegment = store.getSegmentById('seg_beta')!;
      const updatedRule = updatedSegment.rules.find((r) => r.id === ruleToUpdate.id);
      expect(updatedRule?.value).toBe('@updated.com');
    });

    it('should remove rule when rule row emits removed', () => {
      const segment = store.getSegmentById('seg_beta')!;
      const initialRuleCount = segment.rules.length;
      const ruleToRemove = segment.rules[0];

      const ruleRows = fixture.debugElement.queryAll(By.css('app-rule-row'));
      ruleRows[0].triggerEventHandler('removed', ruleToRemove.id);
      fixture.detectChanges();

      const updatedSegment = store.getSegmentById('seg_beta')!;
      expect(updatedSegment.rules.length).toBe(initialRuleCount - 1);
    });
  });

  describe('edit mode', () => {
    it('should enter edit mode when edit button clicked', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const editForm = fixture.debugElement.query(By.css('.segment-detail__edit-form'));
      expect(editForm).toBeTruthy();
    });

    it('should show name input in edit mode', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(By.css('.segment-detail__name-input'));
      expect(nameInput).toBeTruthy();
      expect(nameInput.nativeElement.value).toBe('Beta Testers');
    });

    it('should save changes when save clicked', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(By.css('.segment-detail__name-input'));
      nameInput.nativeElement.value = 'Updated Name';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save Changes');
      fixture.detectChanges();

      const segment = store.getSegmentById('seg_beta')!;
      expect(segment.name).toBe('Updated Name');
    });

    it('should cancel changes when cancel clicked', () => {
      const originalName = store.getSegmentById('seg_beta')!.name;

      clickButton('Edit');
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(By.css('.segment-detail__name-input'));
      nameInput.nativeElement.value = 'Should Not Save';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Cancel');
      fixture.detectChanges();

      const segment = store.getSegmentById('seg_beta')!;
      expect(segment.name).toBe(originalName);
    });

    it('should update key input value', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const keyInput = fixture.debugElement.query(By.css('.segment-detail__key-input'));
      keyInput.nativeElement.value = 'new-key';
      keyInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save Changes');
      fixture.detectChanges();

      const segment = store.getSegmentById('seg_beta')!;
      expect(segment.key).toBe('new-key');
    });

    it('should update description input value', () => {
      clickButton('Edit');
      fixture.detectChanges();

      const descInput = fixture.debugElement.query(By.css('.segment-detail__description-input'));
      descInput.nativeElement.value = 'Updated description';
      descInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save Changes');
      fixture.detectChanges();

      const segment = store.getSegmentById('seg_beta')!;
      expect(segment.description).toBe('Updated description');
    });
  });

  describe('not found state', () => {
    it('should show not found message for invalid segment id', async () => {
      const notFoundRoute = {
        paramMap: of({
          get: (key: string) => (key === 'segmentId' ? 'seg_invalid' : null),
        }),
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SegmentDetailComponent],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: notFoundRoute },
          SegmentStore,
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(SegmentDetailComponent);
      newFixture.detectChanges();

      const notFound = newFixture.debugElement.query(By.css('.segment-detail__not-found'));
      expect(notFound).toBeTruthy();
    });
  });

  describe('null segmentId guards', () => {
    let nullComponent: SegmentDetailComponent;

    beforeEach(async () => {
      const nullRoute = {
        paramMap: of({
          get: () => null,
        }),
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SegmentDetailComponent],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: nullRoute },
          SegmentStore,
        ],
      }).compileComponents();

      const nullFixture = TestBed.createComponent(SegmentDetailComponent);
      nullComponent = nullFixture.componentInstance;
      nullFixture.detectChanges();
    });

    it('should return undefined segment when segmentId is null', () => {
      expect((nullComponent as never)['segment']()).toBeUndefined();
    });

    it('should return early from enterEditMode when segmentId is null', () => {
      (nullComponent as never)['enterEditMode']();
      expect((nullComponent as never)['isEditing']()).toBe(false);
    });

    it('should return early from saveEdit when segmentId is null', () => {
      expect(() => (nullComponent as never)['saveEdit']()).not.toThrow();
    });

    it('should return early from onRuleAdded when segmentId is null', () => {
      expect(() =>
        (nullComponent as never)['onRuleAdded']({
          attribute: 'email',
          operator: 'contains',
          value: 'test',
        })
      ).not.toThrow();
    });

    it('should return early from onRuleUpdated when segmentId is null', () => {
      expect(() =>
        (nullComponent as never)['onRuleUpdated']('rule_1', { value: 'test' })
      ).not.toThrow();
    });

    it('should return early from onRuleRemoved when segmentId is null', () => {
      expect(() =>
        (nullComponent as never)['onRuleRemoved']('rule_1')
      ).not.toThrow();
    });
  });
});
