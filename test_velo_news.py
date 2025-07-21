import asyncio
import json
import os
from velodata import lib as velo

# Get API key from environment
api_key = os.environ.get('VELO_API_KEY')
if not api_key:
    print("ERROR: VELO_API_KEY not found in environment variables")
    exit(1)

print(f"Using Velo API key: {api_key[:10]}..." if len(api_key) > 10 else api_key)

# new velo client
client = velo.client(api_key)

print("\n=== Testing Velo News API ===\n")

# get past stories
print("1. Fetching past news stories...")
try:
    news = client.news.get_news()
    print(f"Success! Retrieved {len(news)} news items")
    if news:
        print("\nFirst news item:")
        print(json.dumps(news[0], indent=2))
except Exception as e:
    print(f"ERROR fetching news: {type(e).__name__}: {e}")
    print(f"Full error details: {e}")

# stream new stories
print("\n2. Testing news stream (will run for 10 seconds)...")
async def stream():
    timeout = 10  # seconds
    start_time = asyncio.get_event_loop().time()
    
    try:
        async for message in client.news.stream_news():
            elapsed = asyncio.get_event_loop().time() - start_time
            
            if elapsed > timeout:
                print(f"\nStream test completed after {timeout} seconds")
                break
                
            if message in ('connected', 'heartbeat', 'closed'):
                print(f"[{elapsed:.1f}s] Stream status: {message}")
            else:
                print(f"[{elapsed:.1f}s] News item received:")
                print(json.dumps(json.loads(message), indent=2))
    except Exception as e:
        print(f"ERROR in stream: {type(e).__name__}: {e}")
        print(f"Full error details: {e}")

try:
    asyncio.run(stream())
except KeyboardInterrupt:
    print("\nStream interrupted by user")
except Exception as e:
    print(f"ERROR running stream: {type(e).__name__}: {e}")

print("\n=== Test completed ===")