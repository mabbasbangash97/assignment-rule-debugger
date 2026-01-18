# ️ Rule Debugger


![React 19](https://img.shields.io/badge/React-19-blue) ![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7.3-purple)

##  Purpose

This UI facilitates the understanding and debugging of fraud detection rules by:
- Visually representing how transactions interact with rules
- Showing which rules trigger for specific transactions
- Allowing users to "step through" rule evaluation logic
- Linking transactions, feature vectors, and rules together

##  Quick Start

```bash
# Navigate to the project directory
cd rule-debugger

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

**Note**: The JSON data files (`transactions.json`, `feature_vectors.json`) need to be copied to the `public/` folder for the app to load them. This has already been done.

## ️ Architecture & Approach

### Technology Stack
- **React 19** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Vanilla CSS** with CSS variables for consistent styling
- **Custom Hooks** for data management and business logic

### Key Design Decisions

1. **Three-Panel Layout**
   - **Left Panel (Rules)**: Displays all 7 rules with expandable condition details and statistics
   - **Center Panel (Transactions)**: Paginated table with search and filtering (10,000 transactions)
   - **Right Panel (Detail)**: Deep-dive view of selected transaction with full rule evaluation

2. **Rule Evaluation Engine**
   - Centralized `ruleEvaluator.ts` handles all rule logic
   - Conditions defined in `ruleConditions.ts` with clear operators (gt, lt, eq, in, between, etc.)
   - Real-time evaluation shows MET/NOT MET status for each condition

3. **Performance Optimizations**
   - Data sampled to 10,000 transactions for smooth performance
   - NaN values in JSON handled gracefully
   - Memoized computations to prevent unnecessary recalculations
   - Pagination (100 items per page)

4. **User Experience**
   - Color-coded severity levels (Critical=red, High=orange, Medium=yellow, Low=blue)
   - Visual indicators for triggered rules
   - Search by transaction ID, sender, merchant, location
   - Click-to-filter by rule to see only matching transactions

## 📁 Project Structure

```
rule-debugger/
├── public/
│   ├── transactions.json        # Transaction data
│   └── feature_vectors.json     # Feature vectors
├── src/
│   ├── components/
│   │   ├── Header.tsx           # App header with stats
│   │   ├── RuleCard.tsx         # Individual rule display
│   │   ├── RulesPanel.tsx       # Rules list container
│   │   ├── TransactionTable.tsx # Transaction list
│   │   ├── TransactionDetail.tsx# Detailed view
│   │   ├── Pagination.tsx       # Page navigation
│   │   └── SearchBar.tsx        # Search input
│   ├── data/
│   │   └── ruleConditions.ts    # Rule condition definitions
│   ├── hooks/
│   │   └── useData.ts           # Data loading hooks
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── ruleEvaluator.ts     # Rule evaluation logic
│   ├── App.tsx                  # Main application
│   └── index.css                # Global styles
└── package.json
```

##  Data Sources

The application uses three JSON data files:

| File | Description | Records |
|------|-------------|---------|
| `transactions.json` | Raw transaction records with amounts, merchants, locations | ~545K lines |
| `feature_vectors.json` | Pre-computed features (transaction count, averages, time) | ~506K lines |
| `example_rules.json` | 7 rule definitions with severity and action types | 7 rules |

## 🔧 Rule Configuration

Rules are defined in `src/data/ruleConditions.ts`. Each rule has:
- **Conditions**: Array of field checks (e.g., `amount > 5000`)
- **Operators**: gt, lt, gte, lte, eq, neq, in, not_in, between
- **Description**: Human-readable explanation

### Example Rule Definition:
```typescript
RULE_001: [
  {
    field: 'amount',
    operator: 'gt',
    value: 5000,
    description: 'Transaction amount exceeds $5,000'
  }
]
```

## ✨ Features

### Rule Debugging
- View all 7 rules with their conditions
- See which conditions are MET/NOT MET for any transaction
- Expand rules to inspect individual condition logic
- Filter transactions by specific rules
- Rule statistics showing triggered count and percentage

### Transaction Analysis
- Browse 10,000 transactions with pagination
- Search by ID, sender, merchant, city, or country
- View triggered rules inline as badges (R001, R002, etc.)
- Select transaction for detailed evaluation

### Feature Vector Display
- Shows derived features for each transaction
- Transaction count, average amounts, hour of day, day of week
- Highlights anomalous values (e.g., early morning hours)

##  UI Design

The interface uses a dark theme optimized for data analysis:
- **Slate color palette** for backgrounds
- **Cyan accents** for interactive elements
- **Severity-based colors**: Red (Critical), Orange (High), Yellow (Medium), Blue (Low)
- **JetBrains Mono** for code/data display
- **Space Grotesk** for UI text

## 📝 Future Enhancements

Potential improvements for production use:
- [ ] Backend API for full dataset access
- [ ] Rule editor with live preview
- [ ] Export filtered transactions
- [ ] Historical rule performance tracking
- [ ] Custom rule creation interface
- [ ] Batch evaluation mode

## ️ Development

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

---

*Technologies: React 19, TypeScript, Vite, CSS Variables*
