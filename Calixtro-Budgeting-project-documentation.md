# Calixtro Budgeting

## Complete project documentation

Calixtro Budgeting is a personal finance web application created to track monthly income, recurring bills, expenses, budgets, and remaining available money.

Live application:

https://calixtro.github.io/budgetflow/

Source repository:

https://github.com/calixtro/budgetflow

## 1. Project objective

The original objective was to create an app that tracks every outgoing payment against a budget. The planned examples included car insurance, house insurance, phone bills, electricity, gas, subscriptions, groceries, transport, and other personal expenses.

The application was designed as a phone-friendly web app that could be managed from a laptop or mobile browser.

## 2. Application features

The application currently includes:

- Monthly income tracking.
- Planned recurring bills.
- Weekly, monthly, quarterly, and annual bill frequencies.
- One-off expense recording.
- Expense categories.
- Monthly category budgets.
- Dashboard totals.
- Remaining balance calculation.
- Spending by category.
- Upcoming bills.
- Recent transactions.
- CSV transaction export.
- Reset data control.
- Responsive layout for mobile and desktop browsers.
- Browser local storage.

## 3. Default categories

The initial categories are:

- Housing.
- Utilities.
- Insurance.
- Phone and broadband.
- Groceries.
- Transport.
- Subscriptions.
- Savings.
- Other.

Categories are represented in the application with an ID, display name, and colour.

## 4. Example recurring bills

The original starter data included these example bills:

| Bill | Category | Amount | Frequency | Due day |
|---|---|---:|---|---:|
| Car insurance | Insurance | £85 | Monthly | 1 |
| House insurance | Insurance | £32 | Monthly | 5 |
| Electricity | Utilities | £120 | Monthly | 15 |
| Gas | Utilities | £75 | Monthly | 20 |
| Phone bill | Phone and broadband | £45 | Monthly | 25 |

These were demonstration records and can be removed or replaced with real personal bills.

## 5. Dashboard calculations

The dashboard calculates monthly recurring bills according to their frequency.

- Weekly amount: amount multiplied by 52 and divided by 12.
- Monthly amount: amount unchanged.
- Quarterly amount: amount divided by 3.
- Annual amount: amount divided by 12.

The primary remaining-money calculation is:

```text
Remaining money = monthly income + recorded income - monthly recurring bills - recorded expenses
```

The application also displays planned budgets and recorded spending by category.

## 6. Technology used

The project uses:

- React for the user interface.
- TypeScript for typed application code.
- Vite for development and production builds.
- CSS for the responsive visual design.
- Browser localStorage for local data persistence.
- Git for source control.
- GitHub for source-code hosting.
- GitHub Actions for automated builds and deployment.
- GitHub Pages for public hosting.

## 7. Project creation

The project was created on macOS with Vite using the React TypeScript template.

The initial command was:

```bash
npm create vite@latest budgetflow -- --template react-ts
```

The project was then installed with:

```bash
cd budgetflow
npm install
```

The local development server was started with:

```bash
npm run dev
```

The local site was available at:

```text
http://localhost:5173/
```

## 8. Source files

The main source files are:

```text
src/
├── App.tsx
├── main.tsx
├── styles.css
└── types.ts
```

### `src/App.tsx`

Contains the main React application, including:

- Dashboard rendering.
- Navigation state.
- Income state.
- Bill state.
- Transaction state.
- Budget state.
- Local-storage loading and saving.
- Add-expense form.
- Add-bill form.
- Add-budget form.
- CSV export.
- Reset-data functionality.

### `src/types.ts`

Contains TypeScript types for:

- Frequency.
- Category.
- Bill.
- Transaction.
- Budget.

### `src/main.tsx`

Loads React, renders the application into the `root` element, and imports the stylesheet.

### `src/styles.css`

Contains the complete visual design, including:

- Sidebar.
- Dashboard cards.
- Buttons.
- Tables.
- Forms.
- Bill rows.
- Budget cards.
- Modal dialog.
- Mobile responsive rules.

### `index.html`

Contains the HTML entry point and browser title:

```html
<title>Calixtro Budgeting</title>
```

### `vite.config.ts`

Contains the GitHub Pages repository base path:

```ts
base: '/budgetflow/'
```

This is required because the project is hosted at `/budgetflow/` rather than at the root domain.

## 9. Branding changes

The original application name was BudgetFlow.

It was changed to Calixtro Budgeting in two places:

### Visible application branding

In `src/App.tsx`:

```tsx
<div className="brand">
  <span className="brand-mark">£</span>
  <span>Calixtro Budgeting</span>
</div>
```

### Browser tab title

In `index.html`:

```html
<title>Calixtro Budgeting</title>
```

## 10. Local data storage

The current application does not use a server or database. It stores data in browser localStorage.

The storage keys are:

```text
budgetflow-categories
budgetflow-bills
budgetflow-transactions
budgetflow-budgets
budgetflow-income
```

This means:

- Data survives a page refresh in the same browser.
- Data is separate between different browsers.
- Data is separate between a laptop and a phone.
- Clearing browser site data can remove saved information.
- GitHub does not store the personal budget records.

The app does not connect to bank accounts and does not require bank credentials.

## 11. Reset functionality

The reset control removes the locally stored data keys and reloads the application.

The reset operation removes:

- Categories.
- Bills.
- Transactions.
- Budgets.
- Income.

The reset button should use an explicit button type:

```tsx
<button type="button" className="secondary" onClick={resetApp}>
  Reset data
</button>
```

