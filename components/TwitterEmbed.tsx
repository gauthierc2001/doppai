'use client'

import { useEffect } from 'react'

export default function TwitterEmbed() {
  useEffect(() => {
    // Load Twitter widgets script
    if (typeof window !== 'undefined' && (window as any).twttr) {
      (window as any).twttr.widgets.load()
    }
  }, [])

  return (
    <div className="text-center">
      <blockquote 
        className="twitter-tweet"
        data-theme="light"
      >
        <p lang="sv" dir="ltr">
          dopp<a href="https://t.co/11uITQrOhh">https://t.co/11uITQrOhh</a> <a href="https://t.co/lOgqOCyxAz">pic.twitter.com/lOgqOCyxAz</a>
        </p>
        &mdash; dopp (@usedoppai) <a href="https://twitter.com/usedoppai/status/1952330629791596972?ref_src=twsrc%5Etfw">August 4, 2025</a>
      </blockquote>
    </div>
  )
} 