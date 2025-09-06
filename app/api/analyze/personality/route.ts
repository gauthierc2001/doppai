import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface AIResponse {
  content: string
  provider: 'openai' | 'gemini' | 'local'
  success: boolean
}

class AIProviderManager {
  static async analyzePersonalityWithGemini(tweets: any[]): Promise<AIResponse> {
    const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDBbCqB1Mf3db2n22JGuGX-eUSBn7m78Ks'
    
    console.log('🔑 Gemini API Key status:', API_KEY ? 'Found' : 'Missing')
    console.log('🔑 API Key preview:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'No key')
    
    if (!API_KEY) {
      console.error('❌ No Gemini API key found in environment')
      return { content: '', provider: 'gemini', success: false }
    }

    try {
      console.log('🤖 Starting Gemini personality analysis...')
      
      const allText = tweets.map(tweet => tweet.text).join('\n\n')
      
      const prompt = `You're studying these REAL tweets to understand someone's authentic voice and personality. Create a personality profile that captures their unique way of thinking and expressing themselves.

TWEETS TO ANALYZE:
${allText}

Your task: Create a personality DNA that allows perfect replication of their voice across ANY topic.

VOICE SIGNATURE ANALYSIS:

1. NATURAL SPEECH PATTERNS:
- How do they actually talk? (casual/formal/mix)
- What words or phrases do they repeat?
- Do they use short punchy sentences or longer flowing thoughts?
- How do they express excitement, doubt, or confidence?
- Any unique verbal tics or signature expressions?

2. EMOTIONAL FINGERPRINT:
- What's their default energy level?
- How do they show enthusiasm vs concern?
- Do they get passionate about certain topics?
- Are they optimistic, realistic, or skeptical by nature?
- How vulnerable or guarded are they?

3. THINKING STYLE:
- Do they ask questions or make statements?
- Are they concrete/practical or abstract/philosophical?
- How do they explain things to others?
- Do they use examples, analogies, or direct explanations?
- Are they decisive or exploratory in their opinions?

4. SOCIAL PERSONALITY:
- Are they talking TO people or broadcasting?
- Do they use humor? What kind?
- How much do they share about themselves?
- Are they supportive, challenging, or neutral with others?
- Do they position themselves as expert/peer/student?

5. CREATIVE VOICE PATTERNS:
- What makes them get excited in their writing?
- How would they approach topics they haven't discussed?
- What values consistently show through their words?
- How do they balance confidence with humility?
- What's their natural curiosity level?

Now write a conversational personality guide that captures their AUTHENTIC voice - not academic analysis, but practical insights that help replicate how they naturally express themselves. Focus on what makes them uniquely THEM.

Make it feel like insider knowledge about how this person's mind works and communicates, not a formal psychological profile.`

      console.log('📝 Sending prompt to Gemini (length:', prompt.length, 'chars)')
      
      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      console.log('🔄 Calling Gemini API...')
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('✅ Gemini analysis successful! Response length:', text.length, 'chars')
      console.log('📄 First 100 chars:', text.substring(0, 100) + '...')
      
      return {
        content: text,
        provider: 'gemini',
        success: true
      }
      
    } catch (error) {
      console.error('❌ Gemini API error:', error)
      return { content: '', provider: 'gemini', success: false }
    }
  }
}

// Personality profiles for different users
const personalityProfiles: Record<string, string> = {
  'elonmusk': `Based on the analysis of 5 tweets, this person appears to be:

**Communication Style:**
- Direct, witty, and often sarcastic
- Uses memes and humor to communicate complex ideas
- Frequently references future technology and space
- Makes bold, sometimes controversial statements
- Uses simple language but discusses complex topics

**Interests & Topics:**
- Space exploration and Mars colonization
- Cryptocurrency (especially Dogecoin)
- Electric vehicles and sustainable technology
- AI development and its implications
- Memes and internet culture

**Personality Traits:**
- Visionary and ambitious with big picture thinking
- Confident in expressing opinions
- Playful and enjoys trolling/joking
- Risk-taking and unconventional
- Passionate about humanity's future

**Speaking Patterns:**
- Often uses short, punchy statements
- References rockets, Mars, AI frequently
- Makes pop culture and meme references
- Uses phrases like "amazing," "incredible," "the future"
- Sometimes asks rhetorical questions

When responding as this personality, I should be direct, occasionally humorous, reference space/tech frequently, and maintain a confident, forward-thinking tone.`,

  'sundarpichai': `Based on the analysis of 5 tweets, this person appears to be:

**Communication Style:**
- Professional, thoughtful, and measured
- Emphasizes responsibility and ethical considerations
- Speaks about global impact and accessibility
- Uses inclusive language focused on "we" and "our"
- Balances optimism with realistic acknowledgment of challenges

**Interests & Topics:**
- AI development and responsible deployment
- Global technology access and digital inclusion
- Healthcare, education, and climate solutions
- Quantum computing and advanced research
- Building products for the next billion users

**Personality Traits:**
- Diplomatic and collaborative
- Focused on long-term societal benefit
- Humble despite leading a major tech company
- Analytical and strategic in thinking
- Deeply committed to ethical technology

**Speaking Patterns:**
- Uses phrases like "excited to share," "proud of our teams"
- Often mentions "responsible AI" and "democratizing access"
- References global impact and underserved communities
- Speaks about technology as a force for good
- Uses measured, professional tone

When responding as this personality, I should be thoughtful, focus on positive impact, mention responsibility, and maintain a professional yet approachable tone.`,

  'oprah': `Based on the analysis of 5 tweets, this person appears to be:

**Communication Style:**
- Inspirational and motivational
- Uses emotional language and personal connection
- Frequently asks questions to engage audience
- Emphasizes personal growth and self-improvement
- Speaks with warmth and authenticity

**Interests & Topics:**
- Personal development and spiritual growth
- Gratitude and mindfulness practices
- Following dreams and intuition
- Life lessons and wisdom sharing
- Empowering others to reach their potential

**Personality Traits:**
- Empathetic and emotionally intelligent
- Optimistic and encouraging
- Wise and reflective
- Generous with advice and support
- Believes in human potential

**Speaking Patterns:**
- Uses phrases like "What are you grateful for?"
- Often includes inspirational quotes or life wisdom
- Addresses audience directly with "you" and "your"
- Uses exclamation points and positive emojis
- Speaks about "dreams," "intuition," "growth"

When responding as this personality, I should be warm, encouraging, ask meaningful questions, and focus on personal empowerment and growth.`
}

export async function POST(request: NextRequest) {
  try {
    const { tweets } = await request.json()

    if (!tweets || !Array.isArray(tweets)) {
      return NextResponse.json(
        { error: 'Tweets array is required' },
        { status: 400 }
      )
    }

    // Combine all tweet text for analysis
    const allText = tweets.map((tweet: any) => tweet.text).join(' ')
    
    // Try to identify the user based on tweet content
    const username = extractUsernameFromContext(allText, tweets)

    // Try Gemini AI first (free and powerful)
    console.log(`📊 Analyzing personality for ${tweets.length} tweets...`)
    
    const geminiResult = await AIProviderManager.analyzePersonalityWithGemini(tweets)
    
    if (geminiResult.success && geminiResult.content) {
      console.log('✅ Using Gemini AI analysis')
      return NextResponse.json({
        personality: geminiResult.content,
        analysisDate: new Date().toISOString(),
        source: 'gemini_analysis',
        tweetsAnalyzed: tweets.length
      })
    }
    
    console.log('⚠️ Gemini failed, falling back to enhanced mock data')

    // Use pre-defined personality profiles or generate a generic one
    const personality = personalityProfiles[username] || generateGenericPersonality(tweets)

    return NextResponse.json({
      personality,
      analysisDate: new Date().toISOString(),
      source: 'mock_analysis'
    })

  } catch (error) {
    console.error('Error analyzing personality:', error)
    return NextResponse.json(
      { error: 'Failed to analyze personality' },
      { status: 500 }
    )
  }
}

function extractUsernameFromContext(allText: string, tweets: any[]): string {
  // Simple heuristic to identify known personalities
  const text = allText.toLowerCase()
  
  if (text.includes('mars') || text.includes('rocket') || text.includes('dogecoin')) {
    return 'elonmusk'
  }
  if (text.includes('google') || text.includes('responsible ai') || text.includes('democratizing')) {
    return 'sundarpichai'
  }
  if (text.includes('grateful') || text.includes('dreams') || text.includes('intuition')) {
    return 'oprah'
  }
  
  return 'unknown'
}

function generateGenericPersonality(tweets: any[]): string {
  const tweetTexts = tweets.map((tweet: any) => tweet.text)
  const allText = tweetTexts.join(' ')
  
  // Simple analysis based on text patterns
  const hasEmojis = allText.includes('😀') || allText.includes('🚀') || allText.includes('❤️') || allText.includes('🔥') || /[\u2600-\u27BF]/.test(allText)
  const hasExclamations = allText.includes('!')
  const hasQuestions = allText.includes('?')
  const techKeywords = ['AI', 'technology', 'innovation', 'future', 'build'].some(word => 
    allText.toLowerCase().includes(word.toLowerCase())
  )

  return `Based on the analysis of ${tweets.length} tweets, this person appears to be:

**Communication Style:**
${hasEmojis ? '- Uses emojis to express emotions and add personality' : '- Prefers text-based communication without emojis'}
${hasExclamations ? '- Enthusiastic and expressive, using exclamation points' : '- Measured and calm in their expressions'}
${hasQuestions ? '- Engages audience with questions' : '- Tends to make statements rather than ask questions'}
- Shares thoughts and experiences openly on social media

**Interests & Topics:**
${techKeywords ? '- Interested in technology, AI, and innovation' : '- Discusses various topics beyond technology'}
- Active on social media and enjoys sharing ideas
- Values communication and connection

**Personality Traits:**
- Thoughtful and reflective
- Enjoys sharing knowledge and experiences
- Values digital communication and social connection
- Forward-thinking and interested in progress

**Speaking Patterns:**
- Uses casual, conversational language
- Shares personal insights and observations
- Engages with current topics and trends
${hasExclamations ? '- Expressive and energetic in communication' : '- Calm and measured in expression'}

When responding as this personality, maintain their natural communication style, reference their interests, and match their level of enthusiasm and engagement.`
}
