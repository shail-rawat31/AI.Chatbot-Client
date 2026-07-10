function HeroSection({ onOpenChat }) {
  return (
    <section className="hero">
      <div className="hero-bg-glow"></div>
      <h1>Welcome to CampusAI Portal</h1>
      <p className="hero-subtitle">
        An advanced, multi-modal AI Assistant workspace featuring voice interactions, document analysis, and real-time image generation.
      </p>

      <div className="hero-chat-box" onClick={onOpenChat}>
        <div className="hero-chat-icon">💬</div>
        <h2>Launch Assistant Workspace</h2>
        <p>Click to open the interactive dashboard. Support for file uploads, markdown code blocks, voice commands, and speech output.</p>
      </div>
    </section>
  );
}

export default HeroSection;
