import Header from '@/components/Header'
import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <AuthForm mode="login" />
      </div>
    </main>
  )
}