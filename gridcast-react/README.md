This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Current MVP To-Do List (Real Data Integration)

Here is the structured checklist of tasks currently being implemented to remove demo charts and wire up real pipeline data:

### Core Data & Configuration
- [x] Configure `sync-real-data.mjs` script to copy metrics and residual JSONs from pipeline `/data` to public frontend `/public/data`.
- [x] Update `lib/api.ts` to fetch actual `metrics.json`, `forecast_24h.json`, and `residuals.json` generated from XGBoost/LSTM models instead of fallback mock data.
- [x] Update `lib/predictiveEngine.ts` to parse standard pipeline schemas directly into frontend metrics, safely handling empty bounds without injecting mock elements.

### Shared UI Components
- [x] Refactor `components/charts/LoadChart.tsx` to explicitly require `ForecastData` props, disabling all hardcoded `LOAD_DATA/FORECAST_DATA` logic.
- [x] Refactor `components/charts/ErrorHeatmap.tsx` to render using the real mathematical matrix structures from `residuals.json` instead of sine-wave generators.
- [x] Implement deterministic loading and empty boundary states within charts.

### Pages & View Integration
- [x] **Admin Dashboard** (`app/(protected)/admin/page.tsx`): Completely replace static variables and bind to `predictiveEngine` direct hooks based on the selected real model (`xgboost` vs `lstm`).
- [x] **Company Dashboard** (`app/(protected)/company/page.tsx`): Migrate and bind real data APIs to replace deterministic demo states.
- [x] **Landing Page Preview** (`app/(public)/landing/page.tsx`): Migrate `DemoSection` components away from fixed datasets and `GRID_NODES` definitions.
- [x] Ensure graceful page fallbacks visually if the Next.js `public/data` directory has not been populated by the synchronization script yet.

### Post-Implementation Tasks
- [x] Test real data visualization locally using the updated Next.js development server.
- [x] Verify there are zero `mockData.ts` and mock variable references left running across any imported UI components.
- [x] Handle any responsive UI bugs manifesting from mismatched real-world JSON bounding box data.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
