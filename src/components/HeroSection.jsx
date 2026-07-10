function HeroSection({ onOpenChat }) {
  return (
    <section className="hero">
      <div className="hero-bg-glow"></div>
      <h1>Welcome to Nova Workspace</h1>
      <p className="hero-subtitle">
        An advanced, multi-modal AI Assistant workspace featuring voice interactions, document analysis, and real-time image generation.
      </p>

      <div className="hero-chat-box" onClick={onOpenChat}>
        <div className="hero-chat-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-accent)', filter: 'drop-shadow(0 0 10px var(--bg-accent-glow))' }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--bg-accent)" fillOpacity="0.2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <h2>Launch Assistant Workspace</h2>
        <p>Click to open the interactive dashboard. Support for file uploads, markdown code blocks, voice commands, and speech output.</p>
      </div>
    </section>
  );
}

export default HeroSection;
