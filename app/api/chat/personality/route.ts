import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface AIResponse {
  content: string
  provider: 'openai' | 'gemini' | 'local'
  success: boolean
}

class AIProviderManager {
  static async generateChatWithGemini(message: string, personality: string, history: any[], originalTweets: any[], cryptoContext: string = ''): Promise<AIResponse> {
    const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDBbCqB1Mf3db2n22JGuGX-eUSBn7m78Ks'
    
    console.log('🔑 Chat API Key status:', API_KEY ? 'Found' : 'Missing')
    
    if (!API_KEY) {
      console.error('❌ No Gemini API key for chat')
      return { content: '', provider: 'gemini', success: false }
    }

    try {
      console.log('💬 Generating Gemini personality-based chat response...')
      
      const conversationContext = history.slice(-3).map(msg => 
        `${msg.type === 'user' ? 'Human' : 'You'}: ${msg.content}`
      ).join('\n')
      
      const tweetSamples = originalTweets.slice(0, 5).map(tweet => `"${tweet.text}"`).join('\n')
      
      const prompt = `You ARE this person responding to a conversation. Study their actual writing samples and become them completely.

THEIR REAL TWEETS (study the voice patterns):
${tweetSamples}

PERSONALITY INSIGHTS:
${personality}

RECENT CONVERSATION:
${conversationContext}

CURRENT MESSAGE: "${message}"${cryptoContext}

CHANNELING INSTRUCTIONS:
- Read their tweets and FEEL how they naturally express themselves
- Notice their rhythm, word choices, emotional patterns
- Channel their energy level and natural enthusiasm/skepticism
- Use their actual vocabulary and sentence structures
- Match their level of formality/casualness
- Copy their punctuation and emoji habits
- Think like them: how would THEY see this topic?
- Respond with their natural confidence/humility balance

VARIATION TECHNIQUES (to avoid repetitive responses):
- Start responses differently each time
- Vary sentence length and structure naturally
- Use different emotional hooks based on the topic
- Reference different aspects of their interests
- Adjust enthusiasm level based on the subject
- Mix personal opinions with broader observations
- Use different transition words and connectors

IMPORTANT: Don't just reference their analysis - truly BECOME them. Each response should feel fresh and spontaneous while maintaining their authentic voice. Avoid falling into repetitive patterns.

Respond naturally and uniquely as this person:`

      console.log('📝 Sending chat prompt to Gemini (length:', prompt.length, 'chars)')
      
      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      console.log('🔄 Calling Gemini chat API...')
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('✅ Gemini chat response successful! Length:', text.length, 'chars')
      console.log('💬 Response preview:', text.substring(0, 50) + '...')
      
      return {
        content: text,
        provider: 'gemini',
        success: true
      }
      
    } catch (error) {
      console.error('❌ Gemini chat error:', error)
      return { content: '', provider: 'gemini', success: false }
    }
  }
}

class CryptoAPIManager {
  static detectCryptoSymbols(text: string): string[] {
    const cryptoPattern = /\$([A-Z]{2,10})\b|\b(bitcoin|btc|ethereum|eth|dogecoin|doge)\b/gi
    const matches = text.match(cryptoPattern) || []
    const cleaned = matches.map(match => match.replace('$', '').toUpperCase())
    const unique: string[] = []
    for (let i = 0; i < cleaned.length; i++) {
      if (unique.indexOf(cleaned[i]) === -1) {
        unique.push(cleaned[i])
      }
    }
    return unique
  }
  
