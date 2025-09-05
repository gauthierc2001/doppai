#!/usr/bin/env python3
"""
Real Twitter Scraper
Gets actual tweets for personality analysis
Uses multiple methods to scrape real data
"""

import json
import sys
import requests
import re
from datetime import datetime
import time

def scrape_with_syndication_api(username, max_tweets=50):
    """
    Use Twitter's public syndication API (no auth required)
    """
    try:
        print(f"🔍 Trying Twitter Syndication API for @{username}...", file=sys.stderr)
        
        # Twitter's public syndication endpoint
        url = f"https://syndication.twitter.com/srv/timeline-profile/screen-name/{username}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://platform.twitter.com/',
        }
        
        params = {
            'limit': min(max_tweets, 20),  # API limit
            'showReplies': 'false',
            'showRetweets': 'false'
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'body' in data and 'children' in data['body']:
                tweets = []
                
                for item in data['body']['children']:
                    if 'tweet' in item:
                        tweet_data = item['tweet']
                        
                        tweet = {
                            "id": str(tweet_data.get('id_str', '')),
                            "text": tweet_data.get('text', ''),
                            "created_at": tweet_data.get('created_at', ''),
                            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "retweet_count": tweet_data.get('retweet_count', 0),
                            "like_count": tweet_data.get('favorite_count', 0),
                            "reply_count": tweet_data.get('reply_count', 0),
                            "quote_count": tweet_data.get('quote_count', 0),
                            "url": f"https://twitter.com/{username}/status/{tweet_data.get('id_str', '')}"
                        }
                        
                        if tweet['text'] and len(tweet['text']) > 10:
                            tweets.append(tweet)
                
                if tweets:
                    print(f"✅ Syndication API: Got {len(tweets)} real tweets", file=sys.stderr)
                    return tweets
        
        print(f"❌ Syndication API failed for @{username}", file=sys.stderr)
        return []
        
    except Exception as e:
        print(f"❌ Syndication API error: {str(e)}", file=sys.stderr)
        return []

def scrape_with_guest_token(username, max_tweets=50):
    """
    Use Twitter's guest token approach
    """
    try:
        print(f"🔍 Trying Guest Token method for @{username}...", file=sys.stderr)
        
        # Get guest token
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'
        })
        
        # Activate guest token
        activate_response = session.post(
            'https://api.twitter.com/1.1/guest/activate.json',
            timeout=10
        )
        
        if activate_response.status_code == 200:
            guest_token = activate_response.json().get('guest_token')
            session.headers['x-guest-token'] = guest_token
            
            # Search for user's tweets
            search_url = 'https://api.twitter.com/1.1/search/tweets.json'
            params = {
                'q': f'from:{username}',
                'result_type': 'recent',
                'count': min(max_tweets, 100),
                'include_entities': 'false',
                'tweet_mode': 'extended'
            }
            
            search_response = session.get(search_url, params=params, timeout=10)
            
            if search_response.status_code == 200:
                data = search_response.json()
                tweets = []
                
                for tweet_data in data.get('statuses', []):
                    tweet = {
                        "id": str(tweet_data.get('id_str', '')),
                        "text": tweet_data.get('full_text', tweet_data.get('text', '')),
                        "created_at": tweet_data.get('created_at', ''),
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "retweet_count": tweet_data.get('retweet_count', 0),
                        "like_count": tweet_data.get('favorite_count', 0),
                        "reply_count": 0,
                        "quote_count": tweet_data.get('quote_count', 0),
                        "url": f"https://twitter.com/{username}/status/{tweet_data.get('id_str', '')}"
                    }
                    
                    if tweet['text'] and len(tweet['text']) > 10:
                        tweets.append(tweet)
                
                if tweets:
                    print(f"✅ Guest Token: Got {len(tweets)} real tweets", file=sys.stderr)
                    return tweets
        
        print(f"❌ Guest Token method failed for @{username}", file=sys.stderr)
        return []
        
    except Exception as e:
        print(f"❌ Guest Token error: {str(e)}", file=sys.stderr)
        return []

