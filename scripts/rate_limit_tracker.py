#!/usr/bin/env python3
"""
Rate limit tracker for Twitter API
Helps avoid hitting rate limits by tracking requests
"""

import json
import time
import os

RATE_LIMIT_FILE = "twitter_rate_limits.json"

def load_rate_limits():
    """Load rate limit data from file"""
    try:
        if os.path.exists(RATE_LIMIT_FILE):
            with open(RATE_LIMIT_FILE, 'r') as f:
                data = json.load(f)
                return data
        return {"requests": [], "last_reset": time.time()}
    except:
        return {"requests": [], "last_reset": time.time()}

def save_rate_limits(data):
    """Save rate limit data to file"""
    try:
        with open(RATE_LIMIT_FILE, 'w') as f:
            json.dump(data, f)
    except:
        pass

def can_make_request():
    """Check if we can make a request without hitting rate limit"""
    data = load_rate_limits()
    current_time = time.time()
    
    # Reset every 15 minutes (900 seconds)
    if current_time - data["last_reset"] > 900:
        data = {"requests": [], "last_reset": current_time}
        save_rate_limits(data)
        return True, 0
    
    # Remove requests older than 15 minutes
    data["requests"] = [req for req in data["requests"] if current_time - req < 900]
    
    # Twitter API v2 allows 300 requests per 15 minutes for user lookup
    # Let's be conservative and use 250
    if len(data["requests"]) >= 250:
        # Calculate time until next reset
        wait_time = 900 - (current_time - data["last_reset"])
        return False, wait_time
    
    return True, 0

def record_request():
    """Record that we made a request"""
    data = load_rate_limits()
    current_time = time.time()
    data["requests"].append(current_time)
    save_rate_limits(data)

if __name__ == "__main__":
    can_request, wait_time = can_make_request()
    print(f"Can make request: {can_request}")
    if not can_request:
        print(f"Wait time: {wait_time} seconds")
