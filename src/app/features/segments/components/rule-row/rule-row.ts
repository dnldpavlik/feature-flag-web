import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ButtonComponent } from '@watt/ui';
import {
  OPERATOR_OPTIONS,
  RuleOperator,
  SegmentRule,
  UpdateSegmentRuleInput,
} from '../../models/segment-rule.model';
import { formatRuleValue, getOperatorLabel, parseArrayValue } from '../../utils/segment-rule.utils';

@Component({
  selector: 'app-rule-row',
  imports: [ButtonComponent],
  templateUrl: './rule-row.html',
  styleUrl: './rule-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleRowComponent {
  readonly rule = input.required<SegmentRule>();

  readonly updated = output<UpdateSegmentRuleInput>();
  readonly removed = output<string>();

  protected readonly isEditing = signal(false);
  protected readonly editAttribute = signal('');
  protected readonly editOperator = signal<RuleOperator>('equals');
  protected readonly editValue = signal('');

  protected readonly operatorOptions = OPERATOR_OPTIONS;

  protected readonly displayValue = computed(() =>
    formatRuleValue(this.rule().operator, this.rule().value),
  );

  protected readonly operatorLabel = computed(() => getOperatorLabel(this.rule().operator));

  protected enterEditMode(): void {
    const rule = this.rule();
    this.editAttribute.set(rule.attribute);
    this.editOperator.set(rule.operator);
    this.editValue.set(formatRuleValue(rule.operator, rule.value));
    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
  }

  protected onAttributeInput(event: Event): void {
    this.editAttribute.set((event.target as HTMLInputElement).value);
  }

  protected onOperatorChange(event: Event): void {
    this.editOperator.set((event.target as HTMLSelectElement).value as RuleOperator);
  }

  protected onValueInput(event: Event): void {
    this.editValue.set((event.target as HTMLInputElement).value);
  }

  protected saveEdit(): void {
    const operator = this.editOperator();
    const isArrayOperator = operator === 'in' || operator === 'not_in';
    const value = isArrayOperator ? parseArrayValue(this.editValue()) : this.editValue();

    this.updated.emit({
      attribute: this.editAttribute(),
      operator,
      value,
    });
    this.isEditing.set(false);
  }

  protected onRemove(): void {
    this.removed.emit(this.rule().id);
  }
}