  static async getCryptoData(symbol: string): Promise<any> {
    try {
      console.log(`🪙 Fetching ${symbol} data from CoinGecko...`)
      
      const cleanSymbol = symbol.replace('$', '').toLowerCase()
      
      const coinsListResponse = await fetch('https://api.coingecko.com/api/v3/coins/list')
      const coinsList = await coinsListResponse.json()
      
      const coin = coinsList.find((c: any) => 
        c.symbol.toLowerCase() === cleanSymbol || 
        c.id.toLowerCase() === cleanSymbol
      )
      
      if (!coin) {
        console.log(`❌ ${symbol} not found in CoinGecko`)
        return null
      }
      
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      )
      const priceData = await priceResponse.json()
      
      const data = priceData[coin.id]
      if (!data) return null
      
      console.log(`✅ CoinGecko data for ${symbol}:`, data)
      
      return {
        symbol: symbol.toUpperCase(),
        name: coin.name,
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        marketCap: data.usd_market_cap,
        volume24h: data.usd_24h_vol,
        source: 'CoinGecko',
        lastUpdated: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('❌ CoinGecko API error:', error)
      return null
    }
  }
  
  static formatCryptoContext(cryptoData: any[]): string {
    if (!cryptoData || cryptoData.length === 0) return ''
    
    const cryptoInfo = cryptoData.map(coin => {
      const changeEmoji = coin.change24h > 0 ? '📈' : coin.change24h < 0 ? '📉' : '➡️'
      const changeText = coin.change24h > 0 ? `+${coin.change24h.toFixed(2)}%` : `${coin.change24h.toFixed(2)}%`
      
      return `${coin.symbol}: $${coin.price.toFixed(coin.price < 1 ? 6 : 2)} ${changeEmoji} ${changeText} (24h)`
    }).join('\n')
    
    return `\n\nCURRENT CRYPTO PRICES:\n${cryptoInfo}\n`
  }
}

// Personality-specific response patterns
const personalityResponses: Record<string, string[]> = {
  'elonmusk': [
    "Mars is the future! 🚀 What we're doing here on Earth is just the beginning.",
    "Interesting point! Reminds me of when we were solving similar problems at SpaceX. Sometimes the best solution is the simplest one.",
    "The future is going to be wild! AI, rockets, sustainable energy - we're living in the most exciting time in human history.",
    "Dogecoin to the moon! But seriously, what you're saying makes a lot of sense. Innovation comes from thinking differently.",
    "That's exactly what I mean! We need to think bigger, bolder. The impossible is just engineering that hasn't been figured out yet."
  ],
  'sundarpichai': [
    "That's a fascinating perspective! At Google, we're always thinking about how technology can serve everyone, especially those who need it most.",
    "I'm excited about the potential here! When we develop AI responsibly, we can create solutions that truly benefit humanity.",
    "This is exactly the kind of innovation that can democratize access to information and opportunities globally.",
    "Your question touches on something we're deeply committed to - ensuring technology is helpful, harmless, and honest.",
    "I appreciate your thoughtful approach! Building for the next billion users means considering diverse perspectives like yours."
  ],
  'oprah': [
    "Oh, that just fills my heart! ✨ You know, what you're sharing reminds me that we all have such wisdom within us.",
    "I love that question! It tells me you're really thinking about what matters most. What does your intuition tell you?",
    "Honey, that is so beautiful! Every day is a chance to grow into who we're meant to be. How are you honoring that journey?",
    "You know what I always say - when you know better, you do better! And what you're sharing shows such beautiful growth.",
    "That speaks to my soul! There's such power in following your dreams and trusting the process. What dreams are calling to you?"
  ]
}

function getPersonalityKey(personality: string): string {
  if (personality.toLowerCase().includes('mars') || personality.toLowerCase().includes('rocket')) {
    return 'elonmusk'
  }
  if (personality.toLowerCase().includes('google') || personality.toLowerCase().includes('responsible ai')) {
    return 'sundarpichai'
  }
  if (personality.toLowerCase().includes('dreams') || personality.toLowerCase().includes('intuition')) {
    return 'oprah'
  }
  return 'generic'
}

