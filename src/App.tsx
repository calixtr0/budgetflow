import { useMemo, useState } from 'react'
import './styles.css'
import type { Bill, Budget, Category, Frequency, Transaction } from './types'

const defaultCategories: Category[] = [
  { id: 'housing', name: 'Housing', colour: '#6366f1' },
  { id: 'utilities', name: 'Utilities', colour: '#0ea5e9' },
  { id: 'insurance', name: 'Insurance', colour: '#8b5cf6' },
  { id: 'phone', name: 'Phone & broadband', colour: '#14b8a6' },
  { id: 'food', name: 'Groceries', colour: '#22c55e' },
  { id: 'transport', name: 'Transport', colour: '#f59e0b' },
  { id: 'subscriptions', name: 'Subscriptions', colour: '#ec4899' },
  { id: 'savings', name: 'Savings', colour: '#06b6d4' },
  { id: 'other', name: 'Other', colour: '#64748b' },
]

const starterBills: Bill[] = [
  { id: 'car-insurance', name: 'Car insurance', categoryId: 'insurance', amount: 85, frequency: 'monthly', dueDay: 1, active: true },
  { id: 'house-insurance', name: 'House insurance', categoryId: 'insurance', amount: 32, frequency: 'monthly', dueDay: 5, active: true },
  { id: 'electricity', name: 'Electricity', categoryId: 'utilities', amount: 120, frequency: 'monthly', dueDay: 15, active: true },
  { id: 'gas', name: 'Gas', categoryId: 'utilities', amount: 75, frequency: 'monthly', dueDay: 20, active: true },
  { id: 'phone', name: 'Phone bill', categoryId: 'phone', amount: 45, frequency: 'monthly', dueDay: 25, active: true },
]

const starterTransactions: Transaction[] = [
  { id: 'sample-1', date: new Date().toISOString().slice(0, 10), description: 'Sample grocery transaction', categoryId: 'food', amount: 64.5, type: 'expense' },
]

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function money(value: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

function monthlyBillAmount(bill: Bill) {
  if (bill.frequency === 'weekly') return bill.amount * 52 / 12
  if (bill.frequency === 'quarterly') return bill.amount / 3
  if (bill.frequency === 'annually') return bill.amount / 12
  return bill.amount
}

function App() {
const [categories] = useState<Category[]>(() => load('budgetflow-categories', defaultCategories))
  const [bills, setBills] = useState<Bill[]>(() => load('budgetflow-bills', starterBills))
  const [transactions, setTransactions] = useState<Transaction[]>(() => load('budgetflow-transactions', starterTransactions))
  const [budgets, setBudgets] = useState<Budget[]>(() => load('budgetflow-budgets', []))
  const [income, setIncome] = useState(() => load('budgetflow-income', 3000))
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'transactions' | 'budgets'>('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBillForm, setShowBillForm] = useState(false)

  const persist = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))

  const activeBills = bills.filter(bill => bill.active)
  const monthlyBills = activeBills.reduce((sum, bill) => sum + monthlyBillAmount(bill), 0)
  const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = income + incomeTotal
  const remaining = totalIncome - monthlyBills - expenseTotal

  const categorySpend = useMemo(() => categories.map(category => {
    const spent = transactions.filter(t => t.categoryId === category.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const planned = budgets.find(b => b.categoryId === category.id)?.amount ?? 0
    return { ...category, spent, planned }
  }).filter(category => category.spent || category.planned), [categories, transactions, budgets])

  function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      date: String(form.get('date')),
      description: String(form.get('description')),
      categoryId: String(form.get('categoryId')),
      amount: Number(form.get('amount')),
      type: 'expense',
    }
    const next = [transaction, ...transactions]
    setTransactions(next)
    persist('budgetflow-transactions', next)
    setShowExpenseForm(false)
    event.currentTarget.reset()
  }

  function addBill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const bill: Bill = {
      id: crypto.randomUUID(),
      name: String(form.get('name')),
      categoryId: String(form.get('categoryId')),
      amount: Number(form.get('amount')),
      frequency: String(form.get('frequency')) as Frequency,
      dueDay: Number(form.get('dueDay')),
      active: true,
    }
    const next = [...bills, bill]
    setBills(next)
    persist('budgetflow-bills', next)
    setShowBillForm(false)
    event.currentTarget.reset()
  }

  function addBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const categoryId = String(form.get('categoryId'))
    const budget: Budget = { id: crypto.randomUUID(), categoryId, month: new Date().toISOString().slice(0, 7), amount: Number(form.get('amount')) }
    const next = [...budgets.filter(item => item.categoryId !== categoryId), budget]
    setBudgets(next)
    persist('budgetflow-budgets', next)
    event.currentTarget.reset()
  }

  function exportCsv() {
    const rows = [['Date', 'Description', 'Category', 'Amount', 'Type'], ...transactions.map(t => [t.date, t.description, categories.find(c => c.id === t.categoryId)?.name ?? 'Other', String(t.amount), t.type])]
    const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'budgetflow-transactions.csv'
    link.click()
  }
