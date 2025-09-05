'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, User, Bot, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Tweet {
  id: string
  text: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
  }
}

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function PersonalityPage() {
  const [username, setUsername] = useState('')
  // Analyze all available tweets
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [personality, setPersonality] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzePersonality = async () => {
    if (!username.trim()) {
      setError('Please enter a valid X username')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setTweets([])
    setPersonality('')
    setMessages([])

    try {
      // Fetch tweets from Twitter API
      const response = await fetch('/api/twitter/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim()
          // Analyzes all available tweets
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tweets')
      }

      const data = await response.json()
      setTweets(data.tweets)
      
      // Show data source info
      if (data.source === 'real_scraper') {
        console.log('✅ Using REAL tweets from Twitter!')
      } else if (data.source === 'puppeteer_scraper') {
        console.log('✅ Using scraped tweets from browser automation')
      } else if (data.warning) {
        console.warn('⚠️ Using mock data:', data.warning)
      }

      // Analyze personality
      const personalityResponse = await fetch('/api/analyze/personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets: data.tweets }),
      })

      if (!personalityResponse.ok) {
        throw new Error('Failed to analyze personality')
      }

      const personalityData = await personalityResponse.json()
      setPersonality(personalityData.personality)

      // Add welcome message
      setMessages([{
        id: '1',
        type: 'bot',
        content: `Hello! I'm the AI personality of @${username}. I've analyzed all their tweets to understand their communication style, interests, and personality. How can I help you today?`,
        timestamp: new Date()
      }])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !personality) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat/personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          personality,
          tweets: tweets, // Pass the actual tweets for better context
          conversationHistory: messages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5b0be] via-white to-[#8eb5da]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to DoppAI</span>
            </Link>
            <div className="text-2xl font-bold text-gray-800">dopp</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!personality ? (
          /* Analysis Phase */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Replicate Any X Personality
                </h1>
                <p className="text-gray-600 text-lg">
                  Enter an X username and we'll analyze all their tweets to create an AI personality that talks just like them.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username (will analyze all tweets)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5b0be] focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && analyzePersonality()}
                  />
                  <button
                    onClick={analyzePersonality}
                    disabled={isAnalyzing || !username.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] text-white rounded-lg hover:from-[#f395a8] hover:to-[#7aa5d1] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
                  >
                    <AlertCircle size={20} />
                    {error}
                  </motion.div>
                )}

                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Fetching posts from @{username}...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Chat Phase */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Personality Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    @{username} Personality
                  </h2>
                  <p className="text-gray-600">
                    Analyzed {tweets.length} posts • Ready to chat
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="glass-card p-6 h-96 overflow-y-auto">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-[#f5b0be] to-[#8eb5da]' 
                            : 'bg-gradient-to-r from-[#8eb5da] to-[#9bb8e0]'
                        }`}>
                          {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                        </div>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8eb5da] to-[#9bb8e0] flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="glass-card p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5b0be] focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-6 py-3 bg-gradient-to-r from-[#f5b0be] to-[#8eb5da] text-white rounded-lg hover:from-[#f395a8] hover:to-[#7aa5d1] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
