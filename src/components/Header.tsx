interface HeaderProps {
  totalTransactions: number;
  totalRules: number;
}

export function Header({ totalTransactions, totalRules }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-title">
        <span style={{ fontSize: '2rem' }}>🛡️</span>
        <div>
          <h1>Rule Debugger</h1>
          <p>Financial Crime Detection • Rule Analysis Tool</p>
        </div>
      </div>
      
      <div className="header-stats">
        <div className="stat">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{totalTransactions.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon">📋</span>
          <div>
            <div className="stat-label">Active Rules</div>
            <div className="stat-value">{totalRules}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
