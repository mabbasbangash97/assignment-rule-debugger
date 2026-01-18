import type { TransactionWithFeatures } from '../types';

interface TransactionTableProps {
  transactions: TransactionWithFeatures[];
  selectedId?: string | null;
  onSelect?: (transactionId: string) => void;
  loading?: boolean;
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  PAB: 'B/.',
  BRL: 'R$',
  EUR: '€',
  GBP: '£'
};

export function TransactionTable({ 
  transactions, 
  selectedId, 
  onSelect, 
  loading 
}: TransactionTableProps) {
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="loading">
        <div>No transactions found</div>
      </div>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'online': return 'online';
      case 'contactless': return 'contactless';
      case 'atm': return 'atm';
      default: return 'other';
    }
  };

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date & Time</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Merchant</th>
            <th>Location</th>
            <th>Rules Triggered</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr
              key={tx.transaction_id}
              onClick={() => onSelect?.(tx.transaction_id)}
              className={`
                ${selectedId === tx.transaction_id ? 'selected' : ''}
                ${tx.triggered_rules && tx.triggered_rules.length > 0 ? 'has-alerts' : ''}
              `}
            >
              <td>
                <code className="txn-id">{tx.transaction_id}</code>
              </td>
              <td style={{ color: 'var(--slate-300)' }}>
                {formatDate(tx.txn_date_time)}
              </td>
              <td>
                <span className={`amount ${tx.amount > 1000 ? 'high' : 'normal'}`}>
                  {formatAmount(tx.amount, tx.currency)}
                </span>
              </td>
              <td>
                <span className={`type-badge ${getTypeClass(tx.transaction_type)}`}>
                  {tx.transaction_type}
                </span>
              </td>
              <td>
                <span className="merchant-name" title={tx.merchant_description_condensed}>
                  {tx.merchant_description_condensed || '-'}
                </span>
              </td>
              <td className="location">
                <span>{tx.merchant_city}</span>
                {tx.merchant_country && (
                  <span className="country-badge">{tx.merchant_country}</span>
                )}
              </td>
              <td>
                {tx.triggered_rules && tx.triggered_rules.length > 0 ? (
                  <div className="rule-badges">
                    {tx.triggered_rules.map(ruleId => (
                      <span key={ruleId} className="rule-badge">
                        {ruleId.replace('RULE_', 'R')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--slate-500)' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
