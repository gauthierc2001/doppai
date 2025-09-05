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
  console.log(`🔄 Fetching fresh tweet for @${username}...`)
  
  try {
    const { spawn } = require('child_process')
    const scriptPath = path.join(process.cwd(), 'scripts', 'twitter_api_simple.py')
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath, username, '1'])
      
      let stdout = ''
      let stderr = ''
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })
      
      pythonProcess.on('close', (code: number) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout)
            if (result.success && result.tweets && result.tweets.length > 0) {
              console.log(`✅ Fresh tweet fetched for @${username}`)
              resolve(result.tweets.slice(0, 1)) // Only return 1 tweet
            } else if (result.source === 'twitter_api_rate_limited') {
              console.log(`⚠️ API rate limited, no fallback`)
              // Return empty array - no mock data
              resolve([])
            } else {
              reject(new Error('No tweets found'))
            }
          } catch (parseError) {
            reject(new Error('Failed to parse API response'))
          }
        } else {
          reject(new Error(`API process failed with code ${code}`))
        }
      })
      
      pythonProcess.on('error', (error: Error) => {
        reject(error)
      })
      
      // Timeout after 30 seconds
      setTimeout(() => {
        pythonProcess.kill()
        reject(new Error('API request timed out'))
      }, 30000)
    })
    
  } catch (error) {
    console.error('Fresh tweet fetch error:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const username = 'usedoppai' // Fixed username for doppai tweets
    const url = new URL(request.url)
    const forceFresh = url.searchParams.get('force') === 'true'
    
    // Try to get cached data first (unless force refresh)
    if (!forceFresh) {
      const cachedData = readCache()
      if (cachedData && cachedData.tweets.length > 0) {
        // Don't return fallback tweets from cache - always try fresh if it's fallback
        if (cachedData.tweets[0].id !== 'fallback') {
          return NextResponse.json({
            success: true,
            tweets: cachedData.tweets,
            source: 'server_cache',
            cached: true,
            timestamp: cachedData.timestamp
          })
        } else {
          console.log('🔄 Found fallback in cache, attempting fresh fetch...')
        }
      }
    } else {
      console.log('🔄 Force refresh requested, skipping cache...')
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
      
      // No fallback - just return error
      return NextResponse.json({
        success: false,
        error: 'API temporarily unavailable',
        tweets: [],
        source: 'api_error',
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
