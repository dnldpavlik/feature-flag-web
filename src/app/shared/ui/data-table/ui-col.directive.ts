import { Directive, TemplateRef, inject, input } from '@angular/core';
import { UiColAlign } from './ui-col-align.type';

@Directive({
  selector: 'ng-template[appUiCol]',
})
export class UiColDirective<T = unknown> {
  readonly tpl = inject<TemplateRef<{ $implicit: T; rowIndex?: number }>>(TemplateRef);
  key = input.required<string>({ alias: 'appUiCol' });
  header = input<string | undefined>();
  width = input<string | undefined>();
  align = input<UiColAlign>('left');
  sortable = input<boolean>(true);
  sortAccessor = input<((row: T) => unknown) | null>(null);
  sortCompare = input<((a: unknown, b: unknown) => number) | null>(null);
}
