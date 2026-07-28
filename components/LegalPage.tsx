import Header from './Header'

interface LegalPageProps {
  title: string
  children: React.ReactNode
}

export default function LegalPage({ title, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-unifraktur text-white mb-8">{title}</h1>
        <div className="prose prose-invert prose-lg max-w-none">
          {children}
        </div>
      </div>
    </main>
  )
}