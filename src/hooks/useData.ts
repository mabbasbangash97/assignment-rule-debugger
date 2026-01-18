// Data loading hooks for transactions, features, and rules
import { useState, useEffect, useMemo } from 'react';
import type { Transaction, FeatureVector, Rule, RuleWithConditions, TransactionWithFeatures } from '../types';
import { getRulesWithConditions } from '../data/ruleConditions';
import { getTriggeredRules } from '../utils/ruleEvaluator';

// Import JSON data
import rulesData from '../../../example_rules.json';

const ITEMS_PER_PAGE = 100;
const MAX_TRANSACTIONS = 10000; // Limit for performance

// Cache for loaded data
let transactionsCache: Transaction[] | null = null;
let featuresCache: Map<string, FeatureVector> | null = null;

// Helper to parse JSON with NaN values
async function fetchJsonWithNaN(path: string): Promise<unknown> {
  const response = await fetch(path);
  const text = await response.text();
  // Replace NaN with null for valid JSON parsing
  const cleanedText = text.replace(/:\s*NaN\b/g, ': null');
  return JSON.parse(cleanedText);
}

export function useRules(): { rules: RuleWithConditions[]; loading: boolean } {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<RuleWithConditions[]>([]);

  useEffect(() => {
    const rulesWithConditions = getRulesWithConditions(rulesData as Rule[]);
    setRules(rulesWithConditions);
    setLoading(false);
  }, []);

  return { rules, loading };
}

export function useTransactionsData(): {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
} {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionsCache) {
      setTransactions(transactionsCache);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchJsonWithNaN('/transactions.json') as Transaction[];
        // Sample data for performance
        const sampled = data.slice(0, MAX_TRANSACTIONS);
        transactionsCache = sampled;
        setTransactions(sampled);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { transactions, loading, error };
}

export function useFeatureVectors(): {
  features: Map<string, FeatureVector>;
  loading: boolean;
} {
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Map<string, FeatureVector>>(new Map());

  useEffect(() => {
    if (featuresCache) {
      setFeatures(featuresCache);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchJsonWithNaN('/feature_vectors.json') as FeatureVector[];
        const map = new Map<string, FeatureVector>();
        // Only load features for transactions we'll use
        data.slice(0, MAX_TRANSACTIONS).forEach(f => {
          map.set(f.transaction_id, f);
        });
        featuresCache = map;
        setFeatures(map);
      } catch (err) {
        console.error('Failed to load features:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { features, loading };
}

export function useTransactionsWithFeatures(
  page: number = 1,
  searchQuery: string = '',
  filterRuleId: string | null = null
): {
  transactions: TransactionWithFeatures[];
  totalCount: number;
  totalPages: number;
  loading: boolean;
  sampledData: boolean;
} {
  const { rules, loading: rulesLoading } = useRules();
  const { features, loading: featuresLoading } = useFeatureVectors();
  const { transactions: allTransactions, loading: transactionsLoading } = useTransactionsData();

  const loading = rulesLoading || featuresLoading || transactionsLoading;

  const filteredTransactions = useMemo(() => {
    if (loading) return [];
    
    let filtered = allTransactions;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.transaction_id.toLowerCase().includes(query) ||
        t.sender_account_id.toLowerCase().includes(query) ||
        t.merchant_description_condensed?.toLowerCase().includes(query) ||
        t.merchant_city?.toLowerCase().includes(query) ||
        t.merchant_country?.toLowerCase().includes(query)
      );
    }

    // Apply rule filter
    if (filterRuleId && rules.length > 0) {
      filtered = filtered.filter(t => {
        const feature = features.get(t.transaction_id);
        const triggeredRules = getTriggeredRules(t, feature, rules);
        return triggeredRules.includes(filterRuleId);
      });
    }

    return filtered;
  }, [allTransactions, searchQuery, filterRuleId, features, rules, loading]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, page]);

  const transactionsWithFeatures = useMemo(() => {
    if (loading) return [];

    return paginatedTransactions.map(t => {
      const feature = features.get(t.transaction_id);
      const triggeredRules = getTriggeredRules(t, feature, rules);
      return {
        ...t,
        features: feature,
        triggered_rules: triggeredRules
      };
    });
  }, [paginatedTransactions, features, rules, loading]);

  return {
    transactions: transactionsWithFeatures,
    totalCount: filteredTransactions.length,
    totalPages: Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE),
    loading,
    sampledData: allTransactions.length >= MAX_TRANSACTIONS
  };
}

export function useTransactionById(transactionId: string | null): {
  transaction: TransactionWithFeatures | null;
  loading: boolean;
} {
  const { rules, loading: rulesLoading } = useRules();
  const { features, loading: featuresLoading } = useFeatureVectors();
  const { transactions: allTransactions, loading: transactionsLoading } = useTransactionsData();

  const loading = rulesLoading || featuresLoading || transactionsLoading;

  const transaction = useMemo(() => {
    if (!transactionId || loading) return null;

    const t = allTransactions.find(tx => tx.transaction_id === transactionId);
    if (!t) return null;

    const feature = features.get(t.transaction_id);
    const triggeredRules = getTriggeredRules(t, feature, rules);

    return {
      ...t,
      features: feature,
      triggered_rules: triggeredRules
    };
  }, [transactionId, allTransactions, features, rules, loading]);

  return { transaction, loading };
}

export function useRuleStatistics(): {
  stats: { rule_id: string; triggered_count: number; percentage: number }[];
  loading: boolean;
} {
  const { rules, loading: rulesLoading } = useRules();
  const { features, loading: featuresLoading } = useFeatureVectors();
  const { transactions: allTransactions, loading: transactionsLoading } = useTransactionsData();
  const [stats, setStats] = useState<{ rule_id: string; triggered_count: number; percentage: number }[]>([]);

  const loading = rulesLoading || featuresLoading || transactionsLoading;

  useEffect(() => {
    if (loading || rules.length === 0 || allTransactions.length === 0) return;

    // Sample for statistics calculation
    const sampleSize = Math.min(2000, allTransactions.length);
    const step = Math.max(1, Math.floor(allTransactions.length / sampleSize));
    const sampledTransactions = allTransactions.filter((_, i) => i % step === 0).slice(0, sampleSize);

    const ruleStats = rules.map(rule => {
      const triggeredCount = sampledTransactions.filter(t => {
        const feature = features.get(t.transaction_id);
        const triggered = getTriggeredRules(t, feature, [rule]);
        return triggered.length > 0;
      }).length;

      return {
        rule_id: rule.rule_id,
        triggered_count: triggeredCount,
        percentage: (triggeredCount / sampledTransactions.length) * 100
      };
    });

    setStats(ruleStats);
  }, [allTransactions, features, rules, loading]);

  return { stats, loading };
}
