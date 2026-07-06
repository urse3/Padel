import React from 'react'
import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import NewsSection from '@/components/landing/NewsSection'
import Footer from '@/components/landing/Footer'

export const revalidate = 120

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 animate-fade-in">
      <Header />
      <HeroSection />

      {/* Noticias del Club */}
      <main className="max-w-6xl mx-auto px-5 w-full py-16">
        <NewsSection />
      </main>

      <Footer />
    </div>
  )
}
