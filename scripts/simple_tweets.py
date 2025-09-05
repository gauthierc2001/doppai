#!/usr/bin/env python3
"""
Simple Tweet Generator
Generates realistic tweets without external scraping
Perfect for testing personality analysis
"""

import json
import sys
import random
import time
from datetime import datetime, timedelta

def generate_realistic_tweets(username, count=50):
    """
    Generate realistic tweets based on username patterns
    """
    username = username.replace('@', '').lower()
    
    # Comprehensive personality-specific templates
    tweet_templates = {
        'elonmusk': [
            "Mars is the future! 🚀",
            "Just shipped another update to improve X",
            "The future of sustainable transport is here",
            "AI will change everything. We must ensure it benefits humanity.",
            "Building the future, one rocket at a time",
            "Dogecoin to the moon! 🐕",
            "When will we have flying cars? Soon.",
            "Neuralink progress update: incredible results",
            "Tesla production hitting new records",
            "X is becoming the everything app",
            "Starship update: getting closer to Mars",
            "Cybertruck deliveries ramping up",
            "Free speech is the bedrock of democracy",
            "Grok is getting smarter every day",
            "Falcon Heavy launch was epic 🔥",
            "Working 16 hours a day to make life multiplanetary",
            "The Boring Company will solve traffic",
            "Solar panels + Powerwall = energy independence",
            "FSD Beta is improving rapidly",
            "Twitter files revealed a lot"
        ],
        'sundarpichai': [
            "Excited about the potential of AI to solve global challenges",
            "Our commitment to responsible AI development continues",
            "Democratizing access to technology for everyone",
            "The next billion users will shape the internet's future",
            "Proud of our teams working on breakthrough research",
            "Google Search continues to evolve with AI",
            "Climate change requires technology solutions",
            "Diversity and inclusion drive innovation",
            "Quantum computing breakthroughs ahead",
            "Making information universally accessible",
            "Bard is helping millions of users worldwide",
            "Privacy and security remain our top priorities",
            "AI safety research is crucial for the future",
            "Cloud computing democratizes AI access",
            "Education technology can transform learning",
            "Sustainability goals drive our innovation",
            "Digital transformation accelerating globally",
            "Open source AI benefits everyone",
            "Collaboration between humans and AI",
            "The future of work is changing with AI"
        ],
        'tim_cook': [
            "Privacy is a fundamental human right",
            "We're committed to leaving the world better than we found it",
            "Innovation distinguishes between a leader and a follower",
            "Technology should serve humanity, not the other way around",
            "Proud of our team's dedication to excellence",
            "Apple's values guide everything we do",
            "Accessibility is not just about compliance, it's about human dignity",
            "The App Store has transformed how we discover software",
            "Climate action is urgent and necessary",
            "Education empowers the next generation",
            "iPhone continues to set the standard for smartphones",
            "Services revenue reaching new heights",
            "Apple Silicon is revolutionizing computing",
            "Health technologies can save lives",
            "Retail stores create magical customer experiences",
            "Supply chain innovation during challenging times",
            "Diversity makes our teams stronger",
            "Customer satisfaction is our north star",
            "Apple Watch is the world's most popular watch",
            "Vision Pro opens new possibilities"
        ],
        'oprah': [
            "Every day is a new opportunity to become who you're meant to be! ✨",
            "Gratitude turns what we have into enough. What are you grateful for?",
            "Your greatest gift is your intuition. Trust it.",
            "When you know better, you do better. Always growing.",
            "The biggest adventure is living the life of your dreams.",
            "What I know for sure: we all want to be heard",
            "Failure is just life trying to teach you lessons",
            "The greatest discovery is that you can change",
            "Live your best life every single day",
            "Love is the bridge between two hearts",
            "Books have the power to transform lives",
            "Weight Watchers taught me about balance",
            "The power of intention changes everything",
            "Meditation brings clarity to chaos",
            "Everyone has a story worth telling",
            "Kindness is always the right choice",
            "Your purpose will find you when you're ready",
            "Celebrate the small victories every day",
            "Authenticity is magnetic",
            "Hope is the thing with feathers"
        ]
    }
    
    # Get templates for this user or use generic tech-focused ones
    templates = tweet_templates.get(username, [
        "Just had an amazing conversation about AI and the future",
        "Building something exciting today 🚀",
        "Coffee and code - perfect combination for productivity",
        "The future is here and it's more incredible than we imagined",
        "Sometimes the best ideas come from unexpected places",
        "Innovation happens when curiosity meets opportunity",
        "Today's challenges are tomorrow's breakthroughs",
        "Technology should make life better for everyone",
        "Excited to see what we'll accomplish next quarter",
        "The possibilities are endless when great minds collaborate",
        "Debugging this complex issue but making progress",
        "Open source community continues to amaze me",
        "Data shows users love the new features we shipped",
        "Team meeting generated some brilliant insights",
        "Grateful for the opportunity to work on cutting-edge tech",
        "User feedback is gold for product development",
        "Scaling systems to handle millions of requests",
        "Code review caught some potential security issues",
        "Machine learning models improving daily",
        "Proud of the diverse talent on our engineering team"
    ])
    
    tweets = []
    for i in range(count):
        # Pick a random template
        template = random.choice(templates)
        
        # Add realistic variations
        variations = [
            template,
            f"{template} 💯",
            f"{template} What do you think?",
            f"Just thinking: {template}",
            f"{template} #innovation",
            f"{template} 🔥",
            f"{template} Thoughts?",
            f"Hot take: {template}",
            f"{template} Anyone else agree?",
            f"{template} Let me know your thoughts!"
        ]
        
        text = random.choice(variations)
        
        # Generate realistic timestamps (last 30 days)
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        
        timestamp = datetime.now() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        # Create realistic engagement metrics
        base_likes = random.randint(50, 500)
        if username in ['elonmusk', 'tim_cook', 'oprah']:
            base_likes *= random.randint(100, 1000)  # High-profile accounts get more engagement
        
        # Ensure minimum values to avoid randint errors
        retweet_max = max(15, base_likes // 10)
        reply_max = max(10, base_likes // 20)
        quote_max = max(5, base_likes // 50)
        
        tweet = {
            "id": f"tweet_{username}_{i}_{int(time.time())}_{random.randint(1000, 9999)}",
            "text": text,
            "created_at": timestamp.isoformat(),
            "date": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "retweet_count": random.randint(1, retweet_max),
            "like_count": base_likes,
            "reply_count": random.randint(0, reply_max),
            "quote_count": random.randint(0, quote_max),
            "url": f"https://twitter.com/{username}/status/{random.randint(1000000000000000000, 9999999999999999999)}"
        }
        
        tweets.append(tweet)
    
    return tweets

def scrape_user_tweets(username, max_tweets=50):
    """
    Main function that generates realistic tweets
    """
    try:
        username = username.replace('@', '').lower()
        print(f"🔍 Generating {max_tweets} realistic tweets for @{username}...", file=sys.stderr)
        
        tweets = generate_realistic_tweets(username, max_tweets)
        
        print(f"✅ Generated {len(tweets)} realistic tweets for @{username}", file=sys.stderr)
        
        # Show sample tweets
        print("📝 Sample tweets:", file=sys.stderr)
        for i, tweet in enumerate(tweets[:5]):
            print(f"{i+1}. {tweet['text']}", file=sys.stderr)
        
        return {
            "success": True,
            "tweets": tweets,
            "username": username,
            "count": len(tweets),
            "source": "realistic_generator",
            "note": f"Generated realistic tweets based on {username}'s typical style"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "tweets": [],
            "username": username,
            "source": "error"
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python simple_tweets.py <username> [max_tweets]",
            "success": False
        }))
        sys.exit(1)
    
    username = sys.argv[1]
    max_tweets = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    
    result = scrape_user_tweets(username, max_tweets)
    print(json.dumps(result, ensure_ascii=True, indent=2))

if __name__ == "__main__":
    main()
