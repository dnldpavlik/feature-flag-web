import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { IconComponent } from '@/app/shared/ui/icon/icon';
import { TabItem } from './tabs.types';

@Component({
  selector: 'app-tabs',
  imports: [IconComponent],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  /** List of tabs to display */
  readonly tabs = input.required<TabItem[]>();

  /** ID of the currently active tab */
  readonly activeTabId = input.required<string>();

  /** Emitted when a tab is selected */
  readonly tabChange = output<string>();

  /** Get enabled tabs for navigation */
  protected readonly enabledTabs = computed(() =>
    this.tabs().filter((tab) => !tab.disabled)
  );

  /** Handle tab click */
  protected onTabClick(tab: TabItem): void {
    if (tab.disabled || tab.id === this.activeTabId()) {
      return;
    }
    this.tabChange.emit(tab.id);
  }

  /** Handle keyboard navigation */
  protected onKeyDown(event: KeyboardEvent, currentTab: TabItem): void {
    const enabled = this.enabledTabs();
    const currentIndex = enabled.findIndex((t) => t.id === currentTab.id);

    if (currentIndex === -1) return;

    let nextTab: TabItem | undefined;

    switch (event.key) {
      case 'ArrowRight':
        nextTab = enabled[(currentIndex + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        nextTab = enabled[(currentIndex - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        nextTab = enabled[0];
        break;
      case 'End':
        nextTab = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    if (nextTab && nextTab.id !== this.activeTabId()) {
      event.preventDefault();
      this.tabChange.emit(nextTab.id);
    }
  }

  /** Check if a tab is active */
  protected isActive(tabId: string): boolean {
    return tabId === this.activeTabId();
  }
}
