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
    const { spawn } = require('child_process')
    const path = require('path')
    
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(process.cwd(), 'scripts', 'twitter_api_simple.py')
      const pythonProcess = spawn('python', [pythonScript, username, '1']) // Get only the latest tweet
      
      let stdout = ''
      let stderr = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
        console.log('🐍 Twitter API:', data.toString().trim())
      })
      
      pythonProcess.on('close', (code: number) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout)
            if (result.success && result.tweets && result.tweets.length > 0) {
              console.log(`✅ Twitter API returned ${result.tweets.length} real tweets`)
              
              // Format tweets to match our interface
              const formattedTweets: Tweet[] = result.tweets.map((tweet: any) => ({
                id: tweet.id,
                text: tweet.text,
                created_at: tweet.created_at || new Date().toISOString(),
                retweet_count: tweet.retweet_count || 0,
                like_count: tweet.like_count || 0,
                reply_count: tweet.reply_count || 0,
                url: tweet.url || `https://x.com/${username}/status/${tweet.id}`
              }))
              
              resolve(formattedTweets)
            } else {
              console.log(`❌ Twitter API failed: ${result.error}`)
              reject(new Error(result.error || 'Failed to fetch tweets'))
            }
          } catch (parseError) {
            console.error('❌ Failed to parse Twitter API output:', parseError)
            reject(parseError)
          }
        } else {
          console.error(`❌ Twitter API process exited with code ${code}`)
          console.error('Twitter API stderr:', stderr)
          reject(new Error(`Twitter API process failed with code ${code}`))
        }
      })
      
      pythonProcess.on('error', (error: Error) => {
        console.error('❌ Failed to start Twitter API process:', error)
        reject(error)
      })
      
      // 30 second timeout
      setTimeout(() => {
        pythonProcess.kill()
        console.log('❌ Twitter API timed out')
        reject(new Error('Twitter API request timed out'))
      }, 30000)
    })
    
  } catch (error) {
    console.error('❌ Error setting up Twitter API call:', error)
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
