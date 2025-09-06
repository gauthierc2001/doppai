import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
      
      const tweets = await this.scrapeWithTwitterAPI(cleanUsername, maxTweets)
      
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

  private async scrapeWithTwitterAPI(username: string, maxTweets: number): Promise<ScrapedTweet[]> {
    console.log(`🔗 Using Twitter API v2 for @${username}`)
    
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
        console.log("⏰ Rate limited! Twitter API allows 300 requests per 15 minutes.")
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
      
      // Step 2: Get tweets
      const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=${Math.min(maxTweets, 100)}&tweet.fields=created_at,public_metrics`, {
        headers: {
          "Authorization": `Bearer ${bearerToken}`
        }
      })
      
      if (tweetsResponse.status === 429) {
        console.log("⏰ Rate limited on tweets endpoint! Waiting 15 minutes...")
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
      
      // Format tweets
      const tweets: ScrapedTweet[] = tweetsData.data.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at || new Date().toISOString(),
        date: new Date().toISOString()
      }))
      
      console.log(`✅ Twitter API returned ${tweets.length} real tweets`)
      return tweets
      
    } catch (error) {
      console.error('❌ Twitter API error:', error)
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
