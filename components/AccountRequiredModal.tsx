'use client'

import Link from 'next/link'

interface AccountRequiredModalProps {
  service: 'suno' | 'elevenlabs' | 'higgsfield'
  onDismiss?: () => void
}

const SERVICE_INFO = {
  suno: {
    name: 'Suno.ai',
    description: 'AI Song Generation',
    affiliateLink: 'https://suno.ai?ref=ashiakeyzstudios',
  },
  elevenlabs: {
    name: 'ElevenLabs',
    description: 'AI Voiceover Generation',
    affiliateLink: 'https://elevenlabs.io?ref=ashiakeyzstudios',
  },
  higgsfield: {
    name: 'HiggsField',
    description: 'AI Video Generation',
    affiliateLink: 'https://higgsfield.ai?ref=ashiakeyzstudios',
  },
}

export function AccountRequiredModal({ service, onDismiss }: AccountRequiredModalProps) {
  const info = SERVICE_INFO[service]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-akfu-dark border-2 border-akfu-cyan rounded-lg p-8 max-w-md mx-4">
        <h3 className="text-2xl font-bold text-akfu-cyan mb-2">{info.name} Account Required</h3>
        <p className="text-gray-400 mb-6">{info.description}</p>

        <p className="text-gray-300 mb-6">
          To use this feature, you need to:
        </p>

        <ol className="space-y-3 mb-8 text-gray-300 text-sm">
          <li className="flex gap-3">
            <span className="bg-akfu-cyan text-akfu-dark rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
            <span>Sign up for {info.name} using the affiliate link</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-akfu-cyan text-akfu-dark rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
            <span>Get your API key from their dashboard</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-akfu-cyan text-akfu-dark rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
            <span>Paste it in your AKFU Settings</span>
          </li>
        </ol>

        <div className="flex flex-col gap-3">
          <a
            href={info.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-3 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded hover:shadow-lg hover:shadow-akfu-cyan/50 transition text-center"
          >
            Sign Up (Your Affiliate Link) →
          </a>
          <Link
            href="/settings"
            className="w-full px-4 py-3 bg-akfu-purple border border-akfu-cyan text-akfu-cyan font-bold rounded hover:bg-akfu-cyan hover:text-akfu-dark transition text-center"
          >
            Go to Settings
          </Link>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full px-4 py-2 text-gray-400 hover:text-gray-300 transition"
            >
              Close
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          💡 Using our affiliate link helps support AKFU and gives you the best experience
        </p>
      </div>
    </div>
  )
}
