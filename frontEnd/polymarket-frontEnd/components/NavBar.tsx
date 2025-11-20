"use client"

import { useState } from "react"

type Props = {
  docsUrl: string
}

export default function NavBar({ docsUrl }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="sticky top-0 z-40 w-full border-b border-[#1c2335] bg-[#0b1020]">
      <div className="flex items-center justify-between gap-3 py-3 md:py-4">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.svg" className="logo" alt="logo" />
          <div>
            <div className="text-lg font-bold">Polymarket Dashboard</div>
            <div className="muted">Markets + sentiment aggregator</div>
          </div>
        </a>

        {/* Right side: hamburger (mobile) + links (desktop) */}
        <div className="flex items-center">
          <button
            aria-label="Toggle navigation"
            className="md:hidden inline-flex flex-col items-center justify-center rounded border border-[#2b3245] px-3 py-2 text-[#9aa6bf] hover:text-white hover:border-[#3a4259]"
            onClick={() => setOpen(!open)}
          >
            <span className="block w-5 h-0.5 bg-[#9aa6bf]" />
            <span className="block w-5 h-0.5 bg-[#9aa6bf] mt-1" />
            <span className="block w-5 h-0.5 bg-[#9aa6bf] mt-1" />
          </button>

          <nav className="hidden md:flex gap-4 ml-4">
            <a className="text-sm text-[#9aa6bf] hover:text-white" href="/">Home</a>
            <a className="text-sm text-[#9aa6bf] hover:text-white" href="/#markets">Markets</a>
            <a className="text-sm text-[#9aa6bf] hover:text-white" href="/stats">Stats</a>
            <a className="text-sm text-[#9aa6bf] hover:text-white" href={docsUrl} target="_blank" rel="noreferrer">Docs</a>
          </nav>
        </div>
      </div>

      <div
        className={`mt-3 md:hidden rounded-md border border-[#2b3245] bg-[#0f1422] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 ease-out origin-top ${
          open ? "opacity-100 translate-y-0 max-h-96" : "opacity-0 -translate-y-1 max-h-0 pointer-events-none"
        }`}
      >
        <div className="grid gap-2 overflow-hidden">
          <a onClick={() => setOpen(false)} className="text-sm text-[#9aa6bf] hover:text-white" href="/">Home</a>
          <a onClick={() => setOpen(false)} className="text-sm text-[#9aa6bf] hover:text-white" href="/#markets">Markets</a>
          <a onClick={() => setOpen(false)} className="text-sm text-[#9aa6bf] hover:text-white" href="/stats">Stats</a>
          <a onClick={() => setOpen(false)} className="text-sm text-[#9aa6bf] hover:text-white" href={docsUrl} target="_blank" rel="noreferrer">Docs</a>
        </div>
      </div>
    </div>
  )
}
