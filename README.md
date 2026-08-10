# Expanse Tracker

MASTER PROMPT — PERSONAL FINANCE & EXPENSE ANALYTICS FRONTEND

You are a senior React frontend architect and UI/UX engineer.

Build a production-quality frontend for a Personal Finance & Expense Analytics application.

The backend will be a Spring Boot REST API.

The application allows users to:

Register/login.

Manage bank accounts and credit cards.

Upload bank/credit-card PDF statements.

View statement processing status.

Review imported transactions.

View automatically assigned expense categories.

Correct categories.

Add manual expenses.

Add manual income.

View monthly financial dashboards.

View yearly financial dashboards.

View category-wise spending.

View spending as a percentage of monthly credited amount.

Review low-confidence AI categorizations.

View transaction history and filter it.

The UI must be clean, modern, responsive, and suitable for a real financial application.

1. TECHNOLOGY STACK

Use:

React

TypeScript

Vite

React Router

TanStack Query / React Query

Axios

Recharts

React Hook Form

Zod

Tailwind CSS

Lucide React icons

Do not use Next.js.

Use TypeScript strictly.

Avoid any.

2. PROJECT STRUCTURE

Use:

src/

├── api/
├── components/
├── layouts/
├── pages/
├── features/
│ ├── auth/
│ ├── dashboard/
│ ├── accounts/
│ ├── statements/
│ ├── transactions/
│ ├── categories/
│ └── categorization/
├── hooks/
├── types/
├── utils/
├── constants/
├── routes/
└── styles/

Organize code by feature where appropriate.

Do not put the entire application in App.tsx.

3. APPLICATION LAYOUT

Create a responsive dashboard layout.

Desktop:

┌─────────────────────────────────────────────────────────────┐
│ Logo Search User Profile │
├──────────────┬──────────────────────────────────────────────┤
│ │ │
│ Dashboard │ │
│ Transactions │ Main Content │
│ Statements │ │
│ Accounts │ │
│ Categories │ │
│ AI Review │ │
│ │ │
│ Settings │ │
└──────────────┴──────────────────────────────────────────────┘

Mobile should use a collapsible navigation menu.

Navigation:

Dashboard
Transactions
Statements
Accounts
Categories
AI Review
Settings

4. AUTHENTICATION

Create:

/login

/register

Implement JWT authentication.

Store access token securely according to the application's authentication strategy.

Axios must automatically attach:

Authorization: Bearer

Implement:

login

logout

protected routes

token expiration handling

redirect unauthenticated users to /login

Do not expose JWT tokens in UI.

5. DASHBOARD

Create:

/dashboard

This is the main application screen.

At the top:

Month selector:

[ August 2026 ▼ ]

Account selector:

[ All Accounts ▼ ]

Buttons:

[ Upload Statement ]

[ + Add Expense ]

[ + Add Income ]

6. DASHBOARD SUMMARY CARDS

Display:

Total Credited

Total Expenses

Remaining

Spent Percentage

Example:

₹1,00,000
Credited

₹60,000
Expenses

₹40,000
Remaining

60%
Spent

Use visually distinct but professional cards.

7. EXPENSE PIE/DONUT CHART

Use Recharts.

Create a donut chart for category expenses.

Example:

Food ₹8,000
Shopping ₹12,000
Rent ₹20,000
Travel ₹7,000
Utilities ₹5,000
Other ₹8,000

Center of donut:

₹60,000

60% of credited amount

The chart should represent category expenses.

Do not represent the categories as percentages of only the expense total without also showing their relationship to credited amount.

Provide a category legend.

Clicking a category should navigate to filtered transactions.

8. CATEGORY TABLE

Create:

Category
Amount
% of Expenses
% of Credited Amount

Example:

Food
₹8,000
13.33%
8%

Shopping
₹12,000
20%
12%

Rent
₹20,000
33.33%
20%

Make the table responsive.

9. MONTHLY TREND

Create a line/bar chart using Recharts.

Show:

Month
Credited
Expenses
Remaining

For yearly view:

January
February
March
...
December

Allow users to understand spending trends.

10. YEARLY DASHBOARD

Create:

/dashboard/yearly

Allow year selection.

Display:

Total credited
Total expenses
Remaining
Average monthly expenses

Charts:

category distribution

monthly expenses

monthly credited amount

expense vs credited comparison

11. STATEMENT UPLOAD PAGE

Create:

/statements

Show:

Upload Statement button.

Drag-and-drop PDF area.

Requirements:

PDF only

file size validation