function resetApp() {
  const confirmed = window.confirm(
    'Reset all Calixtro Budgeting data? This will remove your bills, transactions, budgets, and income from this browser.',
  )

  if (!confirmed) return

  localStorage.removeItem('budgetflow-categories')
  localStorage.removeItem('budgetflow-bills')
  localStorage.removeItem('budgetflow-transactions')
  localStorage.removeItem('budgetflow-budgets')
  localStorage.removeItem('budgetflow-income')

  window.location.reload()
}

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">£</span><span>Calixtro Budgeting</span></div>
      <nav>
        {([['dashboard', 'Dashboard'], ['bills', 'Bills'], ['transactions', 'Transactions'], ['budgets', 'Budgets']] as const).map(([id, label]) => <button className={activeTab === id ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab(id)} key={id}>{label}</button>)}
      </nav>
      <div className="sidebar-footer">Your data is stored locally in this browser.</div>
    </aside>

    <main className="content">
      <header className="topbar"><div className="header-actions">
  <button className="secondary" onClick={exportCsv}>Export CSV</button>
  <button
  type="button"
  className="secondary"
  onClick={resetApp}
>
  Reset data
</button>
  <button className="primary" onClick={() => setShowExpenseForm(true)}>+ Add expense</button>
<button
  type="button"
  className="secondary"
  onClick={exportCsv}
>
  Export CSV
</button>

<button
  type="button"
  className="secondary"
  onClick={resetApp}
>
  Reset data
</button>

<button
  type="button"
  className="primary"
  onClick={() => setShowExpenseForm(true)}
>
  + Add expense
</button>


