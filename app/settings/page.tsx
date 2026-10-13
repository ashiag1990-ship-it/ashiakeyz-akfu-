'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { useProject } from '@/store/useProject'
import { apiCall } from '@/lib/api'

interface Integrations {
  suno_api_key?: string
  elevenlabs_api_key?: string
  higgsfield_account?: string
  instagram_handle?: string
  tiktok_handle?: string
  youtube_handle?: string
}

const AFFILIATE_LINKS = {
  suno: 'https://suno.ai?ref=ashiakeyzstudios',
  elevenlabs: 'https://elevenlabs.io?ref=ashiakeyzstudios',
  higgsfield: 'https://higgsfield.ai?ref=ashiakeyzstudios',
}

export default function SettingsPage() {
  const { currentProject } = useProject()
  const [integrations, setIntegrations] = useState<Integrations>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!currentProject?.id) return

    const loadIntegrations = async () => {
      try {
        const data = await apiCall(`/api/integrations/${currentProject.id}`)
        setIntegrations(data || {})
      } catch (err) {
        console.error('Failed to load integrations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadIntegrations()
  }, [currentProject?.id])

  const handleSave = async () => {
    if (!currentProject?.id) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await apiCall('/api/integrations/save', {
        method: 'POST',
        body: JSON.stringify({
          project_id: currentProject.id,
          ...integrations,
        }),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save integrations')
    } finally {
      setSaving(false)
    }
  }

  const handleTestService = async (service: string, apiKey: string) => {
    try {
      await apiCall(`/api/integrations/test/${service}`, {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      })
      alert(`✅ ${service} account connected successfully!`)
    } catch (err) {
      alert(`❌ Failed to connect ${service}. Check your API key.`)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen bg-akfu-dark flex items-center justify-center">
            <div className="text-gray-400">Loading settings...</div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-akfu-dark">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-bold mb-2 text-gradient">Settings</h1>
            <p className="text-gray-400 mb-12">Link your accounts to unlock all features</p>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded text-green-400 text-sm">
                ✅ Settings saved successfully!
              </div>
            )}

            {/* AI Services Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-akfu-cyan mb-6">AI Services</h2>

              {/* Suno */}
              <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Suno.ai</h3>
                    <p className="text-gray-400 text-sm">AI Song Generation</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    integrations.suno_api_key
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {integrations.suno_api_key ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <input
                  type="password"
                  placeholder="Paste your Suno API Key"
                  value={integrations.suno_api_key || ''}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, suno_api_key: e.target.value })
                  }
                  className="input-field w-full mb-3"
                />

                <div className="flex gap-3">
                  <a
                    href={AFFILIATE_LINKS.suno}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-akfu-cyan text-akfu-dark font-bold rounded hover:bg-akfu-gold transition text-center text-sm"
                  >
                    Sign Up (Affiliate Link)
                  </a>
                  {integrations.suno_api_key && (
                    <button
                      onClick={() => handleTestService('suno', integrations.suno_api_key!)}
                      className="px-4 py-2 bg-akfu-purple border border-akfu-cyan text-akfu-cyan font-bold rounded hover:bg-akfu-cyan hover:text-akfu-dark transition text-sm"
                    >
                      Test Connection
                    </button>
                  )}
                </div>
              </div>

              {/* ElevenLabs */}
              <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">ElevenLabs</h3>
                    <p className="text-gray-400 text-sm">AI Voiceover Generation</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    integrations.elevenlabs_api_key
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {integrations.elevenlabs_api_key ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <input
                  type="password"
                  placeholder="Paste your ElevenLabs API Key"
                  value={integrations.elevenlabs_api_key || ''}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, elevenlabs_api_key: e.target.value })
                  }
                  className="input-field w-full mb-3"
                />

                <div className="flex gap-3">
                  <a
                    href={AFFILIATE_LINKS.elevenlabs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-akfu-cyan text-akfu-dark font-bold rounded hover:bg-akfu-gold transition text-center text-sm"
                  >
                    Sign Up (Affiliate Link)
                  </a>
                  {integrations.elevenlabs_api_key && (
                    <button
                      onClick={() => handleTestService('elevenlabs', integrations.elevenlabs_api_key!)}
                      className="px-4 py-2 bg-akfu-purple border border-akfu-cyan text-akfu-cyan font-bold rounded hover:bg-akfu-cyan hover:text-akfu-dark transition text-sm"
                    >
                      Test Connection
                    </button>
                  )}
                </div>
              </div>

              {/* HiggsField */}
              <div className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">HiggsField</h3>
                    <p className="text-gray-400 text-sm">AI Video Generation</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    integrations.higgsfield_account
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {integrations.higgsfield_account ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Your HiggsField Account ID or Email"
                  value={integrations.higgsfield_account || ''}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, higgsfield_account: e.target.value })
                  }
                  className="input-field w-full mb-3"
                />

                <div className="flex gap-3">
                  <a
                    href={AFFILIATE_LINKS.higgsfield}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-akfu-cyan text-akfu-dark font-bold rounded hover:bg-akfu-gold transition text-center text-sm"
                  >
                    Sign Up (Affiliate Link)
                  </a>
                  {integrations.higgsfield_account && (
                    <button
                      onClick={() => handleTestService('higgsfield', integrations.higgsfield_account!)}
                      className="px-4 py-2 bg-akfu-purple border border-akfu-cyan text-akfu-cyan font-bold rounded hover:bg-akfu-cyan hover:text-akfu-dark transition text-sm"
                    >
                      Test Connection
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Social Media Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-akfu-cyan mb-6">Social Media (Auto-Post)</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: 'instagram_handle', label: 'Instagram Handle', placeholder: '@yourhandle' },
                  { key: 'tiktok_handle', label: 'TikTok Handle', placeholder: '@yourhandle' },
                  { key: 'youtube_handle', label: 'YouTube Handle', placeholder: '@yourchannel' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="bg-akfu-purple/50 border border-akfu-purple rounded-lg p-4">
                    <label className="block text-sm font-bold text-gray-300 mb-2">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={integrations[key as keyof Integrations] || ''}
                      onChange={(e) =>
                        setIntegrations({ ...integrations, [key]: e.target.value })
                      }
                      className="input-field w-full text-sm"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-akfu-cyan to-akfu-gold text-akfu-dark font-bold rounded hover:shadow-lg hover:shadow-akfu-cyan/50 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-12 p-6 bg-akfu-purple/20 border border-akfu-purple rounded-lg">
              <h3 className="text-akfu-gold font-bold mb-2">🔒 Your API Keys Are Encrypted</h3>
              <p className="text-gray-400 text-sm">
                All API keys are encrypted and stored securely on our servers. We never share your keys with anyone.
                Each student uses their own account credentials for billing and account management.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
