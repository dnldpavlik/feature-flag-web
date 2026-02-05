import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { IconComponent } from '@/app/shared/ui/icon/icon';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
