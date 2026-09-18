import { useState } from 'react'
import { supabase } from './supabase'
import './App.css'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Signed in successfully.')
    }

    setLoading(false)
  }

  async function handleSignUp() {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created. Check your email to confirm it.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>BudgetFlow</h1>
        <h2>Sign in to manage your budget</h2>

        <form onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            required
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign in'}
          </button>
        </form>

        <button
          className="secondary-button"
          type="button"
          onClick={handleSignUp}
          disabled={loading}
        >
          Create account
        </button>

        {message && <p className="auth-message">{message}</p>}
      </section>
    </main>
  )
}