</div></header>

      {activeTab === 'dashboard' && <>
        <section className="hero-grid">
          <div className="card balance-card"><div><span className="muted">Available after planned bills</span><div className="big-number">{money(remaining)}</div><span className={remaining >= 0 ? 'positive' : 'negative'}>{remaining >= 0 ? 'Within your current plan' : 'You are over your current plan'}</span></div><div className="ring"><span>{Math.max(0, Math.round((remaining / Math.max(totalIncome, 1)) * 100))}%</span></div></div>
          <div className="stat-card"><span className="muted">Monthly income</span><strong>{money(totalIncome)}</strong><button className="text-button" onClick={() => { const value = prompt('Enter your monthly income', String(income)); if (value) { const next = Number(value); setIncome(next); persist('budgetflow-income', next) } }}>Edit income</button></div>
          <div className="stat-card"><span className="muted">Planned recurring bills</span><strong>{money(monthlyBills)}</strong><span className="muted">{activeBills.length} active bills</span></div>
          <div className="stat-card"><span className="muted">Recorded spending</span><strong>{money(expenseTotal)}</strong><span className="muted">{transactions.filter(t => t.type === 'expense').length} transactions</span></div>
        </section>
        <section className="two-column"><div className="card"><div className="section-heading"><h2>Spending by category</h2><button className="text-button" onClick={() => setActiveTab('budgets')}>Manage budgets</button></div>{categorySpend.length === 0 ? <Empty text="Add a budget or expense to see your breakdown." /> : categorySpend.map(item => <div className="category-row" key={item.id}><div className="category-label"><span className="dot" style={{ background: item.colour }}></span><span>{item.name}</span></div><div className="bar-track"><span className="bar-fill" style={{ background: item.colour, width: `${Math.min(100, item.planned ? item.spent / item.planned * 100 : 100)}%` }}></span></div><span className="row-amount">{money(item.spent)}</span></div>)}</div><div className="card"><div className="section-heading"><h2>Upcoming bills</h2><button className="text-button" onClick={() => setActiveTab('bills')}>View all</button></div>{activeBills.slice().sort((a, b) => a.dueDay - b.dueDay).slice(0, 5).map(bill => <div className="bill-row" key={bill.id}><div className="date-box"><strong>{bill.dueDay}</strong><small>DAY</small></div><div><strong>{bill.name}</strong><span className="muted">{categories.find(c => c.id === bill.categoryId)?.name}</span></div><strong className="row-amount">{money(bill.amount)}</strong></div>)}</div></section>
        <section className="card"><div className="section-heading"><h2>Recent transactions</h2><button className="text-button" onClick={() => setActiveTab('transactions')}>View all</button></div><TransactionTable transactions={transactions.slice(0, 5)} categories={categories} /></section>
      </>}

      {activeTab === 'bills' && <section className="card page-card"><div className="section-heading"><div><h2>Recurring bills</h2><p className="muted">Plan for regular outgoing payments.</p></div><button className="primary" onClick={() => setShowBillForm(true)}>+ Add bill</button></div><div className="bill-list">{bills.map(bill => <div className="large-bill-row" key={bill.id}><div className="date-box"><strong>{bill.dueDay}</strong><small>DAY</small></div><div className="bill-details"><strong>{bill.name}</strong><span className="muted">{categories.find(c => c.id === bill.categoryId)?.name} · {bill.frequency}</span></div><strong>{money(bill.amount)}</strong><button className="delete-button" onClick={() => { const next = bills.filter(item => item.id !== bill.id); setBills(next); persist('budgetflow-bills', next) }}>Delete</button></div>)}</div></section>}

      {activeTab === 'transactions' && <section className="card page-card"><div className="section-heading"><div><h2>Transactions</h2><p className="muted">Record and review every outgoing payment.</p></div><button className="primary" onClick={() => setShowExpenseForm(true)}>+ Add expense</button></div><TransactionTable transactions={transactions} categories={categories} /></section>}

      {activeTab === 'budgets' && <section className="card page-card"><div className="section-heading"><div><h2>Category budgets</h2><p className="muted">Set a spending limit for each category.</p></div></div><form className="inline-form" onSubmit={addBudget}><select name="categoryId" required defaultValue=""><option value="" disabled>Select category</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select><input name="amount" type="number" min="0" step="0.01" placeholder="Monthly limit" required /><button className="primary">Save budget</button></form><div className="budget-grid">{categorySpend.map(item => <div className="budget-card" key={item.id}><span className="muted">{item.name}</span><strong>{money(item.spent)} <small>of {money(item.planned)}</small></strong><div className="bar-track"><span className="bar-fill" style={{ background: item.colour, width: `${Math.min(100, item.planned ? item.spent / item.planned * 100 : 0)}%` }}></span></div></div>)}</div></section>}
    </main>

    {showExpenseForm && <Modal title="Add expense" close={() => setShowExpenseForm(false)}><form className="form" onSubmit={addTransaction}><label>Date<input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><label>Description<input name="description" placeholder="e.g. Weekly groceries" required /></label><label>Category<select name="categoryId" defaultValue="food" required>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Amount<input name="amount" type="number" min="0" step="0.01" placeholder="0.00" required /></label><button className="primary">Save expense</button></form></Modal>}
    {showBillForm && <Modal title="Add recurring bill" close={() => setShowBillForm(false)}><form className="form" onSubmit={addBill}><label>Bill name<input name="name" placeholder="e.g. Broadband" required /></label><label>Category<select name="categoryId" defaultValue="utilities" required>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label><label>Frequency<select name="frequency" defaultValue="monthly"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Annually</option></select></label><label>Due day<input name="dueDay" type="number" min="1" max="31" defaultValue="1" required /></label><button className="primary">Save bill</button></form></Modal>}
  </div>
}

function TransactionTable({ transactions, categories }: { transactions: Transaction[]; categories: Category[] }) {
  if (!transactions.length) return <Empty text="No transactions recorded yet." />
  return <div className="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>{transactions.map(transaction => <tr key={transaction.id}><td>{new Date(transaction.date).toLocaleDateString('en-GB')}</td><td>{transaction.description}</td><td><span className="category-pill">{categories.find(c => c.id === transaction.categoryId)?.name ?? 'Other'}</span></td><td className={transaction.type === 'expense' ? 'negative' : 'positive'}>{transaction.type === 'expense' ? '-' : '+'}{money(transaction.amount)}</td></tr>)}</tbody></table></div>
}

function Empty({ text }: { text: string }) { return <div className="empty">{text}</div> }
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) { return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={event => event.stopPropagation()}><div className="section-heading"><h2>{title}</h2><button className="close-button" onClick={close}>×</button></div>{children}</div></div> }

export default App