'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface MediumArticle {
  title: string
  description: string
  link: string
  thumbnail?: string
  pubDate: string
}

interface MediumFeedProps {
  article: MediumArticle | null
  loading: boolean
}

export default function MediumFeed({ article, loading }: MediumFeedProps) {
  if (loading) {
    return (
      <div className="text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Latest Articles</h2>
          <a 
            href="https://medium.com/@doppai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 transition-all duration-300 p-2 rounded-lg flex items-center justify-center hover:text-black hover:bg-black/10 hover:scale-110"
            title="Visit our Medium profile"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
          </a>
        </div>
        <div className="text-gray-500 italic">Loading latest articles...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Latest Articles</h2>
          <a 
            href="https://medium.com/@doppai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 transition-all duration-300 p-2 rounded-lg flex items-center justify-center hover:text-black hover:bg-black/10 hover:scale-110"
            title="Visit our Medium profile"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
          </a>
        </div>
        <div className="text-red-500 italic">Unable to load articles. Please visit our Medium profile.</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Latest Articles</h2>
        <a 
          href="https://medium.com/@doppai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-700 transition-all duration-300 p-2 rounded-lg flex items-center justify-center hover:text-black hover:bg-black/10 hover:scale-110"
          title="Visit our Medium profile"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
        </a>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 rounded-xl overflow-hidden shadow-lg hover-lift"
      >
        {article.thumbnail && (
          <div className="relative h-48 bg-gradient-to-r from-primary-500 to-secondary-500">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {new Date(article.pubDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </span>
            <a 
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Read More
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 