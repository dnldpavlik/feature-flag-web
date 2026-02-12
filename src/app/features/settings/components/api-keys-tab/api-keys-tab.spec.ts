import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ApiKeyStore } from '../../store/api-key.store';
import { ApiKeysTabComponent } from './api-keys-tab';
import { MOCK_API_PROVIDERS } from '@/app/testing';

describe('ApiKeysTabComponent', () => {
  let fixture: ComponentFixture<ApiKeysTabComponent>;
  let component: ApiKeysTabComponent;
  let apiKeyStore: ApiKeyStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiKeysTabComponent],
      providers: [ApiKeyStore, ...MOCK_API_PROVIDERS],
    }).compileComponents();

    apiKeyStore = TestBed.inject(ApiKeyStore);
    await apiKeyStore.loadApiKeys();
    fixture = TestBed.createComponent(ApiKeysTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('keys table', () => {
    it('should render API keys table', () => {
      const table = fixture.debugElement.query(By.css('ui-data-table'));
      expect(table).toBeTruthy();
    });

    it('should display existing API keys', () => {
      const rows = fixture.debugElement.queryAll(By.css('.data-table__body-wrap tbody tr'));
      expect(rows.length).toBe(apiKeyStore.apiKeys().length);
    });

    it('should display key name', () => {
      const firstKey = apiKeyStore.apiKeys()[0];
      const nameCell = fixture.debugElement.query(
        By.css('.data-table__body-wrap tbody tr .api-keys-tab__key-name'),
      );
      expect(nameCell.nativeElement.textContent).toContain(firstKey.name);
    });

    it('should display masked key prefix', () => {
      const firstKey = apiKeyStore.apiKeys()[0];
      const prefixCell = fixture.debugElement.query(
        By.css('.data-table__body-wrap tbody tr .api-keys-tab__key-prefix'),
      );
      expect(prefixCell.nativeElement.textContent).toContain(firstKey.prefix);
    });

    it('should display scopes', () => {
      const firstKey = apiKeyStore.apiKeys()[0];
      const scopesCell = fixture.debugElement.query(
        By.css('.data-table__body-wrap tbody tr .api-keys-tab__key-scopes'),
      );
      expect(scopesCell.nativeElement.textContent).toContain(firstKey.scopes[0]);
    });

    it('should have revoke button for each key', () => {
      const revokeButtons = fixture.debugElement.queryAll(
        By.css('ui-button.api-keys-tab__revoke-btn'),
      );
      expect(revokeButtons.length).toBe(apiKeyStore.apiKeys().length);
    });
  });

  describe('create key button', () => {
    it('should render create key button', () => {
      const button = fixture.debugElement.query(By.css('ui-button.api-keys-tab__create-btn'));
      expect(button).toBeTruthy();
    });

    it('should show create form when clicked', () => {
      const button = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__create-btn button'),
      );
      button.nativeElement.click();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('.api-keys-tab__create-form'));
      expect(form).toBeTruthy();
    });
  });

  describe('create key form', () => {
    beforeEach(() => {
      component.showCreateForm.set(true);
      fixture.detectChanges();
    });

    it('should render name input', () => {
      const input = fixture.debugElement.query(By.css('input#key-name'));
      expect(input).toBeTruthy();
    });

    it('should render scope checkboxes', () => {
      const checkboxes = fixture.debugElement.queryAll(
        By.css('input[type="checkbox"].api-keys-tab__scope-checkbox'),
      );
      expect(checkboxes.length).toBe(3); // read:flags, write:flags, admin
    });

    it('should have submit button', () => {
      const button = fixture.debugElement.query(By.css('ui-button.api-keys-tab__submit-btn'));
      expect(button).toBeTruthy();
    });

    it('should have cancel button', () => {
      const button = fixture.debugElement.query(By.css('ui-button.api-keys-tab__cancel-btn'));
      expect(button).toBeTruthy();
    });

    it('should disable submit when name is empty', () => {
      const button = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__submit-btn button'),
      );
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should disable submit when no scopes selected', () => {
      const nameInput = fixture.debugElement.query(By.css('input#key-name'));
      nameInput.nativeElement.value = 'Test Key';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__submit-btn button'),
      );
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should enable submit when name and scope provided', () => {
      const nameInput = fixture.debugElement.query(By.css('input#key-name'));
      nameInput.nativeElement.value = 'Test Key';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      const scopeCheckbox = fixture.debugElement.query(By.css('input[value="read:flags"]'));
      scopeCheckbox.nativeElement.click();
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__submit-btn button'),
      );
      expect(button.nativeElement.disabled).toBe(false);
    });

    it('should remove scope when unchecked', () => {
      // First, check a scope
      const scopeCheckbox = fixture.debugElement.query(By.css('input[value="read:flags"]'));
      scopeCheckbox.nativeElement.click();
      fixture.detectChanges();

      expect(component['selectedScopes']()).toContain('read:flags');

      // Now uncheck it
      scopeCheckbox.nativeElement.click();
      fixture.detectChanges();

      expect(component['selectedScopes']()).not.toContain('read:flags');
    });

    it('should create key and show secret on submit', async () => {
      const nameInput = fixture.debugElement.query(By.css('input#key-name'));
      nameInput.nativeElement.value = 'New Test Key';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      const scopeCheckbox = fixture.debugElement.query(By.css('input[value="read:flags"]'));
      scopeCheckbox.nativeElement.click();
      fixture.detectChanges();

      const beforeCount = apiKeyStore.apiKeys().length;
      // Call the method directly to properly await the async operation
      await component['createKey']();
      fixture.detectChanges();

      expect(apiKeyStore.apiKeys().length).toBe(beforeCount + 1);
      expect(component.createdSecret()).toBeTruthy();
    });

    it('should not create key when validation fails', async () => {
      // No name or scope entered
      const beforeCount = apiKeyStore.apiKeys().length;

      // Manually call createKey bypassing button disabled state
      await component['createKey']();
      fixture.detectChanges();

      expect(apiKeyStore.apiKeys().length).toBe(beforeCount);
    });

    it('should not set createdSecret when createApiKey returns null', async () => {
      jest.spyOn(apiKeyStore, 'createApiKey').mockResolvedValue(null);

      const nameInput = fixture.debugElement.query(By.css('input#key-name'));
      nameInput.nativeElement.value = 'Test Key';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      const scopeCheckbox = fixture.debugElement.query(By.css('input[value="read:flags"]'));
      scopeCheckbox.nativeElement.click();
      fixture.detectChanges();

      await component['createKey']();
      fixture.detectChanges();

      expect(component.createdSecret()).toBeNull();
    });

    it('should hide form on cancel', () => {
      const cancelButton = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__cancel-btn button'),
      );
      cancelButton.nativeElement.click();
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('.api-keys-tab__create-form'));
      expect(form).toBeFalsy();
    });
  });

  describe('secret display', () => {
    it('should show secret after key creation', async () => {
      component.showCreateForm.set(true);
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(By.css('input#key-name'));
      nameInput.nativeElement.value = 'Secret Key';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      const scopeCheckbox = fixture.debugElement.query(By.css('input[value="read:flags"]'));
      scopeCheckbox.nativeElement.click();
      fixture.detectChanges();

      // Call the method directly to properly await the async operation
      await component['createKey']();
      fixture.detectChanges();

      const secretDisplay = fixture.debugElement.query(By.css('.api-keys-tab__secret-display'));
      expect(secretDisplay).toBeTruthy();
    });

    it('should have copy button for secret', () => {
      component.createdSecret.set('sk_live_abc123');
      fixture.detectChanges();

      const copyButton = fixture.debugElement.query(By.css('ui-button.api-keys-tab__copy-btn'));
      expect(copyButton).toBeTruthy();
    });

    it('should copy secret to clipboard when copy button clicked', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
      });

      component.createdSecret.set('sk_live_test_secret');
      fixture.detectChanges();

      await component['copySecret']();

      expect(mockWriteText).toHaveBeenCalledWith('sk_live_test_secret');
    });

    it('should not copy when secret is null', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
      });

      component.createdSecret.set(null);

      await component['copySecret']();

      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('should show warning about one-time display', () => {
      component.createdSecret.set('sk_live_abc123');
      fixture.detectChanges();

      const warning = fixture.debugElement.query(By.css('.api-keys-tab__secret-warning'));
      expect(warning).toBeTruthy();
    });

    it('should have done button to dismiss secret', () => {
      component.createdSecret.set('sk_live_abc123');
      fixture.detectChanges();

      const doneButton = fixture.debugElement.query(By.css('ui-button.api-keys-tab__done-btn'));
      expect(doneButton).toBeTruthy();
    });

    it('should clear secret on done', () => {
      component.createdSecret.set('sk_live_abc123');
      fixture.detectChanges();

      const doneButton = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__done-btn button'),
      );
      doneButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.createdSecret()).toBeNull();
    });
  });

  describe('revoke confirmation', () => {
    it('should show confirmation when revoke clicked', () => {
      const revokeButton = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__revoke-btn button'),
      );
      revokeButton.nativeElement.click();
      fixture.detectChanges();

      const confirmation = fixture.debugElement.query(By.css('.api-keys-tab__confirm-revoke'));
      expect(confirmation).toBeTruthy();
    });

    it('should revoke key on confirm', async () => {
      const firstKeyId = apiKeyStore.apiKeys()[0].id;
      const beforeCount = apiKeyStore.apiKeys().length;

      component.keyToRevoke.set(firstKeyId);
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__confirm-revoke-btn button'),
      );
      confirmButton.nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(apiKeyStore.apiKeys().length).toBe(beforeCount - 1);
      expect(apiKeyStore.apiKeys().find((k) => k.id === firstKeyId)).toBeUndefined();
    });

    it('should cancel revoke on cancel', () => {
      const firstKeyId = apiKeyStore.apiKeys()[0].id;
      const beforeCount = apiKeyStore.apiKeys().length;

      component.keyToRevoke.set(firstKeyId);
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(
        By.css('ui-button.api-keys-tab__cancel-revoke-btn button'),
      );
      cancelButton.nativeElement.click();
      fixture.detectChanges();

      expect(apiKeyStore.apiKeys().length).toBe(beforeCount);
      expect(component.keyToRevoke()).toBeNull();
    });

    it('should not revoke when keyToRevoke is null', async () => {
      const beforeCount = apiKeyStore.apiKeys().length;

      component.keyToRevoke.set(null);
      await component['revokeKey']();
      fixture.detectChanges();

      expect(apiKeyStore.apiKeys().length).toBe(beforeCount);
    });
  });

  describe('empty state', () => {
    it('should show empty state when no keys exist', async () => {
      // Revoke all existing keys
      const keys = [...apiKeyStore.apiKeys()];
      for (const key of keys) {
        await apiKeyStore.revokeApiKey(key.id);
      }
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.api-keys-tab__empty'));
      expect(emptyState).toBeTruthy();
    });
  });
});
