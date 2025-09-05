import { NextRequest, NextResponse } from 'next/server'
import { AIProviderManager } from '@/lib/ai-providers-fixed'
import { CryptoAPIManager } from '@/lib/crypto-apis'

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
