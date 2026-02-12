import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { ButtonComponent } from '@watt/ui';
import {
  COMMON_ATTRIBUTES,
  CreateSegmentRuleInput,
  OPERATOR_OPTIONS,
  RuleOperator,
} from '../../models/segment-rule.model';
import { parseArrayValue } from '../../utils/segment-rule.utils';

@Component({
  selector: 'app-rule-builder',
  imports: [ButtonComponent],
  templateUrl: './rule-builder.html',
  styleUrl: './rule-builder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleBuilderComponent {
  readonly ruleAdded = output<CreateSegmentRuleInput>();

  protected readonly selectedAttribute = signal('');
  protected readonly customAttribute = signal('');
  protected readonly selectedOperator = signal<RuleOperator>('equals');
  protected readonly ruleValue = signal('');

  protected readonly attributeOptions = COMMON_ATTRIBUTES;
  protected readonly operatorOptions = OPERATOR_OPTIONS;

  protected readonly isCustomAttribute = computed(() => this.selectedAttribute() === 'custom');

  protected readonly isArrayOperator = computed(() => {
    const op = this.selectedOperator();
    return op === 'in' || op === 'not_in';
  });

  protected readonly valuePlaceholder = computed(() =>
    this.isArrayOperator() ? 'Values (comma-separated)' : 'Value',
  );

  protected readonly effectiveAttribute = computed(() =>
    this.isCustomAttribute() ? this.customAttribute() : this.selectedAttribute(),
  );

  protected readonly canAdd = computed(() => {
    const attr = this.effectiveAttribute().trim();
    const val = this.ruleValue().trim();
    return attr.length > 0 && val.length > 0;
  });

  protected onAttributeChange(event: Event): void {
    this.selectedAttribute.set((event.target as HTMLSelectElement).value);
  }

  protected onCustomAttributeInput(event: Event): void {
    this.customAttribute.set((event.target as HTMLInputElement).value);
  }

  protected onOperatorChange(event: Event): void {
    this.selectedOperator.set((event.target as HTMLSelectElement).value as RuleOperator);
  }

  protected onValueInput(event: Event): void {
    this.ruleValue.set((event.target as HTMLInputElement).value);
  }

  protected addRule(): void {
    if (!this.canAdd()) return;

    const attribute = this.effectiveAttribute().trim();
    const operator = this.selectedOperator();
    const rawValue = this.ruleValue().trim();

    const value = this.isArrayOperator() ? parseArrayValue(rawValue) : rawValue;

    this.ruleAdded.emit({
      attribute,
      operator,
      value,
    });

    this.resetForm();
  }

  private resetForm(): void {
    this.selectedAttribute.set('');
    this.customAttribute.set('');
    this.selectedOperator.set('equals');
    this.ruleValue.set('');
  }
}
