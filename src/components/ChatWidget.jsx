import { useState } from "react";
import HeroSection from "./HeroSection.jsx";
import ChatWindow from "./ChatWindow.jsx";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);

  return (
    <div className={`app-workspace ${isMaximized && isOpen ? "fullscreen-dashboard" : ""}`}>
      {(!isOpen || !isMaximized) && (
        <HeroSection onOpenChat={() => {
          setIsOpen(true);
          setIsMaximized(true); // Open in dashboard mode for the full workspace experience
        }} />
      )}
      {isOpen && (
        <ChatWindow 
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
          onClose={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}

export default ChatWidget;