def scrape_with_nitter_instances(username, max_tweets=50):
    """
    Try multiple Nitter instances for real tweet scraping
    """
    nitter_instances = [
        'nitter.poast.org',
        'nitter.privacydev.net', 
        'nitter.cz',
        'nitter.ktachibana.party',
        'nitter.fdn.fr'
    ]
    
    for instance in nitter_instances:
        try:
            print(f"🌐 Trying Nitter instance: {instance}", file=sys.stderr)
            
            url = f"https://{instance}/{username}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200 and len(response.content) > 5000:
                # Use BeautifulSoup to extract tweets
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for tweet containers
                tweet_containers = soup.find_all(['div'], class_=lambda x: x and 'tweet' in x.lower())
                
                tweets = []
                for container in tweet_containers[:max_tweets]:
                    # Extract tweet text
                    text_elem = container.find(['div', 'p'], class_=lambda x: x and 'tweet' in x.lower() and 'content' in x.lower())
                    if not text_elem:
                        text_elem = container.find(['div', 'p'])
                    
                    if text_elem:
                        text = text_elem.get_text(strip=True)
                        if text and len(text) > 10 and not text.startswith('RT @'):
                            tweet = {
                                "id": f"nitter_{instance}_{len(tweets)}",
                                "text": text,
                                "created_at": datetime.now().isoformat(),
                                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                "retweet_count": 0,
                                "like_count": 0,
                                "reply_count": 0,
                                "quote_count": 0,
                                "url": f"https://twitter.com/{username}/status/unknown"
                            }
                            tweets.append(tweet)
                
                if tweets:
                    print(f"✅ Nitter {instance}: Got {len(tweets)} real tweets", file=sys.stderr)
                    return tweets
            else:
                print(f"❌ {instance} returned {response.status_code} or insufficient content", file=sys.stderr)
                
        except Exception as e:
            print(f"❌ {instance} failed: {str(e)}", file=sys.stderr)
            continue
    
    return []

def scrape_user_tweets(username, max_tweets=50):
    """
    Try multiple real scraping methods
    """
    try:
        username = username.replace('@', '').lower()
        print(f"🔍 Scraping REAL tweets from @{username} for personality analysis...", file=sys.stderr)
        
        # Method 1: Syndication API
        tweets = scrape_with_syndication_api(username, max_tweets)
        if tweets:
            return format_result(tweets, username, 'syndication_api')
        
        # Method 2: Guest Token
        tweets = scrape_with_guest_token(username, max_tweets)
        if tweets:
            return format_result(tweets, username, 'guest_token')
        
        # Method 3: Nitter instances
        tweets = scrape_with_nitter_instances(username, max_tweets)
        if tweets:
            return format_result(tweets, username, 'nitter_scraping')
        
        # If all methods fail
        print(f"❌ All real scraping methods failed for @{username}", file=sys.stderr)
        return {
            "success": False,
            "error": "Could not scrape real tweets. User may not exist or all methods are currently blocked.",
            "tweets": [],
            "username": username,
            "source": "failed"
        }
        
    except Exception as e:
        print(f"❌ General error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "tweets": [],
            "username": username,
            "source": "error"
        }

def format_result(tweets, username, source):
    """
    Format the successful result
    """
    print(f"✅ Successfully scraped {len(tweets)} REAL tweets from @{username}", file=sys.stderr)
    
    # Show sample tweets
    print("📝 Sample REAL tweets:", file=sys.stderr)
    for i, tweet in enumerate(tweets[:3]):
        clean_text = tweet['text'].encode('ascii', 'ignore').decode('ascii')
        print(f"{i+1}. {clean_text[:100]}...", file=sys.stderr)
    
    return {
        "success": True,
        "tweets": tweets,
        "username": username,
        "count": len(tweets),
        "source": source,
        "note": f"Real tweets scraped from @{username} for personality analysis"
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python real_tweet_scraper.py <username> [max_tweets]",
            "success": False
        }))
        sys.exit(1)
    
    username = sys.argv[1]
    max_tweets = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    
    result = scrape_user_tweets(username, max_tweets)
    print(json.dumps(result, ensure_ascii=True, indent=2))

if __name__ == "__main__":
    main()
