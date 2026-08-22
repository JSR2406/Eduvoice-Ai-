import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const tiers = [
  {
    name: 'Free Trial',
    price: '₹0',
    description: 'Perfect for trying out VoxGuru AI.',
    icon: Zap,
    features: [
      '1,000 Credits / month',
      'Basic AI summarization',
      '5 languages (English, Hindi, Marathi, Gujarati, Tamil)',
      'Standard TTS Voices',
      'Community Support',
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Pro Teacher',
    price: '₹299',
    period: '/month',
    description: 'Everything a teacher needs to automate lessons.',
    icon: Crown,
    features: [
      '15,000 Credits / month',
      'Advanced Multi-Agent processing',
      'All 22+ Indian languages (Sarvam AI)',
      'Premium Custom Voices (Voice Cloning)',
      'WhatsApp Integration',
      'Priority Email Support',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'School / Institutional',
    price: 'Custom',
    description: 'Scale AI across your entire teaching staff.',
    icon: Building2,
    features: [
      'Unlimited Credits pooling',
      'School-wide Data Privacy (DPDP Compliant)',
      'Real-Time Student Voice Tutor API',
      'Google Classroom / ERP Integration',
      'Custom Voice Cloning for Principal/Mascot',
      '24/7 Dedicated Support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function Pricing() {
  const handleUpgrade = (tierName) => {
    toast.success(`Redirecting to upgrade flow for ${tierName} plan...`)
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-bold mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        >
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 max-w-2xl mx-auto"
        >
          Powered by Sarvam AI's sovereign Indian infrastructure. 
          Use credits to generate text, translate to 22+ languages, and produce premium audio.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-2xl flex flex-col ${
              tier.highlighted
                ? 'bg-gradient-to-b from-indigo-900/40 to-slate-900 ring-2 ring-indigo-500'
                : 'bg-white/5 ring-1 ring-white/10'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-indigo-500 to-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="mb-6">
              <tier.icon
                className={`w-10 h-10 mb-4 ${
                  tier.highlighted ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-slate-400">{tier.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">{tier.price}</span>
              {tier.period && <span className="text-slate-400 ml-1">{tier.period}</span>}
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(tier.name)}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                tier.highlighted
                  ? 'btn-primary'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-16 bg-white/5 border border-indigo-500/20 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Are you a Startup or EdTech builder?</h3>
          <p className="text-sm text-slate-400">VoxGuru AI is part of the Sarvam Startup Program. Build atop our APIs.</p>
        </div>
        <button 
          onClick={() => window.open('https://www.sarvam.ai/startup-program', '_blank')}
          className="mt-4 md:mt-0 btn-ghost border border-indigo-500/30 text-indigo-300"
        >
          Learn more
        </button>
      </div>
    </div>
  )
}
