import { NextRequest, NextResponse } from 'next/server'
import { TwitterScraper } from '../../../../lib/providers'

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
