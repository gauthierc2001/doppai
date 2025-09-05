import { NextRequest, NextResponse } from 'next/server'
import { AIProviderManager } from '../../../../lib/providers'

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
  const hasEmojis = /[\u{1F600}-\u{1F6FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(allText)
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
