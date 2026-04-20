'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Key, CreditCard, CheckCircle, XCircle, Loader2,
  Eye, EyeOff, Save, Shield, Globe, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'plan', label: 'Plan', icon: CreditCard }
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['5 models', 'Default API key', 'Basic chat', '1GB context'],
    current: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$15/mo',
    features: ['All models', 'Own API keys', 'Priority access', 'Unlimited context', 'File uploads'],
    highlight: true
  },
  {
    id: 'team',
    name: 'Team',
    price: '$30/mo',
    features: ['Everything in Pro', 'Team workspace', 'Admin controls', 'SSO login', 'API access'],
    badge: 'Coming soon'
  }
]

interface UserData {
  name: string
  email: string
  plan: string
  api_key_openrouter?: string
  api_key_cerebras?: string
}

interface KeyStatus {
  openrouter: boolean | null
  cerebras: boolean | null
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') ?? 'profile')

  const [userData, setUserData] = useState<UserData | null>(null)
  const [name, setName] = useState('')

  const [orKey, setOrKey] = useState('')
  const [cerKey, setCerKey] = useState('')

  const [showOrKey, setShowOrKey] = useState(false)
  const [showCerKey, setShowCerKey] = useState(false)

  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState<Record<string, boolean>>({})
  const [keyStatus, setKeyStatus] = useState<KeyStatus>({
    openrouter: null,
    cerebras: null
  })

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(d => {
        setUserData(d)
        setName(d.name ?? '')
        setOrKey(d.api_key_openrouter ?? '')
        setCerKey(d.api_key_cerebras ?? '')
      })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    setSaving(false)
    if (res.ok) toast.success('Profile saved')
    else toast.error('Failed to save')
  }

  const saveApiKeys = async () => {
    setSaving(true)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key_openrouter: orKey, api_key_cerebras: cerKey })
    })
    setSaving(false)
    if (res.ok) toast.success('API keys saved')
    else toast.error('Failed to save')
  }

  const validateKey = async (provider: 'openrouter' | 'cerebras', key: string) => {
    if (!key) return
    setValidating(v => ({ ...v, [provider]: true }))

    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate-key', provider, apiKey: key })
    })

    const data = await res.json()
    setKeyStatus(s => ({ ...s, [provider]: data.valid }))
    setValidating(v => ({ ...v, [provider]: false }))

    toast(data.valid ? 'API key is valid ✅' : 'Invalid API key ❌', { icon: data.valid ? '✅' : '❌' })
  }

  const KeyInput = ({
    label, value, onChange, show, onToggle, provider, hint,
    placeholder = 'sk-...'
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    show: boolean
    onToggle: () => void
    provider: 'openrouter' | 'cerebras'
    hint: string
    placeholder?: string
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-field pr-10 font-mono text-xs"
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={() => validateKey(provider, value)}
          disabled={!value || validating[provider]}
          className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {validating[provider] ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : keyStatus[provider] === true ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          ) : keyStatus[provider] === false ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Shield className="w-3.5 h-3.5" />
          )}
          Test
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-1.5">{hint}</p>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* PROFILE */}
          {tab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Personal Info</h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00CDD9] to-[#009aa5] flex items-center justify-center text-white text-xl font-bold">
                    {name?.[0]?.toUpperCase() ?? userData?.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">{userData?.email}</p>
                    <span className="text-xs bg-[#e0fafb] text-[#00919b] px-2 py-0.5 rounded-full font-medium capitalize">
                      {userData?.plan ?? 'free'} plan
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Display name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                    <input type="email" value={userData?.email ?? ''} disabled className="input-field opacity-60 cursor-not-allowed" />
                  </div>

                  <button onClick={saveProfile} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* API KEYS */}
          {tab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-1">API Keys</h2>
                <p className="text-xs text-gray-400 mb-6">
                  Add your own API keys for better limits. We’ll choose the first available provider automatically.
                </p>

                <div className="space-y-5">
                  <KeyInput
                    label="OpenRouter API Key"
                    value={orKey}
                    onChange={setOrKey}
                    show={showOrKey}
                    onToggle={() => setShowOrKey(!showOrKey)}
                    provider="openrouter"
                    hint="Optional fallback provider"
                  />

                  <KeyInput
                    label="Cerebras API Key"
                    value={cerKey}
                    onChange={setCerKey}
                    show={showCerKey}
                    onToggle={() => setShowCerKey(!showCerKey)}
                    provider="cerebras"
                    hint="Use Cerebras for free/fast models (verify model ids in code)"
                    placeholder="YOUR_KEY"
                  />

                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      If no key is provided, the app may fall back to a shared default key (rate limits apply).
                    </p>
                  </div>

                  <button onClick={saveApiKeys} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save API keys
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00CDD9]" />
                  Live Model Import
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  This section is relevant only for OpenRouter-based models.
                </p>
              </div>
            </motion.div>
          )}

          {/* PLAN */}
          {tab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <p className="text-xs text-gray-400">Plans unlock more features and higher limits.</p>
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={cn(
                    'card p-5 relative',
                    plan.highlight && 'border-[#00CDD9] ring-2 ring-[#00CDD9]/10'
                  )}
                >
                  {plan.highlight && (
                    <span className="absolute -top-2.5 left-4 text-[11px] bg-[#00CDD9] text-white px-2.5 py-0.5 rounded-full font-semibold">
                      Most Popular
                    </span>
                  )}
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-4 text-[11px] bg-gray-400 text-white px-2.5 py-0.5 rounded-full font-semibold">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-0.5">{plan.price}</p>
                    </div>
                    {plan.current && userData?.plan === plan.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                        Current plan
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-[#00CDD9] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={cn(
                      'w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      plan.highlight ? 'bg-[#00CDD9] hover:bg-[#00b8c4] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
                      (plan.badge || (plan.current && userData?.plan === plan.id)) && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={!!(plan.badge || (plan.current && userData?.plan === plan.id))}
                  >
                    {plan.current && userData?.plan === plan.id
                      ? 'Current plan'
                      : plan.badge
                        ? plan.badge
                        : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}