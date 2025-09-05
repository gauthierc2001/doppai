'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Calendar, Heart, MessageCircle, Repeat2 } from 'lucide-react'

interface Tweet {
  id: string
  text: string
  created_at: string
  retweet_count: number
  like_count: number
  reply_count: number
  url: string
}

export default function TwitterEmbed() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLatestTweets = async () => {
      try {
        // Use the new cached endpoint - server handles all caching globally
        const response = await fetch('/api/twitter/cached-tweets')

        if (!response.ok) {
          throw new Error('Failed to fetch cached tweets')
        }

        const data = await response.json()
        if (data.success && data.tweets && data.tweets.length > 0) {
          setTweets(data.tweets)
          
          if (data.cached) {
            console.log('🌐 Using globally cached tweet (shared by all users)')
          } else {
            console.log('🔄 Fresh tweet fetched and cached globally for all users')
          }
        } else {
          if (data.source === 'api_error') {
            setError('Twitter API temporarily unavailable. Please try again in a few minutes.')
          } else {
            setError('No tweets found')
          }
        }
      } catch (err) {
        console.error('Error fetching cached tweets:', err)
        setError('Twitter API temporarily unavailable. Please try again in a few minutes.')
      } finally {
        setLoading(false)
      }
    }

    fetchLatestTweets()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
        </div>
        <div className="text-gray-500 mt-4">Loading latest posts...</div>
      </div>
    )
  }

  if (error || tweets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          {error?.includes('rate limited') 
            ? 'Posts temporarily unavailable due to API limits' 
            : (error || 'No posts available at the moment')
          }
        </div>
        <a 
          href="https://x.com/usedoppai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink size={16} />
          Visit our X profile
        </a>
        {error?.includes('rate limited') && (
          <div className="text-xs text-gray-400 mt-2">
            Try refreshing in 15 minutes
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tweets.map((tweet, index) => (
        <motion.div
          key={tweet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          {/* Tweet Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">dopp</div>
                <div className="text-gray-500 text-sm">@usedoppai</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Calendar size={14} />
              {formatDate(tweet.created_at)}
            </div>
          </div>

          {/* Tweet Text */}
          <div className="text-gray-800 mb-4 leading-relaxed">
            {tweet.text}
          </div>

          {/* Tweet Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                {formatNumber(tweet.reply_count || 0)}
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 size={16} />
                {formatNumber(tweet.retweet_count || 0)}
              </div>
              <div className="flex items-center gap-1">
                <Heart size={16} />
                {formatNumber(tweet.like_count || 0)}
              </div>
            </div>
            <a 
              href={tweet.url}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 