upload progress

error state

success state

After upload show:

Statement name
Account
Upload date
Status

Statuses:

UPLOADED
PROCESSING
PROCESSED
FAILED

While processing, poll the backend using React Query.

Example:

Statement uploaded
↓
Processing...
↓
124 transactions found
↓
117 categorized
↓
7 need review

12. STATEMENT HISTORY

Display:

File
Account
Period
Uploaded
Transactions
Status
Actions

Actions:

View
Download
Delete

Use confirmation modal for deletion.

13. TRANSACTIONS PAGE

Create:

/transactions

Display:

Date
Description
Merchant
Amount
Type
Category
Source
Confidence

Use pagination.

Filters:

Date range
Account
Category
Transaction type
Source

Search by merchant/description.

14. TRANSACTION DETAILS

Clicking a transaction opens a drawer or details page.

Display:

Date
Raw description
Normalized merchant
Amount
Account
Type
Category
AI confidence
Source
Statement

If categorized by AI, show:

AI categorized this transaction with 91% confidence.

Allow:

[Change Category]

When category is changed:

Ask:

"Remember this category for future transactions?"

Checkbox:

☑ Remember for this merchant

15. MANUAL EXPENSE

Create modal:

Add Expense

Fields:

Amount
Date
Description
Category
Account
Notes

Validation:

Amount > 0
Date required
Description required
Category required
Account required

Submit to:

POST /api/v1/transactions/expenses

After successful creation:

close modal

invalidate dashboard queries

invalidate transaction queries

show success notification

16. MANUAL INCOME

Create:

Add Income

Fields:

Amount
Date
Description
Income type
Account

Income types:

SALARY
BONUS
FREELANCE
OTHER

After creation refresh dashboard.

17. AI REVIEW PAGE

Create:

/ai-review

Display transactions where AI confidence is below configured threshold.

Example:

┌──────────────────────────────────────────────────────────┐
│ AI CATEGORY REVIEW │
├──────────────────────────────────────────────────────────┤
│ Transaction Amount AI Category Confidence │
│ │
│ XYZ SERVICES ₹900 Other 57% │
│ │
│ [Change Category ▼] [Approve] │
└──────────────────────────────────────────────────────────┘

Allow:

Approve

Change category

Remember category for merchant

Bulk approve selected transactions.

Show count:

7 transactions need review

18. CATEGORY MANAGEMENT

Create:

/categories

Show category hierarchy.

Example:

Food
├── Restaurants
├── Food Delivery
└── Cafes

Shopping
├── Electronics
├── Clothing
└── Online Shopping

Allow users to:

create category

edit category

deactivate category

Do not allow deletion of categories that already contain transactions unless a replacement category is selected.

19. ACCOUNTS PAGE

Create:

/accounts

Cards/table for:

HDFC Salary Account
HDFC Credit Card
ICICI Credit Card

Show:

Account type
Institution
Last four digits
Currency
Active status

Actions:

Add
Edit
Deactivate

20. UX FOR CREDIT CARD

Clearly distinguish:

Bank Account
Credit Card

When viewing credit-card transactions, display:

Purchases
Payments
Refunds
Fees
Interest

Make sure payment transactions are not visually presented as ordinary spending.

21. RESPONSIVE DESIGN

Must work on:

Desktop
Tablet
Mobile

Desktop:

Sidebar + dashboard.

Mobile:

Top navigation + drawer.

Charts should resize automatically.

Tables should become cards or horizontal scroll where necessary.

22. UI DESIGN

Design style:

Modern
Minimal
Professional
Financial dashboard
Clean typography
Subtle shadows
Rounded cards
Good spacing
Accessible contrast

Avoid excessive animations.

Use animations only where useful.

Use loading skeletons instead of blank screens.

23. LOADING STATES

Every API-dependent component must support:

Loading
Success
Empty
Error

Example:

Dashboard loading:

Skeleton cards
Skeleton chart
Skeleton table

Empty dashboard:

"No transactions for August 2026."

CTA:

[ Upload Statement ]

24. ERROR HANDLING

Create centralized Axios error handling.

Display user-friendly messages.

Examples:

"Unable to load transactions."

"Statement upload failed."

"Your session has expired. Please log in again."

Do not expose backend stack traces.

25. API CLIENT

Create:

src/api/client.ts

Configure Axios base URL through:

VITE_API_BASE_URL

Example:

VITE_API_BASE_URL=http://localhost:8080/api/v1

Create API modules:

