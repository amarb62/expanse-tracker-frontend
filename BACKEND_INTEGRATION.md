# Backend Integration Guide — Ledgerly (Personal Finance & Expense Analytics)

Hand this file to Claude (or any agent) to wire the existing React/TypeScript frontend to the real backend.
The frontend is **already fully built** and currently runs on an in-memory mock dataset. Integration = pointing it at the real API and making the real endpoints match the contract below (or adapting the thin API layer if they differ).

---

## 1. How the frontend talks to the backend

- Stack: React 19 + TypeScript (strict, no `any`), TanStack Start/Router, TanStack Query, Axios, Recharts, Tailwind + shadcn/ui.
- All HTTP lives in `src/api/*`. **No component or hook calls axios directly.**
- `src/api/client.ts` creates the axios instance, attaches the JWT, and normalizes errors.
- `src/hooks/queries.ts` wraps every API module in TanStack Query hooks (query keys + cache invalidation already defined).

### Mock toggle (the only switch to flip)

```ts
// src/api/client.ts
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "";
export const USE_MOCK_API = API_BASE_URL.length === 0;
export const apiClient = axios.create({ baseURL: API_BASE_URL || "/api/v1", ... });
```

Set in `.env`:

```
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Once set, `USE_MOCK_API` is `false` and every module takes the real-HTTP branch. **Do not delete the mock branches until the real API is verified end to end**; they are the fastest fallback for UI work.

### Auth

- JWT stored in `localStorage` under key `pf.access-token` (`getToken/setToken/clearToken`).
- Request interceptor sends `Authorization: Bearer <token>`.
- Response interceptor: on `401` it clears the token and redirects to `/login`. Other statuses map to friendly copy via `friendlyMessage()`; the backend can override by returning `{ "message": "..." }` in the error body.
- `ApiError { message, status }` is what every hook receives; `errorMessage(err, fallback)` renders it.

---

## 2. API contract expected by the frontend

Base path: `${VITE_API_BASE_URL}` (default `/api/v1`). All responses JSON. All authenticated routes require the bearer token.

### Auth — `src/api/authApi.ts`
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `AuthResponse` |
| POST | `/auth/register` | `{ name, email, password }` | `AuthResponse` |
| GET | `/auth/me` | — | `User` |

### Accounts — `src/api/accountApi.ts`
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/accounts` | — | `Account[]` |
| POST | `/accounts` | `AccountInput` (`Account` without `id`) | `Account` |
| PATCH | `/accounts/{id}` | `Partial<AccountInput>` | `Account` |
| POST | `/accounts/{id}/deactivate` | — | `204` |

### Categories — `src/api/categoryApi.ts`
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/categories` | — | `Category[]` (flat list, hierarchy via `parentId`; must include `transactionCount`) |
| POST | `/categories` | `{ name, parentId, color }` | `Category` |
| PATCH | `/categories/{id}` | `Partial<CategoryInput>` | `Category` |
| POST | `/categories/{id}/deactivate` | `{ replacementCategoryId?: string }` | `204` |

Rule already enforced in the UI: deactivating a category that has transactions requires `replacementCategoryId`; the backend must reassign those transactions.

### Transactions — `src/api/transactionApi.ts`
| Method | Path | Params / Body | Response |
|---|---|---|---|
| GET | `/transactions` | query: `page,size,from,to,accountId,categoryId,type,source,search` | `Page<Transaction>` |
| GET | `/transactions/{id}` | — | `Transaction` |
| POST | `/transactions/expenses` | `ExpenseInput` | `Transaction` |
| POST | `/transactions/income` | `IncomeInput` | `Transaction` |
| PATCH | `/transactions/{id}/category` | `{ categoryId, rememberForMerchant }` | `Transaction` |

`page` is **0-based**. `rememberForMerchant: true` should create/update a merchant rule so future transactions from that merchant auto-categorize.

### Statements — `src/api/statementApi.ts`
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/statements` | — | `Statement[]` |
| GET | `/statements/{id}` | — | `Statement` |
| POST | `/statements` | `multipart/form-data`: `file` (PDF, ≤10MB), `accountId` | `Statement` (status `UPLOADED`/`PROCESSING`) |
| DELETE | `/statements/{id}` | — | `204` |
| GET | `/statements/{id}/download` | — | PDF stream |

The UI **polls** `GET /statements` and `GET /statements/{id}` every 4s while any statement is `UPLOADED`/`PROCESSING` (see `useStatements`/`useStatement` `refetchInterval`). Backend just needs to advance `status` and fill `transactionCount`, `categorizedCount`, `needsReviewCount`, and `errorMessage` on `FAILED`.

### Dashboard — `src/api/dashboardApi.ts`
| Method | Path | Params | Response |
|---|---|---|---|
| GET | `/dashboard/monthly` | `month` (`YYYY-MM`), `accountId?` | `MonthlyDashboard` |
| GET | `/dashboard/yearly` | `year` (number), `accountId?` | `YearlyDashboard` |

`MonthlyDashboard.trend` should be the trailing 6 months; `YearlyDashboard.months` all 12 months of the year.

### AI categorization review — `src/api/categorizationApi.ts`
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/categorization/pending` | — | `AIReviewTransaction[]` (confidence below the medium threshold) |
| POST | `/categorization/approve` | `{ transactionIds: string[] }` | `204` |

Confidence thresholds used by the UI (`src/constants/index.ts`): high `≥ 0.90`, medium `≥ 0.70`, below `0.70` → review queue. `confidence` is a `0..1` float or `null` for manual entries.

---

## 3. Type contract (authoritative: `src/types/index.ts`)

```ts
type UUID = string;

