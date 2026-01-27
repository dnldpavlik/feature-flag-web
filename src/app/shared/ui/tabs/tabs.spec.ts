import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TabsComponent } from './tabs';
import { TabItem } from './tabs.types';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  const mockTabs: TabItem[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    { id: 'notifications', label: 'Notifications' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('tabs', mockTabs);
    fixture.componentRef.setInput('activeTabId', 'profile');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render tab buttons for each tab', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(tabButtons.length).toBe(3);
    });

    it('should display tab labels', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(tabButtons[0].nativeElement.textContent).toContain('Profile');
      expect(tabButtons[1].nativeElement.textContent).toContain('Settings');
      expect(tabButtons[2].nativeElement.textContent).toContain('Notifications');
    });

    it('should render icon when provided', () => {
      const tabsWithIcon: TabItem[] = [
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ];
      fixture.componentRef.setInput('tabs', tabsWithIcon);
      fixture.componentRef.setInput('activeTabId', 'settings');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeTruthy();
    });

    it('should not render icon when not provided', () => {
      const tabsWithoutIcon: TabItem[] = [{ id: 'profile', label: 'Profile' }];
      fixture.componentRef.setInput('tabs', tabsWithoutIcon);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });
  });

  describe('active state', () => {
    it('should apply active class to the active tab', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'settings');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(
        tabButtons[0].nativeElement.classList.contains('tabs__tab--active')
      ).toBe(false);
      expect(
        tabButtons[1].nativeElement.classList.contains('tabs__tab--active')
      ).toBe(true);
      expect(
        tabButtons[2].nativeElement.classList.contains('tabs__tab--active')
      ).toBe(false);
    });

    it('should update active class when activeTabId changes', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      let tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(
        tabButtons[0].nativeElement.classList.contains('tabs__tab--active')
      ).toBe(true);

      fixture.componentRef.setInput('activeTabId', 'notifications');
      fixture.detectChanges();

      tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(
        tabButtons[0].nativeElement.classList.contains('tabs__tab--active')
      ).toBe(false);
      expect(
        tabButtons[2].nativeElement.classList.contains('tabs__tab--active')
      ).toBe(true);
    });
  });

  describe('click events', () => {
    it('should emit tabChange when tab is clicked', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[1].nativeElement.click();

      expect(tabChangeSpy).toHaveBeenCalledWith('settings');
    });

    it('should not emit tabChange when clicking the active tab', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[0].nativeElement.click();

      expect(tabChangeSpy).not.toHaveBeenCalled();
    });

    it('should not emit tabChange when clicking a disabled tab', () => {
      const tabsWithDisabled: TabItem[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'settings', label: 'Settings', disabled: true },
      ];
      fixture.componentRef.setInput('tabs', tabsWithDisabled);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[1].nativeElement.click();

      expect(tabChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should apply disabled class to disabled tabs', () => {
      const tabsWithDisabled: TabItem[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'settings', label: 'Settings', disabled: true },
      ];
      fixture.componentRef.setInput('tabs', tabsWithDisabled);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(
        tabButtons[0].nativeElement.classList.contains('tabs__tab--disabled')
      ).toBe(false);
      expect(
        tabButtons[1].nativeElement.classList.contains('tabs__tab--disabled')
      ).toBe(true);
    });

    it('should set aria-disabled on disabled tabs', () => {
      const tabsWithDisabled: TabItem[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'settings', label: 'Settings', disabled: true },
      ];
      fixture.componentRef.setInput('tabs', tabsWithDisabled);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(tabButtons[0].nativeElement.getAttribute('aria-disabled')).toBe(
        null
      );
      expect(tabButtons[1].nativeElement.getAttribute('aria-disabled')).toBe(
        'true'
      );
    });
  });

  describe('accessibility', () => {
    it('should have role="tablist" on the container', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.tabs'));
      expect(container.nativeElement.getAttribute('role')).toBe('tablist');
    });

    it('should have role="tab" on each tab button', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons.forEach((button) => {
        expect(button.nativeElement.getAttribute('role')).toBe('tab');
      });
    });

    it('should set aria-selected on tabs', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'settings');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(tabButtons[0].nativeElement.getAttribute('aria-selected')).toBe(
        'false'
      );
      expect(tabButtons[1].nativeElement.getAttribute('aria-selected')).toBe(
        'true'
      );
      expect(tabButtons[2].nativeElement.getAttribute('aria-selected')).toBe(
        'false'
      );
    });

    it('should set tabindex on tabs', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'settings');
      fixture.detectChanges();

      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      expect(tabButtons[0].nativeElement.getAttribute('tabindex')).toBe('-1');
      expect(tabButtons[1].nativeElement.getAttribute('tabindex')).toBe('0');
      expect(tabButtons[2].nativeElement.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate to next tab with ArrowRight', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('settings');
    });

    it('should navigate to previous tab with ArrowLeft', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'settings');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[1].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('profile');
    });

    it('should wrap to first tab when pressing ArrowRight on last tab', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'notifications');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[2].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('profile');
    });

    it('should wrap to last tab when pressing ArrowLeft on first tab', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('notifications');
    });

    it('should skip disabled tabs when navigating', () => {
      const tabsWithDisabled: TabItem[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'settings', label: 'Settings', disabled: true },
        { id: 'notifications', label: 'Notifications' },
      ];
      fixture.componentRef.setInput('tabs', tabsWithDisabled);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('notifications');
    });

    it('should navigate to first tab with Home key', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'notifications');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[2].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('profile');
    });

    it('should navigate to last tab with End key', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End' })
      );

      expect(tabChangeSpy).toHaveBeenCalledWith('notifications');
    });

    it('should not emit tabChange for unrecognized keys', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter' })
      );

      expect(tabChangeSpy).not.toHaveBeenCalled();
    });

    it('should not emit tabChange when navigating from disabled tab', () => {
      const tabsWithDisabled: TabItem[] = [
        { id: 'profile', label: 'Profile', disabled: true },
        { id: 'settings', label: 'Settings' },
      ];
      fixture.componentRef.setInput('tabs', tabsWithDisabled);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      // Simulate keydown on disabled tab (not in enabled list)
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );

      expect(tabChangeSpy).not.toHaveBeenCalled();
    });

    it('should not emit tabChange when Home navigates to active tab', () => {
      fixture.componentRef.setInput('tabs', mockTabs);
      fixture.componentRef.setInput('activeTabId', 'profile');
      fixture.detectChanges();

      const tabChangeSpy = jest.spyOn(component.tabChange, 'emit');
      const tabButtons = fixture.debugElement.queryAll(By.css('.tabs__tab'));
      // Press Home when already on first tab
      tabButtons[0].nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home' })
      );

      expect(tabChangeSpy).not.toHaveBeenCalled();
    });
  });
});