authApi.ts
accountApi.ts
statementApi.ts
transactionApi.ts
categoryApi.ts
dashboardApi.ts
categorizationApi.ts

Do not make raw Axios calls directly inside UI components.

26. REACT QUERY

Use React Query for server state.

Examples:

useMonthlyDashboard()
useYearlyDashboard()
useTransactions()
useStatements()
useAccounts()
useCategories()
usePendingCategorization()

Invalidate appropriate queries after mutations.

For example, after adding an expense:

invalidate:

dashboard
transactions
monthly summary

27. TYPESCRIPT TYPES

Create strong types for:

User
Account
Statement
Transaction
Category
MonthlyDashboard
YearlyDashboard
CategorySummary
AIReviewTransaction

Do not use any.

API response types must match backend DTOs.

28. CHART DATA

The backend should provide:

amount
percentageOfExpenses
percentageOfCredit

Frontend should not recalculate financial values unless needed for presentation.

Financial calculations should remain backend-owned.

29. ACCESSIBILITY

Use:

semantic HTML

keyboard navigation

accessible labels

proper button states

focus states

ARIA labels where required

accessible chart descriptions where possible

30. SECURITY

Do not:

store passwords

log tokens

display sensitive account numbers

expose backend secrets

Mask account numbers:

XXXX XXXX 1234

Do not display uploaded PDF contents unnecessarily.

31. ROUTES

Implement:

/login
/register

/dashboard
/dashboard/yearly

/transactions

/statements
/statements/:id

/accounts

/categories

/ai-review

/settings

Protected routes must require authentication.

32. COMPONENTS

Create reusable components:

DashboardCard
DonutChart
CategoryLegend
CategoryTable
MonthlyTrendChart
TransactionTable
TransactionFilters
TransactionDetails
StatementUpload
StatementStatusBadge
AccountCard
ExpenseModal
IncomeModal
CategorySelector
ConfirmationModal
LoadingSkeleton
EmptyState
ErrorState
Pagination
Toast

Do not duplicate components.

33. DASHBOARD INTERACTIONS

When the user changes month:

Update dashboard query.

When account changes:

Update dashboard query.

When category is clicked:

Navigate to:

/transactions?category=

When "Expenses" card is clicked:

Navigate to filtered debit transactions.

When "Remaining" is clicked:

Show financial summary.

34. FILE UPLOAD UX

Drag/drop area:

"Drag your PDF statement here"

or:

"Choose PDF"

After selection:

Show filename
File size
Remove button
Upload button

During processing:

Show:

Uploading
Processing PDF
Extracting transactions
Categorizing transactions
Completed

If backend only provides processing status, map the available status into an appropriate progress UI without pretending the backend provides unsupported progress percentages.

35. AI CONFIDENCE UI

Use labels:

90–100%:
High confidence

70–89%:
Medium confidence

Below 70%:
Needs review

The exact thresholds should be configurable.

Never imply that AI confidence is mathematically guaranteed accuracy.

36. EMPTY STATES

Dashboard:

"No financial data yet."

"Upload your first statement to see your spending."

Transactions:

"No transactions found."

AI Review:

"You're all caught up."

Statements:

"No statements uploaded."

Accounts:

"Add your first bank account or credit card."

37. FRONTEND TESTING

Use:

Vitest
React Testing Library

Test:

login

protected routes

dashboard rendering

transaction filters

expense creation

statement upload

category correction

AI review

loading/error states

38. ENVIRONMENT CONFIGURATION

Create:

.env.example

With:

VITE_API_BASE_URL=http://localhost:8080/api/v1

Never commit secrets.

39. README

Create a detailed README containing:

project overview

architecture

technology stack

setup instructions

environment variables

running locally

backend dependency

API configuration

testing

build instructions

40. EXPECTED OUTPUT

Generate a complete runnable React application.

Provide:

package.json

Vite configuration

TypeScript configuration

Tailwind configuration

routing

authentication

API client

React Query setup

pages

reusable components

charts

forms

validation

responsive design

error handling

loading states

tests

README

.env.example

Do not provide pseudo-code.

Generate actual implementation code.

Before generating the code, provide:

Frontend architecture

Folder structure

API integration contract

Page/component hierarchy

Then implement the project module by module.

The frontend must integrate with the Spring Boot backend described above.

All APIs use /api/v1.

Use TypeScript strictly.

Do not use any.

Do not hardcode financial data in production components. Mock data may be used only for initial development/demo states and must be clearly separated from API-driven data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/607413ed-5847-422a-90c1-64dce52ad4a2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
