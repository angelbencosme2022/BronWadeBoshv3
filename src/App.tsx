/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Gauge, 
  DollarSign,
  ArrowRight,
  Info,
  Loader2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeCarListing, type CarAnalysis } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOADING_MESSAGES = [
  "Revving the engine...",
  "Checking the service history...",
  "Scanning for hidden red flags...",
  "Comparing with market data...",
  "Inspecting the virtual tires...",
  "Decoding the seller's description...",
  "Calculating the deal score...",
];

export default function App() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CarAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const result = await analyzeCarListing(url);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDealColor = (rating: string) => {
    switch (rating) {
      case 'Great': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Fair': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Poor': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Suspicious': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const getDealGradient = (rating: string) => {
    switch (rating) {
      case 'Great': return 'deal-gradient-great';
      case 'Good': return 'deal-gradient-good';
      case 'Fair': return 'deal-gradient-fair';
      case 'Poor': return 'deal-gradient-poor';
      case 'Suspicious': return 'deal-gradient-suspicious';
      default: return 'from-zinc-500 to-zinc-600';
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-zinc-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">
              CarDeal<span className="text-zinc-500">Scout</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">How it works</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Market Trends</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Saved Deals</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Find the <span className="text-zinc-400 italic">perfect</span> deal.<br />
            Avoid the <span className="text-rose-500 underline decoration-rose-200 underline-offset-8">lemons</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 text-lg max-w-2xl mx-auto mb-10"
          >
            Paste a link from Facebook Marketplace, Craigslist, or any dealership. 
            Our AI analyzes the listing for value, red flags, and market comparisons.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleAnalyze}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="relative flex items-center">
              <div className="absolute left-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="url" 
                required
                placeholder="Paste car listing URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-14 pr-36 py-5 bg-white border-2 border-zinc-200 rounded-2xl focus:outline-none focus:border-zinc-900 transition-all text-lg shadow-sm"
              />
              <button 
                type="submit"
                disabled={isAnalyzing}
                className="absolute right-3 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-zinc-900 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-8 h-8 text-zinc-900" />
                </div>
              </div>
              <motion.p 
                key={loadingMsgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-zinc-500 font-medium"
              >
                {LOADING_MESSAGES[loadingMsgIndex]}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {analysis && !isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Main Header & Deal Badge */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-zinc-500 font-mono text-sm uppercase tracking-wider">{analysis.year} {analysis.make}</span>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded uppercase">{analysis.condition}</span>
                  </div>
                  <h3 className="font-display text-4xl font-bold tracking-tight">{analysis.model}</h3>
                  <div className="flex items-center gap-4 mt-4 text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{analysis.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4" />
                      <span className="text-sm">{analysis.mileage.toLocaleString()} miles</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "px-6 py-3 rounded-2xl border-2 flex items-center gap-3",
                    getDealColor(analysis.dealRating)
                  )}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Deal Rating</span>
                      <span className="text-xl font-bold">{analysis.dealRating} Deal</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center font-bold text-lg">
                      {analysis.dealScore}
                    </div>
                  </div>
                  <div className="text-3xl font-display font-bold">
                    ${analysis.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Pros/Cons */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Summary Card */}
                  <div className="glass-card rounded-3xl p-8">
                    <h4 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-zinc-400" />
                      AI Summary
                    </h4>
                    <p className="text-zinc-600 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-3xl p-6 border-emerald-100 bg-emerald-50/30">
                      <h4 className="font-display text-sm font-bold mb-4 text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Key Pros
                      </h4>
                      <ul className="space-y-3">
                        {analysis.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass-card rounded-3xl p-6 border-rose-100 bg-rose-50/30">
                      <h4 className="font-display text-sm font-bold mb-4 text-rose-700 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Key Cons
                      </h4>
                      <ul className="space-y-3">
                        {analysis.cons.map((con, i) => (
                          <li key={i} className="text-sm text-rose-800 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Market Comparison Chart */}
                  <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="font-display text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-zinc-400" />
                        Market Comparison
                      </h4>
                      <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                        Based on {analysis.marketComparison.similarCarsCount} similar listings
                      </span>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Low', price: analysis.marketComparison.lowPrice, fill: '#e2e8f0' },
                            { name: 'Avg', price: analysis.marketComparison.averagePrice, fill: '#94a3b8' },
                            { name: 'High', price: analysis.marketComparison.highPrice, fill: '#e2e8f0' },
                            { name: 'This Car', price: analysis.price, fill: '#0f172a' },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickFormatter={(val) => `$${val / 1000}k`}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                          />
                          <Bar dataKey="price" radius={[6, 6, 0, 0]} barSize={40}>
                            {
                              [
                                { name: 'Low', price: analysis.marketComparison.lowPrice },
                                { name: 'Avg', price: analysis.marketComparison.averagePrice },
                                { name: 'High', price: analysis.marketComparison.highPrice },
                                { name: 'This Car', price: analysis.price },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'This Car' ? '#0f172a' : '#e2e8f0'} />
                              ))
                            }
                          </Bar>
                          <ReferenceLine y={analysis.marketComparison.averagePrice} stroke="#94a3b8" strokeDasharray="3 3" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-100">
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Market Avg</span>
                        <span className="text-lg font-bold">${analysis.marketComparison.averagePrice.toLocaleString()}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Price Diff</span>
                        <span className={cn(
                          "text-lg font-bold",
                          analysis.price < analysis.marketComparison.averagePrice ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {analysis.price < analysis.marketComparison.averagePrice ? '-' : '+'}
                          ${Math.abs(analysis.price - analysis.marketComparison.averagePrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Market Range</span>
                        <span className="text-sm font-medium text-zinc-600">
                          ${(analysis.marketComparison.lowPrice / 1000).toFixed(1)}k - ${(analysis.marketComparison.highPrice / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Red Flags & Actions */}
                <div className="space-y-8">
                  {/* Red Flags Card */}
                  <div className={cn(
                    "glass-card rounded-3xl p-8 border-2",
                    analysis.redFlags.length > 0 ? "border-rose-200 bg-rose-50/20" : "border-emerald-100 bg-emerald-50/20"
                  )}>
                    <h4 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                      <ShieldAlert className={cn(
                        "w-5 h-5",
                        analysis.redFlags.length > 0 ? "text-rose-500" : "text-emerald-500"
                      )} />
                      Red Flags & Warnings
                    </h4>
                    
                    {analysis.redFlags.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.redFlags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-rose-100 shadow-sm">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-zinc-700 font-medium leading-tight">{flag}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm text-emerald-800 font-medium">No major red flags detected in the listing description.</p>
                      </div>
                    )}
                  </div>

                  {/* Action Card */}
                  <div className="bg-zinc-900 rounded-3xl p-8 text-white">
                    <h4 className="font-display text-lg font-bold mb-4">Ready to buy?</h4>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                      Always inspect the vehicle in person and get a pre-purchase inspection (PPI) before finalizing any deal.
                    </p>
                    <div className="space-y-3">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors"
                      >
                        View Original Listing
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-bold border border-zinc-700 hover:bg-zinc-700 transition-colors">
                        Save to Favorites
                      </button>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="px-4 text-[10px] text-zinc-400 leading-relaxed text-center">
                    AI analysis is based on listing text and market data. We do not guarantee accuracy. Always verify details with the seller.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!analysis && !isAnalyzing && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            {[
              { 
                icon: <ShieldAlert className="w-6 h-6" />, 
                title: "Fraud Detection", 
                desc: "Our AI scans for common scam patterns and suspicious wording in descriptions." 
              },
              { 
                icon: <TrendingUp className="w-6 h-6" />, 
                title: "Market Value", 
                desc: "We compare the price against thousands of similar listings to see if it's a fair deal." 
              },
              { 
                icon: <Info className="w-6 h-6" />, 
                title: "Deep Insights", 
                desc: "Get a breakdown of pros, cons, and specific mechanical warnings from the text." 
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 text-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-900">
                  {feature.icon}
                </div>
                <h5 className="font-display font-bold mb-2">{feature.title}</h5>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 mt-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Car className="w-5 h-5" />
            <span className="font-display font-bold text-sm tracking-tight">CarDealScout</span>
          </div>
          <div className="text-zinc-400 text-xs">
            © 2026 CarDeal Scout. Built with Gemini AI.
          </div>
          <div className="flex gap-6 text-zinc-400 text-xs font-medium">
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Terms</a>
            <a href="#" className="hover:text-zinc-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
