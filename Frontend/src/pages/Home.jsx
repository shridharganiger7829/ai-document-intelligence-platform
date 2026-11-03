import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  Zap,
  TrendingUp,
  FileCheck,
  Users,
  Eye,
  Clock,
  ChevronRight,
  Check,
  ArrowUpRight,
  Database,
  Building,
  Terminal,
} from 'lucide-react';

export const Home = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Interactive sample document switch in showcase
  const [activeSample, setActiveSample] = useState('invoice');

  const sampleData = {
    invoice: {
      title: 'Enterprise Cloud Invoice',
      file: 'INV-2024-9842.pdf',
      vendor: 'Global Cloud Systems Inc.',
      amount: '$14,850.00',
      status: 'verified',
      fields: [
        { label: 'Invoice No.', value: 'INV-2024-9842' },
        { label: 'Issue Date', value: '2024-10-18' },
        { label: 'PO Reference', value: 'PO-88192' },
        { label: 'Vendor Address', value: '742 Evergreen Terrace, CA' },
        { label: 'Subtotal', value: '$13,500.00' },
        { label: 'Tax (10%)', value: '$1,350.00' },
        { label: 'Total Due', value: '$14,850.00' },
      ],
      lineItems: [
        { desc: 'Dedicated GPU Cluster A100 (Month)', qty: 2, amount: '$8,000.00' },
        { desc: 'Enterprise Multi-Region Storage', qty: 10, amount: '$3,500.00' },
        { desc: '24/7 Dedicated SRE Support SLA', qty: 1, amount: '$2,000.00' },
      ],
    },
    receipt: {
      title: 'Executive Logistics Receipt',
      file: 'REC-LOG-4421.pdf',
      vendor: 'Speedy Express Air Cargo',
      amount: '$3,240.50',
      status: 'approved',
      fields: [
        { label: 'Receipt No.', value: 'REC-LOG-4421' },
        { label: 'Transaction Date', value: '2024-10-21' },
        { label: 'Payment Method', value: 'Corporate AMEX **** 4012' },
        { label: 'Destination', value: 'Frankfurt Central Hub, DE' },
        { label: 'Customs Duty', value: '$240.50' },
        { label: 'Net Charge', value: '$3,000.00' },
        { label: 'Total Paid', value: '$3,240.50' },
      ],
      lineItems: [
        { desc: 'International Air Freight Delivery', qty: 1, amount: '$2,750.00' },
        { desc: 'Hazardous Materials Compliance Seal', qty: 1, amount: '$250.00' },
        { desc: 'Airport Security Clearance Surcharge', qty: 1, amount: '$240.50' },
      ],
    },
    purchase_order: {
      title: 'Procurement Purchase Order',
      file: 'PO-CORP-00781.pdf',
      vendor: 'Nexus Hardware Distribution',
      amount: '$48,600.00',
      status: 'extracted',
      fields: [
        { label: 'PO Number', value: 'PO-CORP-00781' },
        { label: 'Order Date', value: '2024-10-24' },
        { label: 'Payment Terms', value: 'Net 45 Days' },
        { label: 'Authorized Signer', value: 'VP Operations' },
        { label: 'Freight Surcharge', value: '$600.00' },
        { label: 'Base Hardware', value: '$48,000.00' },
        { label: 'Authorized Sum', value: '$48,600.00' },
      ],
      lineItems: [
        { desc: 'Edge AI Compute Gateways (Gen 4)', qty: 24, amount: '$36,000.00' },
        { desc: 'Redundant Power Supply Modules', qty: 24, amount: '$12,000.00' },
        { desc: 'Insured Logistics & Transport', qty: 1, amount: '$600.00' },
      ],
    },
  };

  const currentSample = sampleData[activeSample];

  return (
    <div className="min-h-screen bg-[#071317] text-slate-100 selection:bg-brand-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Dynamic Ambient Background Glows matching Sight Banking Teal Palette */}
      <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-teal-800/25 via-teal-900/10 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/15 via-brand-800/5 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[500px] bg-gradient-to-t from-teal-950/40 via-teal-900/10 to-transparent blur-3xl pointer-events-none z-0" />

      {/* ========================================================
          1. HEADER / NAVIGATION BAR
         ======================================================== */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between border-b border-white/5">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              DOCUFLOW<span className="text-brand-500 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400">
              Intelligence SaaS
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <a href="#features" className="hover:text-brand-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-brand-400 transition-colors">
            Workflows
          </a>
          <a href="#interactive-demo" className="hover:text-brand-400 transition-colors">
            AI Extraction
          </a>
          <a href="#security" className="hover:text-brand-400 transition-colors">
            Multi-Tenant Security
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(getDashboardPath(role))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border border-brand-500/60 bg-brand-500/10 hover:bg-brand-500 text-brand-300 hover:text-white shadow-sm hover:shadow-glow-brand transition-all duration-300"
              >
                <span>Register Company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION (INSPIRED BY SIGHT BANKING WEBFLOW UI)
         ======================================================== */}
      <section className="relative z-10 pt-12 pb-24 lg:pt-16 lg:pb-32 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Top Subtitle Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>SAVE & AUTOMATE ENTERPRISE DOCUMENTS</span>
            </div>

            {/* Massive Bold Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.04]">
              Document <br />
              Workflows You <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-orange-400">
                Want To Use
              </span>
            </h1>

            {/* Body Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Extract, verify, review, and approve invoices, purchase orders, and financial forms with PyMuPDF OCR and Groq Cloud AI. Built for multi-tenant enterprise reliability.
            </p>

            {/* CTA Group with the Signature Sight Banking Terracotta Pill & Arrow Circle */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-between gap-4 px-6 py-4 rounded-full bg-gradient-to-r from-[#f26a36] to-[#e05522] hover:from-[#ff7742] hover:to-[#ea580c] text-white font-bold text-sm shadow-glow-brand transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="tracking-wide">JOIN 2,400+ ENTERPRISE TEAMS</span>
                <span className="w-8 h-8 rounded-full bg-white text-brand-600 flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-semibold transition-all duration-200"
              >
                <span>Live Portal Access</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex items-center gap-8 text-xs text-slate-400 border-t border-white/5">
              <div>
                <span className="text-lg font-black text-white block">99.8%</span>
                <span>Groq Extraction Accuracy</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-lg font-black text-white block">&lt; 1.2s</span>
                <span>PyMuPDF OCR Speed</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-lg font-black text-white block">100%</span>
                <span>Tenant Data Isolation</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Floating 3D Cards Motif from Sight Banking Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient circular glow */}
            <div className="absolute w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md h-[460px] flex items-center justify-center">
              {/* CARD 1: Warm Terracotta Gradient Card (Tilted at angle) */}
              <div className="absolute top-4 right-2 sm:right-6 w-72 sm:w-80 p-6 rounded-3xl bg-gradient-to-br from-[#f26a36] via-[#d94e18] to-[#b3390c] text-white shadow-2xl transform rotate-12 hover:rotate-6 transition-all duration-500 z-20 border border-white/20">
                {/* Decorative card pattern arcs */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-4 border-white/10 pointer-events-none" />
                <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />

                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs uppercase font-extrabold tracking-widest opacity-90">
                    AI INTELLIGENCE
                  </span>
                  <Sparkles className="w-5 h-5 text-white/90" />
                </div>

                <div className="space-y-1 mb-8">
                  <span className="text-xs font-mono tracking-widest text-white/80 block">
                    **** 5678
                  </span>
                  <div className="flex items-center justify-between text-xs text-white/90 font-medium">
                    <span>EXTRACTED INVOICE</span>
                    <span className="font-mono">05/26</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/80 uppercase font-bold block">
                      Total Verified
                    </span>
                    <span className="text-xl font-black font-mono tracking-tight">$14,850.00</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white text-brand-700 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Verified
                  </span>
                </div>
              </div>

              {/* CARD 2: Dark Marine Metallic Card (Tilted underneath) */}
              <div className="absolute bottom-6 left-2 sm:left-4 w-72 sm:w-80 p-6 rounded-3xl bg-gradient-to-br from-[#122933] to-[#0a191f] text-white shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500 z-10 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                    SECURITY CORE
                  </span>
                  <ShieldCheck className="w-5 h-5 text-brand-400" />
                </div>

                <div className="space-y-1 mb-8">
                  <span className="text-xs font-mono tracking-widest text-slate-400 block">
                    **** 9012
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>MULTI-TENANT ENCRYPTED</span>
                    <span className="font-mono">05/26</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Audit Trail
                    </span>
                    <span className="text-base font-bold text-white">Immutable Logs</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase">
                    Supabase DB
                  </span>
                </div>
              </div>

              {/* Floating Mini Badge 1: OCR Speed */}
              <div className="absolute top-0 left-0 p-3 rounded-2xl bg-surface-card/90 border border-white/10 shadow-xl backdrop-blur-md z-30 flex items-center gap-2.5 animate-bounce duration-1000">
                <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">PyMuPDF OCR</p>
                  <p className="text-[10px] text-slate-400">450ms Fast Extraction</p>
                </div>
              </div>

              {/* Floating Mini Badge 2: Groq LLM */}
              <div className="absolute bottom-2 right-0 p-3 rounded-2xl bg-surface-card/90 border border-white/10 shadow-xl backdrop-blur-md z-30 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">Groq Cloud LLM</p>
                  <p className="text-[10px] text-slate-400">gpt-oss-120b</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. INTERACTIVE PRODUCT SHOWCASE / LIVE EXTRACTION DEMO
         ======================================================== */}
      <section id="interactive-demo" className="relative z-10 py-20 bg-navy-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Interactive Product Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              See How AI Transforms Raw PDFs Into Structured Gold
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select a sample document below to see the instant entity mapping, line item parsing, and reviewer verification state.
            </p>
          </div>

          {/* Sample Selector Tabs */}
          <div className="flex items-center justify-center gap-3">
            {[
              { id: 'invoice', label: 'Enterprise Invoice', icon: FileText },
              { id: 'receipt', label: 'Air Cargo Receipt', icon: FileCheck },
              { id: 'purchase_order', label: 'Procurement PO', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSample === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSample(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-glow-brand'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Dual-Panel Showcase */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Document PDF Simulation */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-card border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-white">{currentSample.file}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-slate-300">
                  PDF 16 MB
                </span>
              </div>

              {/* PDF Document Preview Mock */}
              <div className="p-6 rounded-2xl bg-navy-950/80 border border-white/5 space-y-4 min-h-[360px] font-mono text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{currentSample.vendor}</h4>
                    <p className="text-[11px] text-slate-400">B2B Commercial Document</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold">
                    VERIFIED ENCRYPTED
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-[11px] text-slate-300">
                  <p className="text-slate-400">Document Title:</p>
                  <p className="font-semibold text-white">{currentSample.title}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase font-bold">Line Items Identified:</p>
                  <div className="space-y-1.5">
                    {currentSample.lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] text-[11px]"
                      >
                        <span className="text-slate-300 truncate max-w-[200px]">{item.desc}</span>
                        <span className="font-bold text-brand-400">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">Calculated Total:</span>
                  <span className="text-base font-extrabold text-white">{currentSample.amount}</span>
                </div>
              </div>
            </div>

            {/* Right: AI Structured JSON Extraction Preview */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-card border border-brand-500/20 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-500/15 text-brand-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Groq LLM Structured JSON Extraction
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Confidence: 99.8%
                </span>
              </div>

              {/* Extracted Fields Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentSample.fields.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-navy-950 border border-white/5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      {f.label}
                    </span>
                    <span className="font-semibold text-white truncate block">{f.value}</span>
                  </div>
                ))}
              </div>

              {/* Live Status Pipeline Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Workflow Lifecycle State:
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AI Extracted</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reviewer Verified</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 font-medium">
                    <span>Admin Approved</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. THE 4-STEP WORKFLOW AUTOMATION PIPELINE
         ======================================================== */}
      <section id="how-it-works" className="relative z-10 py-24 max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            End-to-End Orchestration
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How DocuFlow AI Automates Document Approvals
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From raw PDF drop to final executive clearance, every step is guarded by AI precision and human governance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ingest & Validate',
              desc: 'Employees upload single or bulk PDFs (up to 16 MB each). Automatic MIME validation ensures 100% clean inputs.',
              icon: FileText,
            },
            {
              step: '02',
              title: 'AI OCR Extraction',
              desc: 'PyMuPDF parses high-density layouts while Groq Cloud LLM structures keys, dates, vendors, and line items into JSON.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Reviewer Workspace',
              desc: 'Designated reviewers inspect side-by-side PDF canvases, make inline field corrections, and log audit findings.',
              icon: Eye,
            },
            {
              step: '04',
              title: 'Admin Sign-Off',
              desc: 'Company managers make the final approved or rejected decision with immutable compliance audit logging.',
              icon: ShieldCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-surface-card/70 border border-white/5 hover:border-brand-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-brand-500/40 group-hover:text-brand-500 transition-colors">
                      {item.step}
                    </span>
                    <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-brand-500/15 text-slate-300 group-hover:text-brand-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. ROLE-BASED GOVERNANCE & MULTI-TENANT ISOLATION
         ======================================================== */}
      <section id="security" className="relative z-10 py-24 bg-navy-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Enterprise Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Dedicated Roles. Zero Cross-Tenant Leakage.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Every query is filtered by company tenant ID and role permissions enforced at the database level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Admin Role */}
            <div className="p-8 rounded-3xl bg-surface-card border border-white/10 space-y-6 shadow-xl flex flex-col justify-between hover:border-brand-500/40 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Administrator Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full executive control over company settings, reviewer workload assignment, user creation & activation, and pending approvals.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Complete company dashboard metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Delegate documents to reviewers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Final approve / reject / correction actions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Full compliance audit trail inspection</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className="inline-flex items-center justify-between text-xs font-bold text-brand-400 hover:text-brand-300 pt-4 border-t border-white/5"
              >
                <span>Register as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Reviewer Role */}
            <div className="p-8 rounded-3xl bg-surface-card border border-brand-500/30 space-y-6 shadow-glow-brand flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-brand-500 text-white text-[10px] font-bold uppercase rounded-bl-xl tracking-wider">
                Key Workflow
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Reviewer Workspace</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated split-screen workbench designed for human-in-the-loop accuracy verification and discrepancy resolution.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Assigned document queue visibility</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>High-resolution PDF viewer with zoom</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Inline entity & line-item correction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Log discrepancy findings & notes</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-between text-xs font-bold text-brand-400 hover:text-brand-300 pt-4 border-t border-white/5"
              >
                <span>Reviewer Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Employee Role */}
            <div className="p-8 rounded-3xl bg-surface-card border border-white/10 space-y-6 shadow-xl flex flex-col justify-between hover:border-brand-500/40 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Employee Ingestion</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Streamlined drag-and-drop submission for invoices, receipts, and forms with real-time status tracking and correction re-submission.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Single & bulk upload (up to 10 files)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Track extraction & reviewer status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Receive and resubmit correction requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                    <span>Private documents isolated from peers</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-between text-xs font-bold text-brand-400 hover:text-brand-300 pt-4 border-t border-white/5"
              >
                <span>Employee Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. CALL TO ACTION FOOTER BANNER
         ======================================================== */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-[#e05522] shadow-2xl text-white">
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full border-8 border-white/10 pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 -mb-16 w-60 h-60 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready To Modernize Your Enterprise Document Pipeline?
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Register your company in 30 seconds. Ingest PDFs, extract structured intelligence, and automate human reviews immediately.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-navy-950 hover:bg-black text-white text-xs font-extrabold uppercase tracking-wider shadow-2xl transition-all duration-200"
              >
                Register Company & Admin
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-md transition-all duration-200"
              >
                Existing User Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FOOTER
         ======================================================== */}
      <footer className="relative z-10 border-t border-white/5 py-12 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center font-bold text-white text-xs shadow-glow-brand">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">
              DOCUFLOW<span className="text-brand-500">AI</span>
            </span>
            <span className="text-xs text-slate-500 ml-2">
              © {new Date().getFullYear()} DocuFlow Intelligence Inc. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Online & Healthy
            </span>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
