import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Auth from './Auth'
import { supabase } from './supabase'
import './App.css'

type Transaction = {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  transaction_date: string
  created_at: string
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadTransactions()
    } else {
      setTransactions([])
    }
  }, [session])

  async function loadTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setTransactions((data as Transaction[]) || [])
    }
  }

  async function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!session?.user) return

    const numericAmount = Number(amount)

    if (!description.trim() || numericAmount <= 0) {
      setMessage('Enter a description and an amount greater than zero.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      description: description.trim(),
      amount: numericAmount,
      type,
      transaction_date: new Date().toISOString().slice(0, 10),
    })

    if (error) {
      setMessage(error.message)
    } else {
      setDescription('')
      setAmount('')
      setType('expense')
      await loadTransactions()
      setMessage('Transaction added.')
    }

    setLoading(false)
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id),
      )
      setMessage('Transaction deleted.')
    }
  }

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + Number(transaction.amount), 0),
    [transactions],
  )

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + Number(transaction.amount), 0),
    [transactions],
  )

  const balance = totalIncome - totalExpenses

  if (!session) {
    return <Auth />
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>BudgetFlow</h1>
            <p className="welcome-text">Manage your money with clarity.</p>
          </div>

          <button
            className="sign-out-button"
            onClick={() => supabase.auth.signOut({ scope: 'local' })}
          >
            Sign out
          </button>
        </header>

        <section className="summary-grid">
          <article className="summary-card balance-card">
            <span>Balance</span>
            <strong>£{balance.toFixed(2)}</strong>
          </article>

          <article className="summary-card income-card">
            <span>Income</span>
            <strong>£{totalIncome.toFixed(2)}</strong>
          </article>

          <article className="summary-card expense-card">
            <span>Expenses</span>
            <strong>£{totalExpenses.toFixed(2)}</strong>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <h2>Add transaction</h2>

            <form className="transaction-form" onSubmit={addTransaction}>
              <label>
                Description
                <input
                  type="text"
                  placeholder="e.g. Groceries"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>

              <label>
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <label>
                Type
                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as 'income' | 'expense')
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add transaction'}
              </button>
            </form>

            {message && <p className="dashboard-message">{message}</p>}
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Recent transactions</h2>
              <span>{transactions.length} total</span>
            </div>

            {transactions.length === 0 ? (
              <p className="empty-state">
                No transactions yet. Add your first one.
              </p>
            ) : (
              <div className="transaction-list">
                {transactions.map((transaction) => (
                  <div className="transaction-row" key={transaction.id}>
                    <div>
                      <strong>{transaction.description}</strong>
                      <small>
                        {transaction.transaction_date} · {transaction.type}
                      </small>
                    </div>

                    <div className="transaction-amount">
                      <strong
                        className={
                          transaction.type === 'income'
                            ? 'income-text'
                            : 'expense-text'
                        }
                      >
                        {transaction.type === 'income' ? '+' : '-'}£
                        {Number(transaction.amount).toFixed(2)}
                      </strong>

                      <button
                        className="delete-button"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  )
}

export default App