import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CACHE_FILE = path.join(process.cwd(), 'twitter-cache.json')

export async function POST(request: NextRequest) {
  try {
    // Delete cache file if it exists
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE)
      console.log('🗑️ Twitter cache cleared manually')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear cache'
      },
      { status: 500 }
    )
  }
}
