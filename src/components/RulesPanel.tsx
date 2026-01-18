import type { RuleWithConditions, Transaction, FeatureVector } from '../types';
import { RuleCard } from './RuleCard';

interface RulesPanelProps {
  rules: RuleWithConditions[];
  stats?: { rule_id: string; triggered_count: number; percentage: number }[];
  transaction?: Transaction;
  features?: FeatureVector;
  selectedRuleId?: string | null;
  onRuleSelect?: (ruleId: string | null) => void;
  loading?: boolean;
}

export function RulesPanel({ 
  rules, 
  stats, 
  transaction, 
  features, 
  selectedRuleId,
  onRuleSelect,
  loading 
}: RulesPanelProps) {
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner">Loading rules...</div>
      </div>
    );
  }

  const getStatsForRule = (ruleId: string) => {
    return stats?.find(s => s.rule_id === ruleId);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <span>📋</span>
          Rules
          <span className="sidebar-count">({rules.length})</span>
        </h2>
        {selectedRuleId && (
          <button onClick={() => onRuleSelect?.(null)} className="clear-filter-btn">
            Clear Filter
          </button>
        )}
      </div>

      {transaction && (
        <div className="evaluating-banner">
          <span style={{ fontWeight: 500 }}>Evaluating against: </span>
          <code>{transaction.transaction_id}</code>
        </div>
      )}

      <div className="rules-list">
        {rules.map(rule => {
          const ruleStats = getStatsForRule(rule.rule_id);
          return (
            <RuleCard
              key={rule.rule_id}
              rule={rule}
              transaction={transaction}
              features={features}
              triggeredCount={ruleStats?.triggered_count}
              percentage={ruleStats?.percentage}
              isSelected={selectedRuleId === rule.rule_id}
              onClick={() => onRuleSelect?.(
                selectedRuleId === rule.rule_id ? null : rule.rule_id
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