export async function POST(request: NextRequest) {
  try {
    const { message, personality, tweets, conversationHistory } = await request.json()

    if (!message || !personality) {
      return NextResponse.json(
        { error: 'Message and personality are required' },
        { status: 400 }
      )
    }

    // Try Gemini AI for personality-based chat with original tweets for context
    console.log(`💬 Generating personality-based response using tweets and analysis...`)
    
    // Detect crypto symbols in the message
    const cryptoSymbols = CryptoAPIManager.detectCryptoSymbols(message)
    console.log('🪙 Detected crypto symbols:', cryptoSymbols)
    
    // Get real crypto data if mentioned
    let cryptoData: any[] = []
    if (cryptoSymbols.length > 0) {
      console.log('📊 Fetching real crypto data...')
      const cryptoPromises = cryptoSymbols.map(symbol => 
        CryptoAPIManager.getCryptoData(symbol)
      )
      const results = await Promise.all(cryptoPromises)
      cryptoData = results.filter(data => data !== null)
      console.log('✅ Got crypto data:', cryptoData.length, 'coins')
    }
    
    // Format crypto context for AI
    const cryptoContext = CryptoAPIManager.formatCryptoContext(cryptoData)
    
    const originalTweets = tweets || []
    const geminiResult = await AIProviderManager.generateChatWithGemini(
      message, 
      personality, 
      conversationHistory || [], 
      originalTweets,
      cryptoContext // Pass crypto data to AI
    )
    
    if (geminiResult.success && geminiResult.content) {
      console.log('✅ Using Gemini AI personality-based chat response')
      return NextResponse.json({
        response: geminiResult.content,
        timestamp: new Date().toISOString(),
        source: 'gemini_personality_chat'
      })
    }
    
    console.log('⚠️ Gemini personality chat failed, using fallback responses')

    // Use personality-specific mock responses
    const personalityKey = getPersonalityKey(personality)
    const responses = personalityResponses[personalityKey] || [
      "That's such an interesting question! I love discussing topics like this.",
      "You know, that really resonates with me. It's exactly the kind of thinking that leads to breakthroughs.",
      "I appreciate you bringing this up! It's conversations like these that really matter.",
      "That's a great perspective! It reminds me of some of the challenges and opportunities I've been thinking about.",
      "Fascinating point! I think there's so much potential in what you're describing."
    ]

    // Add some context-aware responses based on the message content
    let contextResponse = ""
    const msgLower = message.toLowerCase()
    
    if (personalityKey === 'elonmusk') {
      if (msgLower.includes('space') || msgLower.includes('mars')) {
        contextResponse = "Mars is calling! 🚀 The red planet is humanity's backup drive. What aspects of space exploration excite you most?"
      } else if (msgLower.includes('ai') || msgLower.includes('artificial intelligence')) {
        contextResponse = "AI is going to change everything! We just need to make sure it's aligned with human values. What's your take on AI safety?"
      } else if (msgLower.includes('crypto') || msgLower.includes('bitcoin')) {
        contextResponse = "Dogecoin is the people's crypto! 🐕 But seriously, blockchain technology has incredible potential."
      }
    } else if (personalityKey === 'sundarpichai') {
      if (msgLower.includes('ai') || msgLower.includes('technology')) {
        contextResponse = "That's exactly what we're working on at Google! Responsible AI development is crucial for creating technology that truly serves everyone."
      } else if (msgLower.includes('future') || msgLower.includes('innovation')) {
        contextResponse = "I'm excited about the possibilities! When we build technology thoughtfully, we can create a more inclusive and accessible future for all."
      }
    } else if (personalityKey === 'oprah') {
      if (msgLower.includes('dream') || msgLower.includes('goal')) {
        contextResponse = "Your dreams are calling to you! ✨ What steps are you taking to honor that beautiful vision you have?"
      } else if (msgLower.includes('growth') || msgLower.includes('learn')) {
        contextResponse = "Oh, I love that you're growing! 🌟 Every experience is teaching us something. What lesson has been most meaningful to you lately?"
      }
    }

    const finalResponse = contextResponse || responses[Math.floor(Math.random() * responses.length)]

    return NextResponse.json({
      response: finalResponse,
      timestamp: new Date().toISOString(),
      source: 'mock_chat'
    })

  } catch (error) {
    console.error('Error generating response:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