interface User { id: UUID; name: string; email: string; currency: string }
interface AuthResponse { token: string; user: User }

type AccountType = "BANK_ACCOUNT" | "CREDIT_CARD";
interface Account { id: UUID; name: string; type: AccountType; institution: string;
  lastFour: string; currency: string; active: boolean }

type StatementStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
interface Statement { id: UUID; fileName: string; accountId: UUID; accountName: string;
  periodStart: string; periodEnd: string; uploadedAt: string; status: StatementStatus;
  transactionCount: number; categorizedCount: number; needsReviewCount: number;
  errorMessage?: string }

type TransactionType = "PURCHASE" | "PAYMENT" | "REFUND" | "FEE" | "INTEREST" | "INCOME";
type TransactionSource = "STATEMENT" | "MANUAL" | "RECURRING";
interface Transaction { id: UUID; date: string; description: string; merchant: string;
  amount: number; type: TransactionType; categoryId: UUID | null; categoryName: string | null;
  accountId: UUID; accountName: string; source: TransactionSource; confidence: number | null;
  statementId: UUID | null; statementName: string | null; notes?: string }

interface Page<T> { content: T[]; page: number; size: number;
  totalElements: number; totalPages: number }

interface Category { id: UUID; name: string; parentId: UUID | null; color: string;
  active: boolean; transactionCount: number }

interface CategorySummary { categoryId: UUID; categoryName: string; color: string;
  amount: number; percentageOfExpenses: number; percentageOfCredit: number }
interface MonthlyPoint { month: string; credited: number; expenses: number; remaining: number }
interface MonthlyDashboard { month: string; totalCredited: number; totalExpenses: number;
  remaining: number; spentPercentage: number; categories: CategorySummary[]; trend: MonthlyPoint[] }
interface YearlyDashboard { year: number; totalCredited: number; totalExpenses: number;
  remaining: number; averageMonthlyExpenses: number; categories: CategorySummary[];
  months: MonthlyPoint[] }

interface AIReviewTransaction extends Transaction {
  suggestedCategoryId: UUID | null; suggestedCategoryName: string | null }

interface ExpenseInput { amount: number; date: string; description: string;
  categoryId: string; accountId: string; notes?: string }
type IncomeType = "SALARY" | "BONUS" | "FREELANCE" | "OTHER";
interface IncomeInput { amount: number; date: string; description: string;
  incomeType: IncomeType; accountId: string }
```

Conventions:
- Dates: `date`/`uploadedAt` are ISO-8601 timestamps; `periodStart`/`periodEnd` and form inputs are `YYYY-MM-DD`; `month` is `YYYY-MM`.
- `amount` is a positive number; direction is derived from `type` (`INCOME`/`REFUND` credit, everything else debit).
- `color` is a CSS hex string (`#RRGGBB`).
- Enums are UPPER_SNAKE strings — if the backend uses lowercase or numeric enums, map them in the API module, not in components.

---

## 4. Integration checklist for Claude

1. Add `VITE_API_BASE_URL` to `.env` (and `.env.example`); confirm `USE_MOCK_API === false` at runtime.
2. Go module by module in `src/api/` (`authApi`, `accountApi`, `categoryApi`, `transactionApi`, `statementApi`, `dashboardApi`, `categorizationApi`). For each endpoint, compare the real backend's path/verb/shape with the table above:
   - Same shape → nothing to do.
   - Different path/verb → change only the `apiClient.*` call.
   - Different payload shape → add a small `toX()/fromX()` mapper inside that API module so the exported function still returns the types in `src/types/index.ts`.
3. Do **not** change component or hook signatures. `src/hooks/queries.ts` query keys and invalidations already cover cross-entity refreshes (a new expense invalidates dashboard + transactions + categorization).
4. Auth: verify the token field name in the login/register response is `token`; if the backend returns `accessToken`, map it in `authApi`. Confirm `/auth/me` works with the bearer header, and that `401` handling doesn't fight a refresh-token flow — if refresh tokens exist, add a single retry in the response interceptor in `src/api/client.ts`.
5. Uploads: confirm the multipart field names (`file`, `accountId`) and the 10MB limit (`MAX_STATEMENT_SIZE_BYTES` in `src/constants/index.ts`). Progress uses axios `onUploadProgress`.
6. Pagination: confirm 0-based `page` and the `Page<T>` envelope; map if the backend uses Spring `Pageable` naming (`number`, `totalPages`, `totalElements`, `content`) — Spring's `number` → `page`.
7. CORS: backend must allow the frontend origin, `Authorization` header, and `GET,POST,PATCH,DELETE`.
8. Remove or keep mocks: once verified, mock branches can stay (harmless — dead when the base URL is set) or be stripped module by module. Keep `src/api/mock/data.ts` if you want an offline demo mode.
9. Verify with `bunx tsgo --noEmit` (strict, no `any`) and by exercising: login → dashboard → upload statement → poll to `PROCESSED` → transactions filter → AI review approve → category/account CRUD.

## 5. Files that matter

```
src/api/client.ts              axios instance, JWT, error normalization, mock toggle
src/api/*.ts                   one module per domain — the ONLY place to touch
src/api/mock/data.ts           demo dataset (delete-able)
src/hooks/queries.ts           TanStack Query hooks, query keys, invalidations, polling
src/types/index.ts             the contract
src/constants/index.ts         confidence thresholds, upload limit, nav
src/features/*                 UI by feature — should need no changes
src/routes/*                   file-based routes (_shell.* = authed layout)
```

**Golden rule: all backend adaptation happens inside `src/api/`. If a change requires editing a component, the API module is doing too little.**
