import type { TransactionWithFeatures, RuleWithConditions } from '../types';
import { evaluateRule } from '../utils/ruleEvaluator';

interface TransactionDetailProps {
  transaction: TransactionWithFeatures | null;
  rules: RuleWithConditions[];
  onClose?: () => void;
}

export function TransactionDetail({ transaction, rules, onClose }: TransactionDetailProps) {
  if (!transaction) {
    return (
      <div className="detail-placeholder">
        <div>
          <div className="detail-placeholder-icon">📄</div>
          <p>Select a transaction to view details</p>
        </div>
      </div>
    );
  }

  const evaluations = rules.map(rule => ({
    rule,
    result: evaluateRule(transaction, transaction.features, rule)
  }));

  const triggeredEvaluations = evaluations.filter(e => e.result.triggered);
  const notTriggeredEvaluations = evaluations.filter(e => !e.result.triggered);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="detail-header">
        <div>
          <h2 className="detail-title">
            <span>🔍</span>
            Transaction Detail
          </h2>
          <code style={{ color: 'var(--cyan-400)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}>
            {transaction.transaction_id}
          </code>
        </div>
        {onClose && (
          <button onClick={onClose} className="detail-close">✕</button>
        )}
      </div>

      <div className="detail-content">
        {/* Transaction Info */}
        <section className="detail-section">
          <h3 className="detail-section-title">Transaction Information</h3>
          <div className="detail-grid">
            <InfoField label="Date & Time" value={transaction.txn_date_time} />
            <InfoField 
              label="Amount" 
              value={`${transaction.currency} ${transaction.amount.toLocaleString()}`} 
              highlight={transaction.amount > 1000}
            />
            <InfoField label="Type" value={transaction.transaction_type} />
            <InfoField label="Terminal ID" value={String(transaction.terminal_id)} />
            <InfoField label="Sender ID" value={transaction.sender_account_id} mono />
            <InfoField label="Receiver ID" value={String(transaction.receiver_account_id)} mono />
            <InfoField label="Merchant" value={transaction.merchant_description_condensed || '-'} />
            <InfoField label="Location" value={`${transaction.merchant_city}, ${transaction.merchant_country}`} />
          </div>
        </section>

        {/* Feature Vector */}
        {transaction.features && (
          <section className="detail-section">
            <h3 className="detail-section-title">Feature Vector</h3>
            <div className="detail-grid">
              <InfoField 
                label="Transaction Count" 
                value={String(transaction.features.transaction_count)} 
                highlight={transaction.features.transaction_count > 5}
              />
              <InfoField 
                label="Avg Transaction Amount" 
                value={`$${transaction.features.avg_transaction_amount.toFixed(2)}`} 
              />
              <InfoField 
                label="Hour of Day" 
                value={`${transaction.features.hour_of_day}:00`}
                highlight={transaction.features.hour_of_day >= 0 && transaction.features.hour_of_day <= 6}
              />
              <InfoField 
                label="Day of Week" 
                value={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][transaction.features.day_of_week]} 
              />
              <InfoField 
                label="Merchant Avg Amount" 
                value={`$${transaction.features.merchant_avg_transaction_amount.toFixed(2)}`} 
              />
            </div>
          </section>
        )}

        {/* Triggered Rules */}
        <section className="detail-section">
          <h3 className="detail-section-title red">
            ⚠️ Triggered Rules ({triggeredEvaluations.length})
          </h3>
          {triggeredEvaluations.length > 0 ? (
            <div>
              {triggeredEvaluations.map(({ rule, result }) => (
                <RuleEvaluationCard key={rule.rule_id} rule={rule} result={result} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No rules triggered for this transaction
            </div>
          )}
        </section>

        {/* Non-Triggered Rules */}
        <section className="detail-section">
          <h3 className="detail-section-title green">
            ✓ Rules Not Triggered ({notTriggeredEvaluations.length})
          </h3>
          <div>
            {notTriggeredEvaluations.map(({ rule, result }) => (
              <RuleEvaluationCard key={rule.rule_id} rule={rule} result={result} collapsed />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoField({ 
  label, 
  value, 
  mono, 
  highlight 
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="detail-field">
      <div className="detail-field-label">{label}</div>
      <div className={`detail-field-value ${mono ? 'mono' : ''} ${highlight ? 'highlight' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function RuleEvaluationCard({ 
  rule, 
  result,
  collapsed 
}: { 
  rule: RuleWithConditions; 
  result: ReturnType<typeof evaluateRule>;
  collapsed?: boolean;
}) {
  const isTriggered = result.triggered;

  return (
    <div style={{
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: `1px solid ${isTriggered ? 'var(--red-700)' : 'var(--slate-700)'}`,
      background: isTriggered ? 'rgba(127, 29, 29, 0.3)' : 'rgba(30, 41, 59, 0.5)',
      marginBottom: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            {rule.rule_id}
          </span>
          <span style={{ color: 'white', fontWeight: 500, marginLeft: '0.5rem' }}>{rule.name}</span>
        </div>
        <span style={{
          padding: '0.125rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          background: isTriggered ? 'var(--red-600)' : 'var(--green-900)',
          color: isTriggered ? 'white' : 'var(--green-400)'
        }}>
          {isTriggered ? 'TRIGGERED' : 'PASS'}
        </span>
      </div>
      
      {!collapsed && (
        <div style={{ marginTop: '0.75rem' }}>
          {result.conditions_met.map((cond, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                background: cond.met ? 'rgba(127, 29, 29, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                marginBottom: '0.25rem'
              }}
            >
              <div>
                <code style={{ color: 'var(--cyan-400)' }}>{cond.condition.field}</code>
                <span style={{ color: 'var(--slate-400)', marginLeft: '0.5rem' }}>{cond.condition.description}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--slate-400)' }}>
                  Actual: <span style={{ color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>
                    {String(cond.actual_value ?? 'N/A')}
                  </span>
                </span>
                <span style={{ color: cond.met ? 'var(--red-400)' : 'var(--green-400)' }}>
                  {cond.met ? '✗ MET' : '✓ NOT MET'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
