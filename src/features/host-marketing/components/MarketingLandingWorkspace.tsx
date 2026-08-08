'use client';

import React, { useState } from 'react';
import { startHostingAction } from '@/features/hosting/actions/hosting.actions';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

/**
 * Host Marketing Landing Workspace answering "Why should I host on EliteStay?"
 * Governed as an independent marketing acquisition domain outside operational business logic.
 */
export const MarketingLandingWorkspace: React.FC = () => {
  const [roomCount, setRoomCount] = useState<number>(3);
  const [localityTier, setLocalityTier] = useState<
    'urban' | 'tech' | 'university'
  >('tech');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamic earnings estimation logic
  const baseMonthlyRate =
    localityTier === 'urban' ? 45000 : localityTier === 'tech' ? 38000 : 25000;
  const projectedMonthlyEarnings = roomCount * baseMonthlyRate * 0.92; // Assuming 92% occupancy rate
  const projectedAnnualEarnings = projectedMonthlyEarnings * 12;

  const faqs = [
    {
      question: 'Do I lose my normal guest account when I start hosting?',
      answer:
        'No. EliteStay operates on a multi-capability model. You retain full access to booking accommodations as a guest while gaining professional hosting capabilities on the exact same account.',
    },
    {
      question: 'How does EliteStay guarantee consistent long-term occupancy?',
      answer:
        'We connect hosts directly with corporate relocation programs, university research scholars, and verified working professionals seeking extended tenancy over casual short-stay tourism.',
    },
    {
      question: 'What protections and trust SLAs are provided?',
      answer:
        'Every tenancy is governed by our strict anti-discrimination SLAs and backed by comprehensive property damage protection, comprehensive tenant identity screening, and automated rent settlements.',
    },
    {
      question: 'When do I transition into active hosting operations?',
      answer:
        'After completing our streamlined verification onboarding, your account status advances to Ready. You only transition to Active status once your very first listing is published live on the platform.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Hero Banner with Radiant Gradient */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 sm:px-12 lg:px-24 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-rose-50/50 to-white -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Professional Long-Term
            Accommodation Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Transform Your Properties Into{' '}
            <span className="bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
              High-Yield Residences.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-light leading-relaxed">
            Join thousands of professional hosts leveraging EliteStays
            state-of-the-art residency platform for guaranteed long-term
            occupancy, automated settlements, and verified tenant rosters.
          </p>

          <form
            action={startHostingAction}
            className="pt-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start"
          >
            <button
              type="submit"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-lg shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-200 group"
            >
              Start Hosting{' '}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-slate-500 py-2 sm:py-4">
              Takes less than 3 minutes to audit eligibility. Zero initial fees.
            </p>
          </form>
        </div>
      </section>

      {/* Interactive Earnings Estimator */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Interactive Earnings Estimator
            </h2>
            <p className="text-slate-500">
              Calculate your projected revenue based on real-time occupancy
              dynamics across leading technology and urban centers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 p-8 rounded-2xl shadow-xl">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <label htmlFor="room-slider" className="text-slate-700">
                    Dedicated Units / Private Suites
                  </label>
                  <span className="text-rose-600 font-mono text-lg">
                    {roomCount} {roomCount === 1 ? 'Unit' : 'Units'}
                  </span>
                </div>
                <input
                  id="room-slider"
                  type="range"
                  min="1"
                  max="25"
                  value={roomCount}
                  onChange={(e) => setRoomCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-3">
                <span className="text-sm font-semibold text-slate-700 block">
                  Property Locality Classification
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: 'tech',
                      label: 'Tech Park Hub',
                      desc: 'Working professionals & executives',
                    },
                    {
                      id: 'urban',
                      label: 'Prime Urban',
                      desc: 'Commercial downtown districts',
                    },
                    {
                      id: 'university',
                      label: 'University Axis',
                      desc: 'Scholars & faculty programs',
                    },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() =>
                        setLocalityTier(
                          tier.id as 'urban' | 'tech' | 'university'
                        )
                      }
                      className={`p-3 rounded-xl text-left border transition-all duration-150 ${
                        localityTier === tier.id
                          ? 'bg-rose-50 border-rose-200 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">
                        {tier.label}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {tier.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center flex flex-col justify-center items-center h-full">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Projected Annual Revenue
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tracking-tight">
                INR{' '}
                {Math.round(projectedAnnualEarnings).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Estimated at INR{' '}
                {Math.round(projectedMonthlyEarnings).toLocaleString('en-IN')} /
                month with 92% SLA-guaranteed occupancy.
              </p>

              <form action={startHostingAction} className="w-full mt-6">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-sm transition-colors"
                >
                  Lock In Occupancy Projection
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions & Trust Pillars */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Built for Professional Accommodation Operators
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Experience seamless tenancy operations powered by enterprise-grade
            automation, verified resident diagnostic vectors, and instantaneous
            financial disbursement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Verified Resident Roster',
              description:
                'Every applicant undergoes mandatory multi-point identification and occupation employment screening before check-in approval.',
            },
            {
              icon: TrendingUp,
              title: 'Automated Payout Pipeline',
              description:
                'Rental revenues are automatically reconciled and settled directly to your verified commercial bank accounts without delay.',
            },
            {
              icon: ShieldCheck,
              title: '100% Operational Transparency',
              description:
                'Manage lease terms, itemized maintenance SLA tickets, and occupancy health scores from a unified command workspace.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:border-slate-300 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-6 sm:px-12 lg:px-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500">
              Everything you need to know about starting your hosting operations
              on EliteStay.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left text-sm sm:text-base font-semibold text-slate-800 hover:text-slate-900 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ready to Elevate Your Accommodation Portfolio?
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          Begin your hosting capabilities audit today and publish your first
          listing to start accepting verified long-term residents.
        </p>
        <form action={startHostingAction} className="pt-2">
          <button
            type="submit"
            className="px-8 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg shadow-xl shadow-rose-500/20 transition-all"
          >
            Launch Host Onboarding
          </button>
        </form>
      </section>
    </div>
  );
};
