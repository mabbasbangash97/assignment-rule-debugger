import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { RulesPanel } from './components/RulesPanel';
import { TransactionTable } from './components/TransactionTable';
import { TransactionDetail } from './components/TransactionDetail';
import { Pagination } from './components/Pagination';
import { SearchBar } from './components/SearchBar';
import { 
  useRules, 
  useTransactionsWithFeatures, 
  useRuleStatistics,
  useTransactionById 
} from './hooks/useData';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const { rules, loading: rulesLoading } = useRules();
  const { stats, loading: statsLoading } = useRuleStatistics();
  const { 
    transactions, 
    totalCount, 
    totalPages, 
    loading: transactionsLoading,
    sampledData
  } = useTransactionsWithFeatures(currentPage, searchQuery, selectedRuleId);
  
  const { transaction: selectedTransaction } = useTransactionById(selectedTransactionId);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedTransactionId(null);
  }, []);

  const handleTransactionSelect = useCallback((transactionId: string) => {
    setSelectedTransactionId(
      selectedTransactionId === transactionId ? null : transactionId
    );
  }, [selectedTransactionId]);

  const handleRuleSelect = useCallback((ruleId: string | null) => {
    setSelectedRuleId(ruleId);
    setCurrentPage(1);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <Header 
        totalTransactions={totalCount} 
        totalRules={rules.length} 
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Rules */}
        <aside className="sidebar">
          <RulesPanel
            rules={rules}
            stats={stats}
            transaction={selectedTransaction || undefined}
            features={selectedTransaction?.features}
            selectedRuleId={selectedRuleId}
            onRuleSelect={handleRuleSelect}
            loading={rulesLoading || statsLoading}
          />
        </aside>

        {/* Center Panel - Transactions */}
        <main className="main-panel">
          {/* Search and Filters */}
          <div className="search-bar-container">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by ID, sender, merchant, city, country..."
            />
            {sampledData && (
              <div className="filter-badge sampled-badge">
                <span>📊 Showing sampled data (10,000 transactions)</span>
              </div>
            )}
            {selectedRuleId && (
              <div className="filter-badge">
                <span>Filtered by: <code>{selectedRuleId}</code></span>
                <button onClick={() => handleRuleSelect(null)}>✕</button>
              </div>
            )}
          </div>

          {/* Transaction Table */}
          <TransactionTable
            transactions={transactions}
            selectedId={selectedTransactionId}
            onSelect={handleTransactionSelect}
            loading={transactionsLoading}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </main>

        {/* Right Panel - Transaction Detail */}
        <aside className="sidebar sidebar-right">
          <TransactionDetail
            transaction={selectedTransaction}
            rules={rules}
            onClose={() => setSelectedTransactionId(null)}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
