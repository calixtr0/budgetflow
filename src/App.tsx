import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
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

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function money(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

function monthlyBillAmount(bill: Bill) {
  if (bill.frequency === 'weekly') return bill.amount * 52 / 12
  if (bill.frequency === 'quarterly') return bill.amount / 3
  if (bill.frequency === 'annually') return bill.amount / 12
  return bill.amount
}

function App() {
  const [categories] = useState<Category[]>(() => load('budgetflow-categories', defaultCategories))
  const [bills, setBills] = useState<Bill[]>(() => load('budgetflow-bills', []))
  const [transactions, setTransactions] = useState<Transaction[]>(() => load('budgetflow-transactions', []))
  const [budgets, setBudgets] = useState<Budget[]>(() => load('budgetflow-budgets', []))
  const [income, setIncome] = useState<number>(() => load('budgetflow-income', 3000))
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'transactions' | 'budgets'>('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBillForm, setShowBillForm] = useState(false)

  const activeBills = bills.filter(bill => bill.active)
  const recurringTotal = activeBills.reduce((total, bill) => total + monthlyBillAmount(bill), 0)
  const expenseTotal = transactions.filter(item => item.type === 'expense').reduce((total, item) => total + item.amount, 0)
  const incomeTotal = transactions.filter(item => item.type === 'income').reduce((total, item) => total + item.amount, 0)
  const totalIncome = income + incomeTotal
  const remaining = totalIncome - recurringTotal - expenseTotal

  const categorySpend = useMemo(() => categories.map(category => {
    const spent = transactions
      .filter(item => item.type === 'expense' && item.categoryId === category.id)
      .reduce((total, item) => total + item.amount, 0)
    const planned = budgets.find(item => item.categoryId === category.id)?.amount ?? 0
    return { ...category, spent, planned }
  }).filter(item => item.spent > 0 || item.planned > 0), [categories, transactions, budgets])

  function addExpense(event: FormEvent<HTMLFormElement>) {
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
    save('budgetflow-transactions', next)
    setShowExpenseForm(false)
    event.currentTarget.reset()
  }

  function addBill(event: FormEvent<HTMLFormElement>) {
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
    save('budgetflow-bills', next)
    setShowBillForm(false)
    event.currentTarget.reset()
  }

  function addBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const categoryId = String(form.get('categoryId'))
    const budget: Budget = {
      id: crypto.randomUUID(),
      categoryId,
      month: new Date().toISOString().slice(0, 7),
      amount: Number(form.get('amount')),
    }
    const next = [...budgets.filter(item => item.categoryId !== categoryId), budget]
    setBudgets(next)
    save('budgetflow-budgets', next)
    event.currentTarget.reset()
  }

  function deleteBill(id: string) {
    const next = bills.filter(bill => bill.id !== id)
    setBills(next)
    save('budgetflow-bills', next)
  }

  function deleteTransaction(id: string) {
    const next = transactions.filter(item => item.id !== id)
    setTransactions(next)
    save('budgetflow-transactions', next)
  }

  function editIncome() {
    const value = window.prompt('Enter your monthly income', String(income))
    if (value === null || value.trim() === '') return
    const next = Number(value)
    if (!Number.isFinite(next) || next < 0) return
    setIncome(next)
    save('budgetflow-income', next)
  }

  function resetApp() {
    const confirmed = window.confirm(
      'Reset all Calixtro Budgeting data? This removes bills, transactions, budgets, and income saved in this browser.',
    )
    if (!confirmed) return

    ;[
      'budgetflow-categories',
      'budgetflow-bills',
      'budgetflow-transactions',
      'budgetflow-budgets',
      'budgetflow-income',
    ].forEach(key => localStorage.removeItem(key))

    window.location.reload()
  }

  function exportCsv() {
    const rows = [
      ['Date', 'Description', 'Category', 'Amount', 'Type'],
      ...transactions.map(item => [
        item.date,
        item.description,
        categories.find(category => category.id === item.categoryId)?.name ?? 'Other',
        String(item.amount),
        item.type,
      ]),
    ]
    const csv = rows
      .map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'calixtro-budgeting-transactions.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">£</span>
          <span>Calixtro Budgeting</span>
        </div>
        <nav>
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</NavButton>
          <NavButton active={activeTab === 'bills'} onClick={() => setActiveTab('bills')}>Bills</NavButton>
          <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>Transactions</NavButton>
          <NavButton active={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')}>Budgets</NavButton>
        </nav>
        <div className="sidebar-footer">Your data is stored locally in this browser.</div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>{activeTab === 'dashboard' ? 'Good to see you' : activeTab[0].toUpperCase() + activeTab.slice(1)}</h1>
          </div>
          <div className="header-actions">
            <button type="button" className="secondary" onClick={exportCsv}>Export CSV</button>
            <button type="button" className="secondary" onClick={resetApp}>Reset data</button>
            <button type="button" className="primary" onClick={() => setShowExpenseForm(true)}>+ Add expense</button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <section className="hero-grid">
              <div className="card balance-card">
                <div>
                  <span className="muted">Available after planned bills</span>
                  <div className="big-number">{money(remaining)}</div>
                  <span className={remaining >= 0 ? 'positive' : 'negative'}>
                    {remaining >= 0 ? 'Within your current plan' : 'Over your current plan'}
                  </span>
                </div>
                <div className="ring"><span>{Math.max(0, Math.round((remaining / Math.max(totalIncome, 1)) * 100))}%</span></div>
              </div>
              <div className="stat-card">
                <span className="muted">Monthly income</span>
                <strong>{money(totalIncome)}</strong>
                <button type="button" className="text-button" onClick={editIncome}>Edit income</button>
              </div>
              <div className="stat-card">
                <span className="muted">Planned recurring bills</span>
                <strong>{money(recurringTotal)}</strong>
                <span className="muted">{activeBills.length} active bills</span>
              </div>
              <div className="stat-card">
                <span className="muted">Recorded spending</span>
                <strong>{money(expenseTotal)}</strong>
                <span className="muted">{transactions.filter(item => item.type === 'expense').length} transactions</span>
              </div>
            </section>

            <section className="two-column">
              <div className="card">
                <SectionHeading title="Spending by category" action={<button type="button" className="text-button" onClick={() => setActiveTab('budgets')}>Manage budgets</button>} />
                {categorySpend.length === 0 ? <Empty text="Add a budget or expense to see your breakdown." /> : categorySpend.map(item => (
                  <div className="category-row" key={item.id}>
                    <div className="category-label"><span className="dot" style={{ background: item.colour }} />{item.name}</div>
                    <div className="bar-track"><span className="bar-fill" style={{ background: item.colour, width: `${Math.min(100, item.planned ? item.spent / item.planned * 100 : 100)}%` }} /></div>
                    <span className="row-amount">{money(item.spent)}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <SectionHeading title="Upcoming bills" action={<button type="button" className="text-button" onClick={() => setActiveTab('bills')}>View all</button>} />
                {activeBills.length === 0 ? <Empty text="No recurring bills added yet." /> : activeBills.slice().sort((a, b) => a.dueDay - b.dueDay).slice(0, 5).map(bill => (
                  <div className="bill-row" key={bill.id}>
                    <div className="date-box"><strong>{bill.dueDay}</strong><small>DAY</small></div>
                    <div><strong>{bill.name}</strong><span className="muted">{categories.find(category => category.id === bill.categoryId)?.name}</span></div>
                    <strong className="row-amount">{money(bill.amount)}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <SectionHeading title="Recent transactions" action={<button type="button" className="text-button" onClick={() => setActiveTab('transactions')}>View all</button>} />
              <TransactionTable transactions={transactions.slice(0, 5)} categories={categories} onDelete={deleteTransaction} />
            </section>
          </>
        )}

        {activeTab === 'bills' && (
          <section className="card page-card">
            <SectionHeading title="Recurring bills" subtitle="Plan for regular outgoing payments." action={<button type="button" className="primary" onClick={() => setShowBillForm(true)}>+ Add bill</button>} />
            {bills.length === 0 ? <Empty text="No recurring bills added yet." /> : bills.map(bill => (
              <div className="large-bill-row" key={bill.id}>
                <div className="date-box"><strong>{bill.dueDay}</strong><small>DAY</small></div>
                <div className="bill-details"><strong>{bill.name}</strong><span className="muted">{categories.find(category => category.id === bill.categoryId)?.name} · {bill.frequency}</span></div>
                <strong>{money(bill.amount)}</strong>
                <button type="button" className="delete-button" onClick={() => deleteBill(bill.id)}>Delete</button>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'transactions' && (
          <section className="card page-card">
            <SectionHeading title="Transactions" subtitle="Record and review every outgoing payment." action={<button type="button" className="primary" onClick={() => setShowExpenseForm(true)}>+ Add expense</button>} />
            <TransactionTable transactions={transactions} categories={categories} onDelete={deleteTransaction} />
          </section>
        )}

        {activeTab === 'budgets' && (
          <section className="card page-card">
            <SectionHeading title="Category budgets" subtitle="Set a spending limit for each category." />
            <form className="inline-form" onSubmit={addBudget}>
              <select name="categoryId" defaultValue="" required><option value="" disabled>Select category</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
              <input name="amount" type="number" min="0" step="0.01" placeholder="Monthly limit" required />
              <button type="submit" className="primary">Save budget</button>
            </form>
            <div className="budget-grid">
              {categorySpend.map(item => (
                <div className="budget-card" key={item.id}>
                  <span className="muted">{item.name}</span>
                  <strong>{money(item.spent)} <small>of {money(item.planned)}</small></strong>
                  <div className="bar-track"><span className="bar-fill" style={{ background: item.colour, width: `${Math.min(100, item.planned ? item.spent / item.planned * 100 : 0)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {showExpenseForm && (
        <Modal title="Add expense" close={() => setShowExpenseForm(false)}>
          <form className="form" onSubmit={addExpense}>
            <label>Date<input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
            <label>Description<input name="description" placeholder="e.g. Weekly groceries" required /></label>
            <label>Category<select name="categoryId" defaultValue="food" required>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
            <label>Amount<input name="amount" type="number" min="0" step="0.01" placeholder="0.00" required /></label>
            <button type="submit" className="primary">Save expense</button>
          </form>
        </Modal>
      )}

      {showBillForm && (
        <Modal title="Add recurring bill" close={() => setShowBillForm(false)}>
          <form className="form" onSubmit={addBill}>
            <label>Bill name<input name="name" placeholder="e.g. Broadband" required /></label>
            <label>Category<select name="categoryId" defaultValue="utilities" required>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
            <label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label>
            <label>Frequency<select name="frequency" defaultValue="monthly"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Annually</option></select></label>
            <label>Due day<input name="dueDay" type="number" min="1" max="31" defaultValue="1" required /></label>
            <button type="submit" className="primary">Save bill</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

type NavButtonProps = { active: boolean; onClick: () => void; children: ReactNode }
function NavButton({ active, onClick, children }: NavButtonProps) {
  return <button type="button" className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}>{children}</button>
}

type SectionHeadingProps = { title: string; subtitle?: string; action?: ReactNode }
function SectionHeading({ title, subtitle, action }: SectionHeadingProps) {
  return <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div>{action}</div>
}

type TransactionTableProps = { transactions: Transaction[]; categories: Category[]; onDelete: (id: string) => void }
function TransactionTable({ transactions, categories, onDelete }: TransactionTableProps) {
  if (!transactions.length) return <Empty text="No transactions recorded yet." />
  return <div className="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th /></tr></thead><tbody>{transactions.map(transaction => <tr key={transaction.id}><td>{new Date(transaction.date).toLocaleDateString('en-GB')}</td><td>{transaction.description}</td><td><span className="category-pill">{categories.find(category => category.id === transaction.categoryId)?.name ?? 'Other'}</span></td><td className={transaction.type === 'expense' ? 'negative' : 'positive'}>{transaction.type === 'expense' ? '-' : '+'}{money(transaction.amount)}</td><td><button type="button" className="delete-button" onClick={() => onDelete(transaction.id)}>Delete</button></td></tr>)}</tbody></table></div>
}

function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>
}

type ModalProps = { title: string; close: () => void; children: ReactNode }
function Modal({ title, close, children }: ModalProps) {
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={event => event.stopPropagation()}><SectionHeading title={title} action={<button type="button" className="close-button" onClick={close}>×</button>} />{children}</div></div>
}

export default App
