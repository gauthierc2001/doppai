import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface CachedTweetData {
  tweets: any[]
  timestamp: number
  username: string
}

interface Tweet {
  id: string
  text: string
  created_at: string
  retweet_count: number
  like_count: number
  reply_count: number
  url: string
}

const CACHE_FILE = path.join(process.cwd(), 'twitter-cache.json')
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function readCache(): CachedTweetData | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
      const now = Date.now()
      
      // Check if cache is still valid
      if (now - data.timestamp < CACHE_DURATION) {
        const hoursRemaining = Math.round((CACHE_DURATION - (now - data.timestamp)) / (1000 * 60 * 60))
        console.log(`📱 Using server cached tweet (valid for ${hoursRemaining} more hours)`)
        return data
      } else {
        console.log(`🕐 Server cache expired, will fetch fresh tweet`)
        // Clean up expired cache
        if (fs.existsSync(CACHE_FILE)) {
          fs.unlinkSync(CACHE_FILE)
        }
      }
    }
  } catch (error) {
    console.error('Cache read error:', error)
    // Clean up corrupted cache
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE)
    }
  }
  return null
}

function writeCache(tweets: Tweet[], username: string): void {
  try {
    const cacheData: CachedTweetData = {
      tweets,
      timestamp: Date.now(),
      username
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2))
    console.log(`💾 Tweet cached globally for 24 hours`)
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

async function fetchFreshTweet(username: string): Promise<Tweet[]> {
  console.log(`🔄 Getting latest tweet for @${username} using Twitter API...`)
  
  try {
    // Get Bearer Token from environment or fallback
    const bearerToken = process.env.TWITTER_BEARER_TOKEN || "AAAAAAAAAAAAAAAAAAAAALNJfwEAAAAAm0aIfmDpV63anDHo%2FiJT%2FBnx0zs%3DApg1YFbpGF3ZiTnKVcNcaBx5M8KYDvdcXvNDHmRYKD5xgHkIRz"
    
    // Step 1: Get user ID from username
    const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: {
        "Authorization": `Bearer ${bearerToken}`
      }
    })
    
    console.log(`Bearer token response: ${userResponse.status}`)
    
    if (userResponse.status === 429) {
      throw new Error("Rate limited. Please wait 15 minutes before trying again.")
    }
    
    if (!userResponse.ok) {
      throw new Error(`User lookup failed: ${userResponse.status}`)
    }
    
    const userData = await userResponse.json()
    if (!userData.data || !userData.data.id) {
      throw new Error(`User @${username} not found`)
    }
    
    const userId = userData.data.id
    console.log(`✅ Found user @${username} (ID: ${userId})`)
    
    // Small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Step 2: Get latest tweet
    const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=1&tweet.fields=created_at,public_metrics`, {
      headers: {
        "Authorization": `Bearer ${bearerToken}`
      }
    })
    
    if (tweetsResponse.status === 429) {
      throw new Error("Rate limited on tweets endpoint. Please wait 15 minutes before trying again.")
    }
    
    if (!tweetsResponse.ok) {
      throw new Error(`Tweets fetch failed: ${tweetsResponse.status}`)
    }
    
    const tweetsData = await tweetsResponse.json()
    if (!tweetsData.data || tweetsData.data.length === 0) {
      console.log(`❌ No tweets found for @${username}`)
      return []
    }
    
    // Format tweets to match our interface
    const formattedTweets: Tweet[] = tweetsData.data.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at || new Date().toISOString(),
      retweet_count: tweet.public_metrics?.retweet_count || 0,
      like_count: tweet.public_metrics?.like_count || 0,
      reply_count: tweet.public_metrics?.reply_count || 0,
      url: `https://x.com/${username}/status/${tweet.id}`
    }))
    
    console.log(`✅ Twitter API returned ${formattedTweets.length} real tweets`)
    return formattedTweets
    
  } catch (error) {
    console.error('❌ Twitter API error:', error)
    throw error
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const username = 'usedoppai' // Fixed username for doppai tweets
    const forceFresh = request.nextUrl.searchParams.get('force') === 'true'
    
    // Always fetch fresh tweet - no caching for now
    console.log('🔄 Force refresh requested, skipping cache...')
    
    // Clear any existing cache
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE)
      console.log('🗑️ Cleared old cache')
    }
    
    // Cache miss or expired - fetch fresh data
    try {
      const freshTweets = await fetchFreshTweet(username)
      
      // Cache the fresh data
      writeCache(freshTweets, username)
      
      return NextResponse.json({
        success: true,
        tweets: freshTweets,
        source: 'fresh_api',
        cached: false,
        timestamp: Date.now()
      })
      
    } catch (fetchError) {
      console.error('Failed to fetch fresh tweet:', fetchError)
      
      // Return a fallback message instead of mock data
      const fallbackTweets = [{
        id: 'fallback',
        text: 'Follow us @usedoppai for the latest updates on DoppAI! Building the future of AI agents that embody how we think, express and connect. 🤖✨',
        created_at: new Date().toISOString(),
        retweet_count: 0,
        like_count: 0,
        reply_count: 0,
        url: 'https://x.com/usedoppai'
      }]
      
      // Cache the fallback
      writeCache(fallbackTweets, username)
      
      return NextResponse.json({
        success: true,
        tweets: fallbackTweets,
        source: 'fallback_tweet',
        cached: false,
        timestamp: Date.now()
      })
    }
    
  } catch (error) {
    console.error('Cached tweets API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get cached tweets',
        tweets: []
      },
      { status: 500 }
    )
  }
}
