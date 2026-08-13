'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/account')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/account/update-password`,
    })

    if (error) {
      setResetMessage(`❌ ${error.message}`)
    } else {
      setResetMessage('✅ Password reset email sent! Check your inbox.')
      setTimeout(() => {
        setShowResetModal(false)
        setResetEmail('')
        setResetMessage('')
      }, 3000)
    }
    setResetLoading(false)
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-unifraktur text-white text-center mb-6">Sign In</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowResetModal(true)}
              className="text-sm text-gray-400 hover:text-white transition underline"
            >
              Forgot your password?
            </button>
          </div>

          <p className="text-gray-500 text-sm text-center mt-4">
            Don't have an account?{' '}
            <a href="/signup" className="text-white hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-unifraktur text-white mb-4">Reset Password</h2>
            <p className="text-gray-400 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-gray-500"
                />
              </div>
              {resetMessage && (
                <div className={`text-sm px-3 py-2 rounded ${resetMessage.startsWith('✅') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                  {resetMessage}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-gray-800 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}