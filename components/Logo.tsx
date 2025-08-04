import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex justify-center">
      <Image
        src="/public/doppaitransp.png"
        alt="DoppAI Logo"
        width={400}
        height={200}
        className="max-w-full h-auto"
        priority
      />
    </div>
  )
} 