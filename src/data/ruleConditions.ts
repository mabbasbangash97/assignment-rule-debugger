// Rule conditions mapping - defines the actual logic for each rule
// These conditions use transaction and feature vector fields to evaluate

import type { RuleCondition, RuleWithConditions, Rule } from '../types';

// Define specific conditions for each rule based on their descriptions
export const ruleConditionsMap: Record<string, RuleCondition[]> = {
  RULE_001: [
    // High Value Transaction Alert - amount > threshold
    {
      field: 'amount',
      operator: 'gt',
      value: 5000,
      description: 'Transaction amount exceeds $5,000'
    }
  ],
  RULE_002: [
    // Multiple Small Transactions - high frequency + small amounts
    {
      field: 'transaction_count',
      operator: 'gt',
      value: 5,
      description: 'User has more than 5 transactions'
    },
    {
      field: 'amount',
      operator: 'lt',
      value: 100,
      description: 'Transaction amount is less than $100'
    }
  ],
  RULE_003: [
    // Unusual Transaction Type - type differs from user's typical pattern
    {
      field: 'transaction_type',
      operator: 'neq',
      value: 'online',
      description: 'Transaction type is not online (unusual for user)'
    },
    {
      field: 'amount',
      operator: 'gt',
      value: 500,
      description: 'Amount exceeds $500'
    }
  ],
  RULE_004: [
    // High-Risk Merchant - merchant country in high-risk list
    {
      field: 'merchant_country',
      operator: 'in',
      value: ['IRN', 'PRK', 'SYR', 'CUB', 'VEN'],
      description: 'Merchant located in high-risk country'
    }
  ],
  RULE_005: [
    // Cross-Border Anomaly - different country + significant amount
    {
      field: 'merchant_country',
      operator: 'not_in',
      value: ['USA', 'PAN'],
      description: 'Merchant country differs from typical (USA, PAN)'
    },
    {
      field: 'amount',
      operator: 'gt',
      value: 1000,
      description: 'Transaction amount exceeds $1,000'
    }
  ],
  RULE_006: [
    // Outside Normal Hours - transactions between 12AM-6AM
    {
      field: 'hour_of_day',
      operator: 'between',
      value: [0, 6],
      description: 'Transaction occurred between 12AM and 6AM'
    }
  ],
  RULE_007: [
    // Large Cash Withdrawal - ATM + large amount
    {
      field: 'transaction_type',
      operator: 'eq',
      value: 'atm',
      description: 'Transaction type is ATM withdrawal'
    },
    {
      field: 'amount',
      operator: 'gt',
      value: 1000,
      description: 'Withdrawal amount exceeds $1,000'
    }
  ]
};

export function getRulesWithConditions(rules: Rule[]): RuleWithConditions[] {
  return rules.map(rule => ({
    ...rule,
    conditions: ruleConditionsMap[rule.rule_id] || []
  }));
}

