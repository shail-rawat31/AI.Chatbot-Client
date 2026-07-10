function HeroSection({ onOpenChat }) {
  return (
    <div className="landing-page">

      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-accent)' }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--bg-accent)" fillOpacity="0.3" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Nova AI</span>
        </div>
        <button className="nav-launch-btn" onClick={onOpenChat}>
          Launch App
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-glow lp-glow-1" />
        <div className="lp-hero-glow lp-glow-2" />
        <div className="lp-hero-glow lp-glow-3" />

        <div className="lp-badge">✦ Powered by Gemini 2.0</div>

        <h1 className="lp-hero-title">
          Meet <span className="lp-gradient-text">Nova AI</span>
          <br />Your Intelligent Workspace
        </h1>

        <p className="lp-hero-sub">
          A next-generation AI assistant with voice control, image generation,
          multimodal understanding, and real-time study tools — all in one place.
        </p>

        {/* Feature Pills */}
        <div className="lp-pills">
          {[
            { icon: '🎨', label: 'Create Images' },
            { icon: '📚', label: 'Study Materials' },
            { icon: '⚡', label: 'Fast Responses' },
            { icon: '🎙️', label: 'Voice Commands' },
            { icon: '💻', label: 'Code Debugger' },
            { icon: '📎', label: 'File Analysis' },
          ].map((p) => (
            <span key={p.label} className="lp-pill">
              <span>{p.icon}</span> {p.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button className="lp-cta-btn" onClick={onOpenChat}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          Launch Nova AI
        </button>
        <p className="lp-cta-hint">No sign-up required · Free to use</p>

        {/* Preview Card */}
        <div className="lp-preview-card">
          <div className="lp-preview-header">
            <div className="lp-preview-dots">
              <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            </div>
            <span className="lp-preview-title">Nova AI · Chat</span>
          </div>
          <div className="lp-preview-msgs">
            <div className="lp-preview-msg user">Generate a watercolor painting of a sunset over mountains</div>
            <div className="lp-preview-msg model">
              <div className="lp-preview-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.3" />
                  <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span>✨ Creating your watercolor artwork...</span>
            </div>
            <div className="lp-preview-img-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>AI-generated image appears here</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-badge">Features</div>
          <h2 className="lp-section-title">Everything you need, <span className="lp-gradient-text">in one place</span></h2>
          <p className="lp-section-sub">Nova AI combines cutting-edge AI capabilities into a seamless, beautiful workspace.</p>

          <div className="lp-features-grid">
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
                title: 'AI Image Generation',
                desc: 'Type /image followed by any description to instantly generate stunning, high-quality artwork using Google\'s Imagen model.',
                color: '#a855f7',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
                title: 'Study Materials',
                desc: 'Ask Nova to create flashcards, summaries, quizzes, and explanations for any subject. Your personal AI tutor.',
                color: '#6366f1',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
                title: 'Code Debugger',
                desc: 'Paste your code and Nova identifies bugs, explains issues, and provides fixed versions with detailed explanations.',
                color: '#10b981',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
                title: 'Voice Input & Commands',
                desc: 'Speak naturally to Nova. Full speech-to-text input and text-to-speech output for a hands-free AI experience.',
                color: '#f59e0b',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
                title: 'File & Image Analysis',
                desc: 'Upload PDFs, images, text files, and more. Nova reads, understands, and answers questions about your documents.',
                color: '#ec4899',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                title: 'Lightning Fast',
                desc: 'Powered by Gemini 2.0 Flash — optimized for speed. Get responses in under 2 seconds for most queries.',
                color: '#14b8a6',
              },
            ].map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ '--fcolor': f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="lp-section lp-section-alt" id="how-it-works">
        <div className="lp-section-inner">
          <div className="lp-section-badge">How It Works</div>
          <h2 className="lp-section-title">Get started in <span className="lp-gradient-text">3 simple steps</span></h2>
          <p className="lp-section-sub">No account, no setup. Just launch and start chatting.</p>

          <div className="lp-steps">
            {[
              {
                step: '01',
                title: 'Launch the App',
                desc: 'Click "Launch Nova AI" to open the full-screen workspace. No login or account required.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
              },
              {
                step: '02',
                title: 'Choose a Mode',
                desc: 'Select from Chat, Code Debug, Image Generation, or Study Hub — or just type anything naturally.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
              },
              {
                step: '03',
                title: 'Start Chatting',
                desc: 'Type, speak, or upload files. Nova responds instantly with rich markdown, code, and images.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
              },
            ].map((s, i) => (
              <div key={s.step} className="lp-step">
                <div className="lp-step-number">{s.step}</div>
                <div className="lp-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < 2 && <div className="lp-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" />
        <div className="lp-section-inner lp-cta-inner">
          <h2 className="lp-cta-title">Ready to experience <span className="lp-gradient-text">the future?</span></h2>
          <p className="lp-cta-desc">Join thousands of users leveraging Nova AI for creativity, learning, and productivity.</p>
          <button className="lp-cta-btn lp-cta-btn-large" onClick={onOpenChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.2" />
              <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
            </svg>
            Launch Nova AI — It's Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="nav-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-accent)' }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--bg-accent)" fillOpacity="0.3" />
            <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
          </svg>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nova AI · Built with ❤️ · Powered by Gemini</span>
        </div>
      </footer>

    </div>
  );
}

export default HeroSection;
