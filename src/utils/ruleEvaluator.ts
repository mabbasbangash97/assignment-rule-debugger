// Rule Evaluation Engine
// Evaluates transactions against rules and their conditions

import type { Transaction, FeatureVector, RuleCondition, RuleWithConditions, RuleEvaluationResult } from '../types';

type EvaluationData = Transaction & Partial<FeatureVector>;

function getFieldValue(data: EvaluationData, field: string): unknown {
  return data[field as keyof EvaluationData];
}

function evaluateCondition(
  data: EvaluationData,
  condition: RuleCondition
): { met: boolean; actual_value: unknown } {
  const actualValue = getFieldValue(data, condition.field);
  
  if (actualValue === undefined || actualValue === null) {
    return { met: false, actual_value: actualValue };
  }

  let met = false;

  switch (condition.operator) {
    case 'gt':
      met = typeof actualValue === 'number' && actualValue > (condition.value as number);
      break;
    case 'lt':
      met = typeof actualValue === 'number' && actualValue < (condition.value as number);
      break;
    case 'gte':
      met = typeof actualValue === 'number' && actualValue >= (condition.value as number);
      break;
    case 'lte':
      met = typeof actualValue === 'number' && actualValue <= (condition.value as number);
      break;
    case 'eq':
      met = actualValue === condition.value;
      break;
    case 'neq':
      met = actualValue !== condition.value;
      break;
    case 'in':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      met = Array.isArray(condition.value) && condition.value.includes(actualValue as string);
      break;
    case 'not_in':
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      met = Array.isArray(condition.value) && !condition.value.includes(actualValue as string);
      break;
    case 'between':
      if (Array.isArray(condition.value) && condition.value.length === 2 && typeof actualValue === 'number') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        met = actualValue >= condition.value[0] && actualValue <= condition.value[1];
      }
      break;
    default:
      met = false;
  }

  return { met, actual_value: actualValue };
}

export function evaluateRule(
  transaction: Transaction,
  features: FeatureVector | undefined,
  rule: RuleWithConditions
): RuleEvaluationResult {
  const data: EvaluationData = {
    ...transaction,
    ...features
  };

  const conditionsResults = rule.conditions.map(condition => ({
    condition,
    ...evaluateCondition(data, condition)
  }));

  // Rule is triggered only if ALL conditions are met
  const triggered = conditionsResults.length > 0 && conditionsResults.every(r => r.met);

  return {
    rule_id: rule.rule_id,
    transaction_id: transaction.transaction_id,
    triggered,
    conditions_met: conditionsResults
  };
}

export function evaluateAllRules(
  transaction: Transaction,
  features: FeatureVector | undefined,
  rules: RuleWithConditions[]
): RuleEvaluationResult[] {
  return rules.map(rule => evaluateRule(transaction, features, rule));
}

export function getTriggeredRules(
  transaction: Transaction,
  features: FeatureVector | undefined,
  rules: RuleWithConditions[]
): string[] {
  return evaluateAllRules(transaction, features, rules)
    .filter(result => result.triggered)
    .map(result => result.rule_id);
}

export function formatOperator(operator: RuleCondition['operator']): string {
  const operatorMap: Record<RuleCondition['operator'], string> = {
    gt: '>',
    lt: '<',
    gte: '≥',
    lte: '≤',
    eq: '=',
    neq: '≠',
    in: 'IN',
    not_in: 'NOT IN',
    between: 'BETWEEN'
  };
  return operatorMap[operator];
}

export function formatValue(value: RuleCondition['value']): string {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }
  return String(value);
}

