'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

// Twitter widgets type declaration
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void
      }
    }
  }
}

export default function TwitterEmbed() {
  useEffect(() => {
    // Load Twitter widgets script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.head.appendChild(script)
      
      script.onload = () => {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load()
        }
      }
    } else {
      // If script already loaded, just reload widgets
      window.twttr.widgets.load()
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Official Twitter Timeline Embed - Shows REAL tweets from @usedoppai */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <a 
          className="twitter-timeline" 
          data-height="400" 
          data-theme="light"
          data-tweet-limit="3"
          data-chrome="noheader nofooter noborders transparent"
          href="https://twitter.com/usedoppai?ref_src=twsrc%5Etfw"
        >
          Loading tweets from @usedoppai...
        </a>
      </div>
      
      {/* Fallback link in case embed fails */}
      <div className="text-center py-4">
        <a 
          href="https://x.com/usedoppai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          View more posts on X →
        </a>
      </div>
    </motion.div>
  )
} 