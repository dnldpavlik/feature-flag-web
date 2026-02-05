import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconComponent } from '@/app/shared/ui/icon/icon';
import { ButtonComponent } from '@/app/shared/ui/button/button';

@Component({
  selector: 'app-error-banner',
  imports: [IconComponent, ButtonComponent],
  templateUrl: './error-banner.html',
  styleUrl: './error-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorBannerComponent {
  readonly message = input('Something went wrong. Please try again.');
  readonly retryable = input(true);

  readonly retry = output<void>();

  protected onRetry(): void {
    this.retry.emit();
  }
}
