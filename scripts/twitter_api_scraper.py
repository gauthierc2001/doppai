#!/usr/bin/env python3
"""
Real Twitter API Scraper
Uses Twitter API v1.1 with OAuth 1.0a for real tweets
"""

import json
import sys
import requests
from datetime import datetime
import base64
import urllib.parse
import hmac
import hashlib
import secrets
import time
import os

def get_user_id(username, bearer_token):
    """
    Get user ID from username using Twitter API v2
    """
    try:
        url = f"https://api.twitter.com/2/users/by/username/{username}"
        headers = {
            "Authorization": f"Bearer {bearer_token}",
            "User-Agent": "v2UserLookupPython"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                user_id = data['data']['id']
                print(f"📝 Found user @{username} (ID: {user_id})", file=sys.stderr)
                return user_id
            else:
                print(f"❌ User @{username} not found", file=sys.stderr)
                return None
        else:
            print(f"❌ Twitter API error: {response.status_code} - {response.text}", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"❌ Error getting user ID: {str(e)}", file=sys.stderr)
        return None

def get_user_tweets(user_id, bearer_token, max_tweets=50):
    """
    Get user's tweets using Twitter API v2
    """
    try:
        url = f"https://api.twitter.com/2/users/{user_id}/tweets"
        
        headers = {
            "Authorization": f"Bearer {bearer_token}",
            "User-Agent": "v2UserTweetsPython"
        }
        
        params = {
            "max_results": min(max_tweets, 100),  # API limit is 100
            "tweet.fields": "created_at,public_metrics,text",
            "exclude": "retweets,replies"  # Only original tweets
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'data' in data:
                tweets = []
                
                for tweet_data in data['data']:
                    tweet = {
                        "id": tweet_data['id'],
                        "text": tweet_data['text'],
                        "created_at": tweet_data.get('created_at', datetime.now().isoformat()),
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "retweet_count": tweet_data.get('public_metrics', {}).get('retweet_count', 0),
                        "like_count": tweet_data.get('public_metrics', {}).get('like_count', 0),
                        "reply_count": tweet_data.get('public_metrics', {}).get('reply_count', 0),
                        "quote_count": tweet_data.get('public_metrics', {}).get('quote_count', 0),
                        "url": f"https://twitter.com/i/web/status/{tweet_data['id']}"
                    }
                    tweets.append(tweet)
                
                print(f"✅ Retrieved {len(tweets)} real tweets from Twitter API", file=sys.stderr)
                return tweets
            else:
                print("❌ No tweets found in API response", file=sys.stderr)
                return []
        else:
            print(f"❌ Twitter API error: {response.status_code} - {response.text}", file=sys.stderr)
            return []
            
    except Exception as e:
        print(f"❌ Error getting tweets: {str(e)}", file=sys.stderr)
        return []

def scrape_user_tweets(username, max_tweets=50):
    """
    Main function to scrape tweets using Twitter API v2
    """
    try:
        # Try to get Bearer Token from environment variable first, fallback to hardcoded
        bearer_token = os.getenv('TWITTER_BEARER_TOKEN', "AAAAAAAAAAAAAAAAAAAAALNJfwEAAAAAm0aIfmDpV63anDHo%2FiJT%2FBnx0zs%3DApg1YFbpGF3ZiTnKVcNcaBx5M8KYDvdcXvNDHmRYKD5xgHkIRz")
        
        username = username.replace('@', '').lower()
        print(f"🔍 Scraping {max_tweets} REAL tweets from @{username} using Twitter API...", file=sys.stderr)
        
        # Step 1: Get user ID
        user_id = get_user_id(username, bearer_token)
        if not user_id:
            return {
                "success": False,
                "error": f"Could not find user @{username}",
                "tweets": [],
                "username": username,
                "source": "twitter_api_v2"
            }
        
        # Step 2: Get user's tweets
        tweets = get_user_tweets(user_id, bearer_token, max_tweets)
        
        if tweets:
            # Show sample tweets for debugging
            print("📝 Sample REAL tweets:", file=sys.stderr)
            for i, tweet in enumerate(tweets[:3]):
                # Clean text for console output (remove problematic Unicode)
                clean_text = tweet['text'].encode('ascii', 'ignore').decode('ascii')
                print(f"{i+1}. {clean_text[:100]}...", file=sys.stderr)
            
            return {
                "success": True,
                "tweets": tweets,
                "username": username,
                "count": len(tweets),
                "source": "twitter_api_v2",
                "note": f"Real tweets from @{username} via Twitter API v2"
            }
        else:
            return {
                "success": False,
                "error": "No tweets found or API access denied",
                "tweets": [],
                "username": username,
                "source": "twitter_api_v2"
            }
            
    except Exception as e:
        print(f"❌ General error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "tweets": [],
            "username": username,
            "source": "twitter_api_v2"
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python twitter_api_scraper.py <username> [max_tweets]",
            "success": False
        }))
        sys.exit(1)
    
    username = sys.argv[1]
    max_tweets = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    
    result = scrape_user_tweets(username, max_tweets)
    
    # Output JSON with ASCII encoding to avoid Unicode errors
    print(json.dumps(result, ensure_ascii=True, indent=2))

if __name__ == "__main__":
    main()