The reset function is:

```tsx
function resetApp() {
  const confirmed = window.confirm(
    'Reset all Calixtro Budgeting data? This will remove your bills, transactions, budgets, and income from this browser.',
  )

  if (!confirmed) return

  const storageKeys = [
    'budgetflow-categories',
    'budgetflow-bills',
    'budgetflow-transactions',
    'budgetflow-budgets',
    'budgetflow-income',
  ]

  storageKeys.forEach(key => localStorage.removeItem(key))
  window.location.reload()
}
```

A direct emergency reset can also be performed from the browser console:

```js
localStorage.clear()
location.reload()
```

## 12. Source control setup

Git was initialised locally with:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Calixtro Budgeting app"
```

The GitHub remote was connected and the project was pushed with:

```bash
git remote add origin https://github.com/calixtro/budgetflow.git
git push -u origin main
```

GitHub authentication was completed using GitHub CLI browser authentication because GitHub no longer accepts a normal account password for HTTPS Git operations.

Future changes are published with:

```bash
cd ~/budgetflow
git add .
git commit -m "Describe the change"
git push origin main
```

## 13. GitHub repository

The source repository is:

https://github.com/calixtro/budgetflow

The repository was made public because GitHub Pages is available for public repositories on the free GitHub plan.

Before making a repository public, check that it contains no:

- Passwords.
- API keys.
- Personal access tokens.
- Bank details.
- Private documents.
- Confidential environment files.

## 14. GitHub Pages deployment

The application is deployed as a GitHub Pages project site.

Live URL:

https://calixtro.github.io/budgetflow/

Project sites use this URL structure:

```text
https://USERNAME.github.io/REPOSITORY/
```

The repository is named `budgetflow`, so the `/budgetflow/` path is required.

## 15. GitHub Actions workflow

The deployment workflow is located at:

```text
.github/workflows/deploy.yml
```

The workflow:

1. Runs when code is pushed to the `main` branch.
2. Can also be started manually with `workflow_dispatch`.
3. Checks out the repository.
4. Installs Node.js.
5. Installs npm dependencies.
6. Runs `npm run build`.
7. Uploads the `dist` directory as a Pages artifact.
8. Deploys the artifact to GitHub Pages.

The workflow uses these important permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

The deployment process was tested after an initial failure caused by GitHub Pages being unavailable while the repository was private. After the repository was made public and Pages was enabled, the build and deploy jobs completed successfully.

## 16. Deployment troubleshooting completed

### GitHub authentication failure

The initial push failed because normal GitHub password authentication is not supported for Git operations over HTTPS.

The issue was resolved by authenticating with GitHub CLI:

```bash
gh auth login
```

### Missing workflow file

The first attempt to add the workflow failed because `.github/workflows/deploy.yml` did not exist.

The folders and file were then created:

```bash
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

### GitHub Pages unavailable

GitHub Pages initially displayed a message requiring the repository to be public or the account to be upgraded.

The repository was made public, Pages was enabled, and the workflow was run again.

### Deployment job failed with status 404

The build job succeeded, but the deployment job initially failed with a 404 because Pages was not enabled for the repository.

After Pages was enabled with GitHub Actions as the source, a later deployment succeeded.

### Blank white page

A blank page was identified as a likely Vite asset-path issue for a repository project site.

The Vite configuration was set to:

```ts
base: '/budgetflow/'
```

This ensures that generated JavaScript and CSS asset paths include the repository path.

## 17. React Router and refresh behaviour

The current application uses React state for dashboard tabs rather than URL-based React Router routes.

If React Router is added in the future, GitHub Pages can return a 404 when a user refreshes a nested route because GitHub Pages looks for a physical file rather than forwarding the request to `index.html`.

The simplest GitHub Pages solution is to use `HashRouter`:

```tsx
import { HashRouter } from 'react-router-dom'

<HashRouter>
  <App />
</HashRouter>
```

Routes would then appear in URLs such as:

```text
https://calixtro.github.io/budgetflow/#/bills
```

## 18. README documentation

A root-level `README.md` file was added to explain:

- The application purpose.
- Features.
- Technology stack.
- Local development commands.
- Production build commands.
- GitHub Pages deployment.
- Local-storage privacy behaviour.
- Project structure.
- Future improvements.

GitHub automatically renders a root-level README on the repository homepage.

## 19. Useful commands

Start development server:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Preview production files:

```bash
npm run preview
```

Check Git status:

```bash
git status
```

Check remote repository:

```bash
git remote -v
```

Push updates:

```bash
git add .
git commit -m "Describe the update"
git push
```

## 20. Recommended future improvements

The current application is a functional first version. Recommended future work includes:

- Add edit and delete controls for individual transactions.
- Add edit and delete controls for bills.
- Add a proper category-management screen.
- Add monthly date filtering.
- Add annual spending reports.
- Add savings goals.
- Add CSV import.
- Add database-backed cloud synchronisation.
- Add secure authentication.
- Add household sharing.
- Add reminders for upcoming bills.
- Add automated testing.
- Add accessibility improvements.
- Add custom domain support.

## 21. Current limitations

- Data is not synchronised between devices.
- There is no bank-feed connection.
- There is no account login.
- Data depends on browser local storage.
- Resetting local storage cannot be undone unless a CSV backup exists.
- The repository must remain public for GitHub Pages under the free GitHub plan.
- GitHub Pages is suitable for static hosting but not for a private database-backed application.
