import { NextRequest, NextResponse } from 'next/server'

interface ScrapedTweet {
  id: string
  text: string
  created_at: string
  date: string
}

class TwitterScraper {
  async scrapeTweets(username: string, maxTweets: number = 15): Promise<ScrapedTweet[]> {
    console.log(`🔍 Scraping REAL tweets for @${username} (${maxTweets} tweets)`)
    
    try {
      const cleanUsername = username.replace('@', '').toLowerCase()
      
      const tweets = await this.scrapeWithSnscrape(cleanUsername, maxTweets)
      
      if (tweets.length > 0) {
        console.log(`✅ Successfully scraped ${tweets.length} REAL tweets`)
        
        console.log(`📋 All ${tweets.length} scraped tweets:`)
        tweets.forEach((tweet, index) => {
          console.log(`${index + 1}. "${tweet.text}"`)
        })
        
        return tweets
      }
      
      console.log(`❌ Real tweet scraping failed for @${cleanUsername}`)
      return []
      
    } catch (error) {
      console.error('❌ Scraping error:', error)
      return []
    }
  }

  private async scrapeWithSnscrape(username: string, maxTweets: number): Promise<ScrapedTweet[]> {
    console.log(`🐍 Running snscrape for @${username}`)
    
    try {
      const { spawn } = require('child_process')
      const path = require('path')
      
      return new Promise((resolve, reject) => {
        const pythonScript = path.join(process.cwd(), 'scripts', 'twitter_api_simple.py')
        const pythonProcess = spawn('python', [pythonScript, username, maxTweets.toString()])
        
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
              if (result.success && result.tweets) {
                console.log(`✅ Twitter API returned ${result.tweets.length} real tweets`)
                resolve(result.tweets)
              } else {
                console.log(`❌ Twitter API failed: ${result.error}`)
                
                if (result.source === 'twitter_api_rate_limited') {
                  console.log(`⏰ Rate limited - Twitter API allows 300 requests per 15 minutes`)
                  console.log(`⏰ Please wait 15 minutes before trying again`)
                }
                resolve([])
              }
            } catch (parseError) {
              console.error('❌ Failed to parse snscrape output:', parseError)
              resolve([])
            }
          } else {
            console.error(`❌ Twitter API process exited with code ${code}`)
            console.error('Twitter API stderr:', stderr)
            resolve([])
          }
        })
        
        pythonProcess.on('error', (error: Error) => {
          console.error('❌ Failed to start Twitter API process:', error)
          resolve([])
        })
        
        setTimeout(() => {
          pythonProcess.kill()
          console.log('❌ Twitter API timed out')
          resolve([])
        }, 30000)
      })
      
    } catch (error) {
      console.error('❌ Scraping setup error:', error)
      return []
    }
  }
  
  async closeBrowser(): Promise<void> {
    // No browser to close for API-based scraping
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const cleanUsername = username.replace('@', '').toLowerCase()
    console.log(`🚀 Scraping 15 tweets for @${cleanUsername} with API...`)

    try {
      // Only use Puppeteer scraping - most reliable method
      const scraper = new TwitterScraper()
      const scrapedTweets = await scraper.scrapeTweets(cleanUsername, 15) // Scrape 15 tweets for personality analysis
      await scraper.closeBrowser()

      if (scrapedTweets && scrapedTweets.length > 0) {
        console.log(`✅ Puppeteer scraped ${scrapedTweets.length} tweets`)
        
        // Show scraped tweets in console for debugging
        console.log('📝 SCRAPED TWEETS:')
        scrapedTweets.forEach((tweet, index) => {
          console.log(`${index + 1}. ${tweet.text}`)
        })
        
        return NextResponse.json({
          tweets: scrapedTweets,
          username: cleanUsername,
          source: 'puppeteer_scraper',
          message: `Successfully scraped ${scrapedTweets.length} real tweets`
        })
      }

    } catch (scrapingError) {
      console.error('❌ Puppeteer scraping failed:', scrapingError)
    }

    // If scraping fails, return error instead of mock data
    console.log(`❌ Failed to scrape tweets for @${cleanUsername}`)
    return NextResponse.json({
      error: 'Failed to scrape tweets. The user may not exist or Twitter may be blocking requests.',
      username: cleanUsername,
      source: 'error'
    }, { status: 404 })

  } catch (error) {
    console.error('❌ Tweet scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
