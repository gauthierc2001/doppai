import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex justify-center">
      <Image
        src="/doppaitransp.png"
        alt="Dopp AI Logo"
        width={400}
        height={200}
        className="max-w-full h-auto"
        priority
      />
    </div>
  )
} 