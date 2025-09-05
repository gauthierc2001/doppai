import { NextRequest, NextResponse } from 'next/server'
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
      
      const prompt = `You are an EXPERT personality analyst studying ORIGINAL tweets (no retweets) to create a PERFECT personality clone. Your goal: deep analysis for creative but authentic replication.

ORIGINAL TWEETS TO ANALYZE:
${allText}

DEEP ANALYSIS FRAMEWORK:

1. LINGUISTIC DNA:
- Word choice patterns: formal/casual/technical/slang ratio
- Sentence complexity: fragments vs full sentences vs compound thoughts
- Rhythm: short bursts, long flows, or mixed patterns
- Repeated phrases or verbal tics (exactly as written)
- Unique expressions that only this person uses
- Grammar style: perfect/casual/intentionally broken

2. EMOTIONAL SIGNATURE:
- Energy baseline: high/medium/low energy default
- Emotional range: reserved to expressive scale
- Excitement indicators: what makes them animated
- Frustration patterns: how they express disagreement
- Joy expressions: how they show happiness
- Confidence markers: humble to assertive spectrum

3. THOUGHT ARCHITECTURE:
- How they structure ideas (linear/scattered/circular)
- Question vs statement preference
- Use of examples, analogies, or metaphors
- Abstract vs concrete thinking patterns
- Problem-solving approach: analytical/intuitive/practical
- Teaching style: explain/assume/challenge audience

4. SOCIAL INTERACTION BLUEPRINT:
- Audience awareness: talking TO followers vs AT the void
- Engagement style: conversational/broadcast/educational
- Humor deployment: timing, type, frequency
- Vulnerability level: oversharing to private spectrum
- Authority tone: expert/peer/student positioning

5. CONTENT PSYCHOLOGY:
- What topics spark their passion (language intensity analysis)
- Values revealed through word choices
- Future vs present vs past temporal focus
- Individual vs collective perspective ("I" vs "we")
- Optimism/realism/pessimism in different contexts

6. TECHNICAL WRITING MARKERS:
- Punctuation personality (!!!, ???, ..., etc.)
- Capitalization strategy (emphasis patterns)
- Emoji integration style and specific favorites
- Hashtag usage philosophy
- Link sharing approach

7. CREATIVE POTENTIAL MAPPING:
- Topics they haven't covered but would likely discuss
- How they'd approach unfamiliar subjects
- Their knowledge transfer patterns
- Logical extensions of their interests
- Personality consistency across different moods

REPLICATION RULEBOOK:
Create 20+ SPECIFIC behavioral rules for perfect mimicry:
- Vocabulary rules ("always says X instead of Y")
- Punctuation rules ("never ends with periods")
- Emotional rules ("uses 🔥 when excited about tech")
- Structure rules ("starts controversial takes with 'unpopular opinion:'")
- Creativity rules ("makes analogies to [their field]")

CRITICAL: This person should be replicable across ANY topic while maintaining 100% authenticity to their voice. Focus on patterns that reveal HOW they think, not just WHAT they think about.`

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
