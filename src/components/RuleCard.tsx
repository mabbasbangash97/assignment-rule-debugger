import { useState } from 'react';
import type { RuleWithConditions, Transaction, FeatureVector, RuleEvaluationResult } from '../types';
import { evaluateRule, formatOperator, formatValue } from '../utils/ruleEvaluator';

interface RuleCardProps {
  rule: RuleWithConditions;
  transaction?: Transaction;
  features?: FeatureVector;
  triggeredCount?: number;
  percentage?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function RuleCard({ 
  rule, 
  transaction, 
  features, 
  triggeredCount, 
  percentage, 
  isSelected,
  onClick 
}: RuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  let evaluation: RuleEvaluationResult | null = null;
  if (transaction) {
    evaluation = evaluateRule(transaction, features, rule);
  }

  return (
    <div 
      className={`rule-card severity-${rule.severity.toLowerCase()} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="rule-card-header">
        <div className="rule-card-meta">
          <span className="rule-id">{rule.rule_id}</span>
          <span className={`action-badge ${rule.action.toLowerCase()}`}>
            {rule.action}
          </span>
        </div>
        <span className={`severity-badge ${rule.severity.toLowerCase()}`}>
          {rule.severity}
        </span>
      </div>
      
      <h3 className="rule-card-title">{rule.name}</h3>
      <p className="rule-card-description">{rule.description}</p>

      {/* Statistics */}
      {triggeredCount !== undefined && percentage !== undefined && (
        <div className="rule-stats">
          <div>
            <span>Triggered: </span>
            <span className={`value ${percentage > 10 ? 'high' : 'low'}`}>
              {triggeredCount.toLocaleString()}
            </span>
          </div>
          <div>
            <span>Rate: </span>
            <span className={`value ${percentage > 10 ? 'high' : 'low'}`}>
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Evaluation Result */}
      {evaluation && (
        <div className={`evaluation-result ${evaluation.triggered ? 'triggered' : 'not-triggered'}`}>
          {evaluation.triggered ? '⚠️ TRIGGERED' : '✓ Not Triggered'}
        </div>
      )}

      {/* Conditions Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="conditions-toggle"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>{rule.conditions.length} Condition{rule.conditions.length !== 1 ? 's' : ''}</span>
      </button>

      {/* Conditions Detail */}
      {expanded && (
        <div className="conditions-list">
          {rule.conditions.map((condition, idx) => {
            const condResult = evaluation?.conditions_met[idx];
            
            return (
              <div 
                key={idx}
                className={`condition-item ${condResult?.met ? 'met' : ''}`}
              >
                <div className="condition-header">
                  <code className="condition-code">
                    {condition.field} {formatOperator(condition.operator)} {formatValue(condition.value)}
                  </code>
                  {condResult && (
                    <span className={`condition-status ${condResult.met ? 'met' : 'not-met'}`}>
                      {condResult.met ? 'MET' : 'NOT MET'}
                    </span>
                  )}
                </div>
                <p className="condition-description">{condition.description}</p>
                {condResult && (
                  <div className="condition-actual">
                    <span>Actual: </span>
                    <span className="value">
                      {condResult.actual_value !== null && condResult.actual_value !== undefined 
                        ? String(condResult.actual_value) 
                        : 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
