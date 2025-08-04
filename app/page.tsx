'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Twitter, Mail } from 'lucide-react'
import MediumFeed from '@/components/MediumFeed'
import TwitterEmbed from '@/components/TwitterEmbed'
import Logo from '@/components/Logo'

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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Logo />
        </motion.div>

        {/* Intro Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 mb-8"
        >
          <h1 className="gradient-text text-5xl font-bold mb-6 text-balance">
            Everyone will have a dopp
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            A new class of AI agents that embody how we think, express and connect, turning presence into something programmable, scalable and alive.
          </p>
        </motion.div>

        {/* X Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Follow Us on X</h2>
            <a 
              href="https://x.com/usedoppai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              title="Visit our X profile"
            >
              <Twitter size={24} />
            </a>
          </div>
          <TwitterEmbed />
        </motion.div>

        {/* Medium Feed Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
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
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 glass-card p-4"
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <div>© 2025 DoppAI. All rights reserved.</div>
          <a 
            href="mailto:contact@doppai.com"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Mail size={16} />
            contact@doppai.com
          </a>
        </div>
      </motion.footer>
    </div>
  )
} 