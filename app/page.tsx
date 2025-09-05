'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Sparkles } from 'lucide-react'
import MediumFeed from '@/components/MediumFeed'
import TwitterEmbed from '@/components/TwitterEmbed'
import Logo from '@/components/Logo'
import Link from 'next/link'

interface MediumArticle {
  title: string
  description: string
  link: string
  thumbnail?: string
  pubDate: string
}

export default function Home() {
  const [mediumArticle, setMediumArticle] = useState<MediumArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show loading screen for 4 seconds
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchMediumFeed = async () => {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@doppai')
        const data = await response.json()
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          const latestArticle = data.items[0]
          
          // Extract image from content if available
          let imageUrl = ''
          if (latestArticle.thumbnail) {
            imageUrl = latestArticle.thumbnail
          } else if (latestArticle.content) {
            const imgMatch = latestArticle.content.match(/<img[^>]+src="([^"]+)"/)
            if (imgMatch) {
              imageUrl = imgMatch[1]
            }
          }
          
          // Extract first few sentences from content
          let excerpt = ''
          if (latestArticle.content) {
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = latestArticle.content
            let plainText = tempDiv.textContent || tempDiv.innerText || ''
            
            // Remove the title from the content if it appears at the beginning
            const title = latestArticle.title || ''
            if (plainText.startsWith(title)) {
              plainText = plainText.substring(title.length).trim()
            }
            
            // Get first 2-3 sentences (split by periods)
            const sentences = plainText.split('.').filter(s => s.trim().length > 0)
            excerpt = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '')
          } else {
            excerpt = latestArticle.description || 'Read our latest article on Medium.'
          }
          
          setMediumArticle({
            title: latestArticle.title,
            description: excerpt,
            link: latestArticle.link,
            thumbnail: imageUrl,
            pubDate: latestArticle.pubDate,
          })
        }
      } catch (error) {
        console.error('Error loading Medium feed:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMediumFeed()
  }, [])

  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Background pattern with "dopp" text using CSS */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              #f5b0be 40px,
              #f5b0be 80px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              #8eb5da 40px,
              #8eb5da 80px
            )`
          }}
        />
        
        {/* "dopp" text pattern - same grid as normal website */}
        <div 
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='doppGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f5b0be'/%3E%3Cstop offset='100%25' stop-color='%238eb5da'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctext x='40' y='45' font-family='Arial, sans-serif' font-size='12' font-weight='bold' text-anchor='middle' dominant-baseline='middle' fill='url(%23doppGrad)'%3Edopp%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        {/* Loading content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center z-10 px-8 flex flex-col justify-center items-center min-h-screen"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <Logo />
          </motion.div>
          
          {/* Content with blur background */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-2xl -z-10" style={{ filter: 'blur(0.7px)' }}></div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-6xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight text-center px-6 py-4"
            >
              Everyone will have a dopp
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed text-center px-6 py-4"
            >
              A new class of AI agents that embody how we think, express and connect, turning presence into something programmable, scalable and alive.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-12 flex flex-col items-center px-6 py-4"
            >
              {/* Loading circle */}
              <motion.div
                className="w-16 h-16 border-4 border-gray-300 border-t-primary-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen"
    >
      {/* Top left "dopp" text */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 z-20"
      >
        <div className="text-white font-bold text-2xl">
          dopp
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
        {/* Personality dApp Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-8 mb-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8">
                <Logo />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Try Our Personality dApp</h2>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Enter any X username and chat with an AI that replicates their personality, 
              communication style, and interests based on all their tweets.
            </p>
            <Link 
              href="/personality"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] text-white rounded-lg hover:from-[#f395a8] hover:to-[#7aa5d1] transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Sparkles size={20} />
              Launch Personality dApp
            </Link>
          </div>
        </motion.div>

        {/* X Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Latest Posts</h2>
            <a 
              href="https://x.com/usedoppai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              title="Visit our X profile"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
          <TwitterEmbed />
        </motion.div>

        {/* Medium Feed Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-8 mb-8"
        >
          <MediumFeed 
            article={mediumArticle}
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="fixed bottom-0 left-0 right-0 glass-card p-4"
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <div>© 2025 DoppAI. All rights reserved.</div>
          <a 
            href="mailto:contact@dopp.info"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Mail size={16} />
            contact@dopp.info
          </a>
        </div>
      </motion.footer>
    </motion.div>
  )
} 