// Type definitions for the Rule Debugging UI
// Version: 1.0

export interface Transaction {
  transaction_id: string;
  txn_date_time: string;
  sender_account_id: string;
  receiver_account_id: number;
  amount: number;
  currency: string;
  transaction_type: string;
  terminal_id: number;
  merchant_city: string;
  merchant_country: string;
  merchant_postcode: string | null;
  merchant_description_condensed: string;
}

export interface FeatureVector {
  transaction_id: string;
  sender_account_id: string;
  receiver_account_id: number;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_count: number;
  avg_transaction_amount: number;
  hour_of_day: number;
  day_of_week: number;
  merchant_avg_transaction_amount: number;
}

export interface Rule {
  rule_id: string;
  name: string;
  description: string;
  action: 'Alert' | 'Review' | 'Investigate' | 'Block';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RuleCondition {
  field: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'in' | 'not_in' | 'between';
  value: number | string | number[] | string[];
  description: string;
}

export interface RuleWithConditions extends Rule {
  conditions: RuleCondition[];
}

export interface RuleEvaluationResult {
  rule_id: string;
  transaction_id: string;
  triggered: boolean;
  conditions_met: { condition: RuleCondition; met: boolean; actual_value: unknown }[];
}

export interface TransactionWithFeatures extends Transaction {
  features?: FeatureVector;
  triggered_rules?: string[];
}

