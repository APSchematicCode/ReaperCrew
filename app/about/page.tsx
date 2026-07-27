import Header from '@/components/Header'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-unifraktur text-white mb-6">About Reaper Crew</h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-300 text-lg leading-relaxed">
            Founded on the principles of resilience, precision, and unwavering quality, 
            <span className="text-white font-semibold"> Reaper Crew</span> was built for those who demand more from their gear.
          </p>
          
          <p className="text-gray-300 text-lg leading-relaxed mt-4">
            What started as a passion for tactical performance has evolved into a full‑service 
            brand offering premium merchandise and high‑end media production. Every product we 
            create—from heavyweight tees to custom hoodies—is designed to withstand the elements 
            and look good doing it.
          </p>
          
          <p className="text-gray-300 text-lg leading-relaxed mt-4">
            Our media packages go beyond standard shoots. We capture the grit, the movement, and 
            the story behind the gear. Whether it's action shots on the range, lifestyle portraits, 
            or cinematic B‑roll, we deliver visuals that command attention.
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-unifraktur text-white mb-2">Built Different.</h2>
            <p className="text-gray-300">
              We're not just a brand—we're a crew. Every stitch, every frame, every detail is 
              handled with the same intensity we bring to the field. If you're looking for mass‑produced 
              mediocrity, you're in the wrong place. If you want gear and media that actually stands up, 
              you're home.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}