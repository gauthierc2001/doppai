#!/usr/bin/env python3
"""
Twitter API v2 Bearer Token Method
Uses Bearer Token for authentication to fetch real tweets
"""

import json
import sys
import requests
from datetime import datetime
import os
import time

# Import rate limiting
try:
    from rate_limit_tracker import can_make_request, record_request
except ImportError:
    def can_make_request():
        return True, 0
    def record_request():
        pass

def get_user_tweets(username, bearer_token, max_tweets):
    """
    Get user tweets using Twitter API v2 with Bearer Token
    """
    try:
        print(f"🔍 Getting tweets for @{username} using Twitter API v2...", file=sys.stderr)
        
        # Use Bearer Token for Twitter API v2
        headers = {"Authorization": f"Bearer {bearer_token}"}
        url = f"https://api.twitter.com/2/users/by/username/{username}"
        
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Bearer token response: {response.status_code}", file=sys.stderr)
        
        # Record this API call
        record_request()
        
        if response.status_code == 429:
            print("⏰ Rate limited! Twitter API allows 300 requests per 15 minutes.", file=sys.stderr)
            print("⏰ Waiting 15 minutes (900 seconds) before retry...", file=sys.stderr)
            time.sleep(900)
            
            # Retry once after waiting
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Bearer token retry response: {response.status_code}", file=sys.stderr)
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                user_id = data['data']['id']
                print(f"✅ Found user @{username} (ID: {user_id})", file=sys.stderr)
                
                # Get tweets
                tweets_url = f"https://api.twitter.com/2/users/{user_id}/tweets"
                params = {
                    "max_results": min(max_tweets, 10),
                    "tweet.fields": "created_at,public_metrics"
                }
                
                # Add small delay between API calls
                time.sleep(1)
                tweets_response = requests.get(tweets_url, headers=headers, params=params, timeout=10)
                
                # Record this API call too
                record_request()
                
                if tweets_response.status_code == 429:
                    print("⏰ Rate limited on tweets endpoint! Waiting 15 minutes (900 seconds)...", file=sys.stderr)
                    time.sleep(900)
                    tweets_response = requests.get(tweets_url, headers=headers, params=params, timeout=10)
                
                if tweets_response.status_code == 200:
                    tweets_data = tweets_response.json()
                    if 'data' in tweets_data:
                        tweets = []
                        for tweet in tweets_data['data']:
                            tweets.append({
                                "id": tweet['id'],
                                "text": tweet['text'],
                                "created_at": tweet.get('created_at', ''),
                                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                "retweet_count": tweet.get('public_metrics', {}).get('retweet_count', 0),
                                "like_count": tweet.get('public_metrics', {}).get('like_count', 0),
                                "reply_count": tweet.get('public_metrics', {}).get('reply_count', 0),
                                "quote_count": tweet.get('public_metrics', {}).get('quote_count', 0),
                                "url": f"https://twitter.com/i/web/status/{tweet['id']}"
                            })
                        return tweets
        
        return []
        
    except Exception as e:
        print(f"❌ Twitter API method failed: {str(e)}", file=sys.stderr)
        return []


def scrape_user_tweets(username, max_tweets=15):
    """
    Scrape user tweets using Twitter API v2 Bearer Token
    """
    try:
        # Check rate limits before making any requests
        can_request, wait_time = can_make_request()
        if not can_request:
            print(f"⏰ Rate limit reached! Need to wait {int(wait_time)} seconds", file=sys.stderr)
            return {
                "success": False,
                "error": f"Rate limited. Please wait {int(wait_time/60)} minutes before trying again.",
                "tweets": [],
                "username": username.replace('@', '').lower(),
                "source": "rate_limit_prevented"
            }
        
        # Try to get Bearer Token from environment variable first, fallback to hardcoded
        bearer_token = os.getenv('TWITTER_BEARER_TOKEN', "AAAAAAAAAAAAAAAAAAAAALNJfwEAAAAAm0aIfmDpV63anDHo%2FiJT%2FBnx0zs%3DApg1YFbpGF3ZiTnKVcNcaBx5M8KYDvdcXvNDHmRYKD5xgHkIRz")
        username = username.replace('@', '').lower()
        
        print(f"🔍 Scraping {max_tweets} REAL tweets from @{username} using Twitter API...", file=sys.stderr)
        
        # Get tweets using Bearer Token (rate limiting is handled inside)
        tweets = get_user_tweets(username, bearer_token, max_tweets)
        if tweets:
            return format_success(tweets, username, "bearer_token")
        
        # If Twitter API fails
        return {
            "success": False,
            "error": "Twitter API rate limited. Please wait 15 minutes before trying again, or the user may not exist.",
            "tweets": [],
            "username": username,
            "source": "twitter_api_rate_limited"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "tweets": [],
            "username": username,
            "source": "twitter_api"
        }

def format_success(tweets, username, method):
    """
    Format successful response
    """
    print(f"✅ Successfully got {len(tweets)} real tweets using {method}", file=sys.stderr)
    
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
        "source": f"twitter_api_{method}",
        "note": f"Real tweets from @{username} via Twitter API"
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python twitter_api_simple.py <username> [max_tweets]",
            "success": False
        }))
        sys.exit(1)
    
    username = sys.argv[1]
    max_tweets = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    
    result = scrape_user_tweets(username, max_tweets)
    print(json.dumps(result, ensure_ascii=True, indent=2))

if __name__ == "__main__":
    main()
