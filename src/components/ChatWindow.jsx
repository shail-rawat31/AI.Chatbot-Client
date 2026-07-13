import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/chatApi.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { speakText, stopSpeaking } from "../hooks/useSpeechSynthesis.js";
import { marked } from "marked";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
});

const categorySuggestions = {
  coding: [
    { label: "Build navbar in React", prompt: "Write a React component for a clean, responsive navigation bar with Tailwind CSS or standard CSS" },
    { label: "Explain async/await", prompt: "Explain JavaScript async/await in simple terms with a clear code example" },
    { label: "Quicksort in Python", prompt: "Write a Python implementation of the Quicksort algorithm with detailed comments explaining complexity" }
  ],
  debugging: [
    { label: "Fix React 'Too many re-renders'", prompt: "How do I fix the 'Too many re-renders' error in React? Show common causes and fixes" },
    { label: "SQL query optimization", prompt: "What are the best practices for optimizing slow SQL database queries? Show before/after examples" },
    { label: "Center a div in CSS", prompt: "Show me the best modern ways to center a div horizontally and vertically in CSS" }
  ],
  image: [
    { label: "Futuristic neon city skyline", prompt: "/image A futuristic neon cyberpunk skyline, 8k resolution, cinematic lighting" },
    { label: "Cute cartoon panda", prompt: "/image A cute cartoon panda wearing sunglasses and holding a bamboo stick, digital art" },
    { label: "Abstract watercolor landscape", prompt: "/image A minimal abstract watercolor landscape of mountains at sunrise, pastel colors" }
  ],
  study: [
    { label: "Sorting algorithm study guide", prompt: "Create a detailed study guide explaining Time and Space complexity for common sorting algorithms" },
    { label: "Newton's laws of motion", prompt: "Explain Newton's Laws of Motion with real-world examples to help me prep for a physics exam" },
    { label: "Biology cell structure quiz", prompt: "Generate a 5-question multiple choice quiz on biology cell structure and function, with answers hidden at the bottom" }
  ]
};

function ChatWindow({ isMaximized, onToggleMaximize, onClose }) {
  // ------------------------------------------------------------------------
  // STATES
  // ------------------------------------------------------------------------
  
  // Threads list stored in localStorage
  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem("campus_ai_threads");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing threads from localStorage:", e);
      }
    }
    return [
      {
        id: "default-thread",
        title: "Default Chat Session",
        messages: [
          { role: "model", text: "Hi! I'm Nova, your AI assistant. Ask me anything, by typing or by voice. You can also upload files (images, PDFs, text) or type `/image <prompt>` to generate art!" }
        ],
        createdAt: Date.now()
      }
    ];
  });

  // Current active thread ID
  const [activeThreadId, setActiveThreadId] = useState(() => {
    const saved = localStorage.getItem("campus_ai_active_thread_id");
    return saved || "default-thread";
  });

  // Sidebar toggle state (mobile drawer)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Message input, file attachment, loading states
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Theme Toggle state (dark or light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("campus_ai_theme") || "dark";
  });

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ------------------------------------------------------------------------
  // REFS & DERIVED STATE
  // ------------------------------------------------------------------------
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const exportDropdownRef = useRef(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || {
    id: "default-thread",
    title: "Default Chat Session",
    messages: []
  };
  const messages = activeThread.messages;

  // ------------------------------------------------------------------------
  // PERSISTENCE EFFECTS
  // ------------------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("campus_ai_threads", JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem("campus_ai_active_thread_id", activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    localStorage.setItem("campus_ai_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Adjust input textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Handle closing export dropdown on click-away
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Stop reading text when thread changes or widget closes
  useEffect(() => {
    stopSpeaking();
    setSpeakingIndex(null);
    setActiveCategory(null);
  }, [activeThreadId]);

  // ------------------------------------------------------------------------
  // THREAD OPERATIONS
  // ------------------------------------------------------------------------
  const handleNewChat = () => {
    const newId = `thread-${Date.now()}`;
    const newThread = {
      id: newId,
      title: "New Chat Session",
      messages: [
        { role: "model", text: "Hi! I'm Nova, your AI assistant. Ask me anything, by typing or by voice. You can also upload files (images, PDFs, text) or type `/image <prompt>` to generate art!" }
      ],
      createdAt: Date.now()
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setSidebarOpen(false); // Close sidebar on mobile drawer
  };

  const handleDeleteThread = (threadId, e) => {
    e.stopPropagation();
    const remaining = threads.filter((t) => t.id !== threadId);
    if (remaining.length === 0) {
      const newId = "default-thread";
      const defaultThread = {
        id: newId,
        title: "New Chat Session",
        messages: [
          { role: "model", text: "Hi! I'm Nova, your AI assistant. Ask me anything, by typing or by voice. You can also upload files (images, PDFs, text) or type `/image <prompt>` to generate art!" }
        ],
        createdAt: Date.now()
      };
      setThreads([defaultThread]);
      setActiveThreadId(newId);
    } else {
      setThreads(remaining);
      if (activeThreadId === threadId) {
        setActiveThreadId(remaining[0].id);
      }
    }
  };

  const handleClearCurrentMessages = () => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [
              { role: "model", text: "Conversation cleared. Ask me anything!" }
            ]
          };
        }
        return t;
      })
    );
  };

  const handleResetAllStorage = () => {
    if (window.confirm("Are you sure you want to clear ALL chat threads? This cannot be undone.")) {
      localStorage.removeItem("campus_ai_threads");
      localStorage.removeItem("campus_ai_active_thread_id");
      const defaultId = "default-thread";
      setThreads([
        {
          id: defaultId,
          title: "Default Chat Session",
          messages: [
            { role: "model", text: "Hi! I'm Nova, your AI assistant. Ask me anything, by typing or by voice. You can also upload files (images, PDFs, text) or type `/image <prompt>` to generate art!" }
          ],
          createdAt: Date.now()
        }
      ]);
      setActiveThreadId(defaultId);
    }
  };

  // ------------------------------------------------------------------------
  // FILE ATTACHMENTS
  // ------------------------------------------------------------------------
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: (file.size / 1024).toFixed(1) + " KB",
        data: reader.result.split(",")[1] // base64 string only
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Clear file input element
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  // ------------------------------------------------------------------------
  // SEND & RECEIVE MESSAGES
  // ------------------------------------------------------------------------
  
  // Clean history data for API
  const buildHistory = (msgs) => {
    // Only include alternating user/model text message pairs.
    // A user message must be followed by a successful, non-image, non-error model response.
    const validPairs = [];
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].role === "user") {
        const nextMsg = msgs[i + 1];
        if (nextMsg && nextMsg.role === "model" && !nextMsg.isImage && !nextMsg.error) {
          validPairs.push(msgs[i], nextMsg);
        }
      }
    }

    return validPairs.map((m) => {
      let textContent = m.text;
      if (m.attachment) {
        textContent = `[Attached File: ${m.attachment.name}]\n\n${m.text}`;
      }
      return {
        role: m.role,
        parts: [{ text: textContent }]
      };
    });
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    // Detect natural language requests for images or direct slash commands
    const detectImagePrompt = (txt) => {
      const trimmed = txt.trim();
      const lowercase = trimmed.toLowerCase();
      
      if (lowercase.startsWith("/image ")) {
        return trimmed.substring(7).trim();
      }
      
      const cleanPrompt = (p) => {
        let cleaned = p.trim();
        cleaned = cleaned.replace(/\s+please$/i, "");
        cleaned = cleaned.replace(/\s+for\s+me$/i, "");
        return cleaned;
      };
      
      // 1. Explicit request for visual assets (ends or starts with image/picture/art/photo/etc.)
      const explicitPatterns = [
        /^(?:generate|draw|create|make|show me)\s+(?:an?\s+)?(?:image|picture|photo|painting|drawing|art|illustration|portrait|sketch|wallpaper)\s+of\s+(.+)$/i,
        /^(?:generate|draw|create|make|show me)\s+(?:an?\s+)?(.+?)\s+(?:image|picture|photo|painting|drawing|art|illustration|portrait|sketch|wallpaper)$/i,
        /^draw\s+(?:an?\s+)?(.+)$/i
      ];
      
      for (const pattern of explicitPatterns) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
          return cleanPrompt(match[1]);
        }
      }
      
      // 2. Implicit request (e.g. "generate a cute panda", "create a neon castle")
      // Check if it starts with a creator verb and contains no text/coding keywords
      const startsWithCreatorVerb = 
        lowercase.startsWith("generate ") || 
        lowercase.startsWith("create ") || 
        lowercase.startsWith("make ") || 
        lowercase.startsWith("show me ");
        
      if (startsWithCreatorVerb) {
        const textKeywords = [
          "code", "loop", "function", "script", "program", "class", "react", "html", "css", "js", "json",
          "text", "paragraph", "list", "table", "sentence", "word", "prompt",
          "api", "server", "route", "database", "sql", "variable", "conditional", "array", "object",
          "plan", "strategy", "method", "test", "issue", "bug", "error", "file", "folder", "github"
        ];
        
        const hasTextKeyword = textKeywords.some(keyword => lowercase.includes(keyword));
        
        if (!hasTextKeyword) {
          let p = trimmed
            .replace(/^(?:generate|create|make|show me)\s+(?:an?\s+|a\s+|some\s+)?/i, "")
            .trim();
            
          // Exclude exact requests for writing text items (like "generate a story" or "create a recipe")
          const textSubjects = [
            "story", "essay", "poem", "recipe", "resume", "plan", "summary", "email", "letter", "cv"
          ];
          const isTextSubjectOnly = textSubjects.some(subj => 
            p.toLowerCase() === subj || 
            p.toLowerCase() === `a ${subj}` || 
            p.toLowerCase() === `an ${subj}` ||
            p.toLowerCase() === `some ${subj}`
          );
          
          if (!isTextSubjectOnly) {
            return cleanPrompt(p);
          }
        }
      }
      
      return null;
    };

    const imagePrompt = detectImagePrompt(text);

    // INTERCEPT: AI Image Generation
    if (imagePrompt) {
      const userMsg = { 
        role: "user", 
        text, 
        timestamp: Date.now() 
      };

      const randomSeed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&private=true&seed=${randomSeed}`;
      
      const imageMsg = {
        role: "model",
        text: `🎨 **AI Generated Art** for: *"${imagePrompt}"*`,
        isImage: true,
        imageUrl,
        imagePrompt: imagePrompt,
        timestamp: Date.now()
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            let newTitle = t.title;
            if (t.title === "New Chat Session" || t.title === "Default Chat Session") {
              newTitle = text.length > 25 ? text.substring(0, 25) + "..." : text;
            }
            return {
              ...t,
              title: newTitle,
              messages: [...t.messages, userMsg, imageMsg]
            };
          }
          return t;
        })
      );
      setInput("");
      setAttachment(null);
      return;
    }

    // Standard Chat with Gemini (and attachments if any)
    const historyBeforeThisMessage = buildHistory(messages);
    const userMessage = { 
      role: "user", 
      text, 
      attachment: attachment ? { ...attachment } : null,
      timestamp: Date.now()
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          let newTitle = t.title;
          if (t.title === "New Chat Session" || t.title === "Default Chat Session") {
            newTitle = text.length > 25 ? text.substring(0, 25) + "..." : text;
          }
          return {
            ...t,
            title: newTitle,
            messages: [...t.messages, userMessage]
          };
        }
        return t;
      })
    );

    setInput("");
    setAttachment(null);
    setIsLoading(true);

    try {
      const reply = await sendMessage(text, historyBeforeThisMessage, userMessage.attachment);
      
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...t.messages, { role: "model", text: reply, timestamp: Date.now() }]
            };
          }
          return t;
        })
      );

      if (voiceReplyEnabled) {
        speakText(reply);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "⚠️ Sorry, I encountered an issue reaching the server. Please verify it is running on Port 5000.";
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [
                ...t.messages,
                { 
                  role: "model", 
                  text: errorMessage,
                  error: true,
                  timestamp: Date.now()
                }
              ]
            };
          }
          return t;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------------
  // VOICE INPUT SPEECH RECOGNITION
  // ------------------------------------------------------------------------
  const { startListening, stopListening, isListening, isSupported } = useSpeechRecognition(
    (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    }
  );

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ------------------------------------------------------------------------
  // TEXT TO SPEECH (SPEECH SYNTHESIS)
  // ------------------------------------------------------------------------
  const handleToggleSpeech = (text, index) => {
    if (speakingIndex === index) {
      stopSpeaking();
      setSpeakingIndex(null);
    } else {
      setSpeakingIndex(index);
      speakText(text, () => {
        setSpeakingIndex(null);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ------------------------------------------------------------------------
  // EXPORT UTILITIES
  // ------------------------------------------------------------------------
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format) => {
    setExportOpen(false);
    if (!messages.length) return;

    if (format === "markdown") {
      let mdContent = `# Nova AI Chat Session\n*Exported on ${new Date().toLocaleString()}*\n\n`;
      messages.forEach((msg) => {
        const author = msg.role === "user" ? "### USER" : "### ASSISTANT";
        mdContent += `${author}\n`;
        if (msg.attachment) {
          mdContent += `*Attachment: ${msg.attachment.name} (${msg.attachment.size})*\n\n`;
        }
        if (msg.isImage) {
          mdContent += `![AI Generated Art](${msg.imageUrl})\n\n`;
        } else {
          mdContent += `${msg.text}\n\n`;
        }
      });
      downloadFile(mdContent, `${activeThread.title.replace(/\s+/g, "_")}.md`, "text/markdown");
    } else if (format === "json") {
      const jsonContent = JSON.stringify(messages, null, 2);
      downloadFile(jsonContent, `${activeThread.title.replace(/\s+/g, "_")}.json`, "application/json");
    } else if (format === "txt") {
      let txtContent = `=== Nova AI Chat: ${activeThread.title} ===\nExported: ${new Date().toLocaleString()}\n\n`;
      messages.forEach((msg) => {
        const author = msg.role === "user" ? "USER" : "ASSISTANT";
        txtContent += `[${author}]: `;
        if (msg.attachment) txtContent += `[Attachment: ${msg.attachment.name}] `;
        txtContent += `${msg.text}\n\n`;
      });
      downloadFile(txtContent, `${activeThread.title.replace(/\s+/g, "_")}.txt`, "text/plain");
    }
  };

  // ------------------------------------------------------------------------
  // IMAGE DOWNLOAD UTILITY
  // ------------------------------------------------------------------------
  const handleDownloadImage = async (url, prompt) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${prompt.substring(0, 25).replace(/[^a-z0-9]/gi, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, "_blank");
    }
  };

  // ------------------------------------------------------------------------
  // CUSTOM MARKDOWN RENDERER
  // ------------------------------------------------------------------------
  const parseMarkdown = (text) => {
    if (!text) return "";
    try {
      let html = marked.parse(text);
      
      // Post-process HTML to apply custom structure for code blocks
      const codeBlockRegex = /<pre><code class="language-(.*?)">([\s\S]*?)<\/code><\/pre>/g;
      html = html.replace(codeBlockRegex, (match, lang, code) => {
        return `
          <div class="code-container">
            <div class="code-header">
              <span>${lang}</span>
              <button class="copy-btn">Copy</button>
            </div>
            <pre><code class="language-${lang}">${code}</code></pre>
          </div>
        `;
      });

      const genericCodeBlockRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
      html = html.replace(genericCodeBlockRegex, (match, code) => {
        return `
          <div class="code-container">
            <div class="code-header">
              <span>code</span>
              <button class="copy-btn">Copy</button>
            </div>
            <pre><code>${code}</code></pre>
          </div>
        `;
      });

      return { __html: html };
    } catch (err) {
      console.error(err);
      return { __html: text };
    }
  };

  // Click handler for capturing "Copy Code" button events in rendered markdown HTML
  const handleContainerClick = (e) => {
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const codeEl = copyBtn.closest(".code-container").querySelector("code");
      if (codeEl) {
        // Decode HTML entities
        const tempEl = document.createElement("textarea");
        tempEl.innerHTML = codeEl.innerHTML;
        navigator.clipboard.writeText(tempEl.value);

        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied!";
        copyBtn.style.color = "#818cf8";
        setTimeout(() => {
          copyBtn.innerText = originalText;
          copyBtn.style.color = "";
        }, 2000);
      }
    }
  };

  // ------------------------------------------------------------------------
  // COMPACT CARD SUB-COMPONENTS
  // ------------------------------------------------------------------------
  const RenderImageGen = ({ msg }) => {
    const [imgLoading, setImgLoading] = useState(true);

    return (
      <div className="image-gen-card">
        {imgLoading && (
          <div className="image-gen-loader">
            <div className="spinner"></div>
            <p>Generating art via Pollinations AI...</p>
          </div>
        )}
        <div className="image-gen-display" style={{ display: imgLoading ? "none" : "block" }}>
          <img 
            src={msg.imageUrl} 
            alt={msg.imagePrompt} 
            onLoad={() => setImgLoading(false)} 
            onError={() => setImgLoading(false)} 
          />
          <div className="image-overlay-actions">
            <button 
              className="image-action-btn" 
              onClick={() => window.open(msg.imageUrl, "_blank")} 
              title="Open in new tab"
            >
              ↗
            </button>
            <button 
              className="image-action-btn" 
              onClick={() => handleDownloadImage(msg.imageUrl, msg.imagePrompt)} 
              title="Download image"
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------------
  // LAYOUT RENDER (DYNAMIC BY MODE)
  // ------------------------------------------------------------------------
  
  // Render sidebar panel
  const renderSidebarMarkup = () => (
    <div className={`sidebar ${sidebarOpen ? "mobile-open" : "collapsed"}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <span>+</span> New Chat
        </button>
        <button 
          className="sidebar-toggle-inner" 
          onClick={() => setSidebarOpen(false)}
          title="Collapse sidebar"
        >
          ✕
        </button>
      </div>

      <div className="threads-list">
        {threads.map((t) => (
          <div 
            key={t.id} 
            className={`thread-item ${t.id === activeThreadId ? "active" : ""}`}
            onClick={() => {
              setActiveThreadId(t.id);
              setSidebarOpen(false); // close drawer on mobile selection
            }}
          >
            <div className="thread-info">
              <span className="thread-icon">💬</span>
              <span className="thread-title">{t.title}</span>
            </div>
            <button 
              className="delete-thread-btn" 
              onClick={(e) => handleDeleteThread(t.id, e)}
              title="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-accent)' }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--bg-accent)" fillOpacity="0.2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>Nova AI</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dark)" }}>Connected</div>
          </div>
        </div>
        <button className="clear-storage-btn" onClick={handleResetAllStorage}>
          Clear All Threads
        </button>
      </div>
    </div>
  );

  // Render chat feed and input
  const renderChatContainerMarkup = () => (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header-v2">
        <div className="header-left">
          {isMaximized && !sidebarOpen && (
            <button 
              className="menu-toggle-btn" 
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              ☰
            </button>
          )}
          <div className="chat-title-container">
            <h3 className="chat-title-display">{activeThread.title}</h3>
           <span className="chat-subtitle">Gemini 3.1 Flash Lite • Multimodal</span>
          </div>
        </div>

        <div className="header-right">
          {/* Global voice reply toggle */}
          <button 
            className={`header-btn ${voiceReplyEnabled ? "active-accent" : ""}`}
            onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
            title={voiceReplyEnabled ? "Voice reply enabled" : "Voice reply muted"}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {voiceReplyEnabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
            {voiceReplyEnabled ? "Read aloud" : "Muted"}
          </button>

          {/* Export dropdown */}
          <div className="export-dropdown" ref={exportDropdownRef}>
            <button className="header-btn" onClick={() => setExportOpen(!exportOpen)} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
              Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button className="export-option" onClick={() => handleExport("markdown")}>Markdown (.md)</button>
                <button className="export-option" onClick={() => handleExport("json")}>JSON (.json)</button>
                <button className="export-option" onClick={() => handleExport("txt")}>Plain Text (.txt)</button>
              </div>
            )}
          </div>

          {/* Clear Messages */}
          <button 
            className="header-btn text-danger" 
            onClick={handleClearCurrentMessages}
            title="Clear conversation"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
            </svg>
            Clear
          </button>

          {/* Toggle Theme (Dark <-> Light) */}
          <button 
            className="header-btn" 
            onClick={handleToggleTheme} 
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {/* Toggle Maximize (Dashboard <-> Widget) */}
          <button 
            className="header-btn" 
            onClick={onToggleMaximize} 
            title={isMaximized ? "Minimize to widget" : "Maximize to dashboard"}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {isMaximized ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <rect x="8" y="8" width="14" height="14" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            )}
            {isMaximized ? "Restore" : "Maximize"}
          </button>

          {/* Close */}
          <button 
            className="header-btn" 
            onClick={onClose} 
            title="Close Chat"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="messages-feed" onClick={handleContainerClick}>
        <div className="messages-list-inner">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className="message-avatar" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {msg.role === "user" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-accent)' }}>
                    <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--bg-accent)" fillOpacity="0.2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                )}
              </div>

              <div className="message-content-box">
                <div className="message-bubble-v2">
                  {/* File Attachment Render inside bubble */}
                  {msg.attachment && (
                    <>
                      {msg.attachment.mimeType.startsWith("image/") ? (
                        <img 
                          className="message-inline-img" 
                          src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                          alt={msg.attachment.name} 
                        />
                      ) : (
                        <div className="attachment-card">
                          <span className="attachment-icon">📄</span>
                          <div className="attachment-details">
                            <div className="attachment-name" title={msg.attachment.name}>{msg.attachment.name}</div>
                            <div className="attachment-size">{msg.attachment.size}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Render Image Gen vs Markdown */}
                  {msg.isImage ? (
                    <RenderImageGen msg={msg} />
                  ) : (
                    <div className="markdown-body" dangerouslySetInnerHTML={parseMarkdown(msg.text)} />
                  )}
                </div>

                {/* Per-message Speech Toggle for assistant */}
                {msg.role === "model" && !msg.isImage && !msg.error && (
                  <div className="message-meta">
                    <button 
                      className={`tts-btn ${speakingIndex === i ? "active" : ""}`}
                      onClick={() => handleToggleSpeech(msg.text, i)}
                      title={speakingIndex === i ? "Stop reading" : "Read message aloud"}
                    >
                      {speakingIndex === i ? "🛑 Stop" : "🔊 Speak"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {messages.length === 1 && messages[0].role === "model" && !isLoading && (
            <div className="quick-start-container animate-fade-in">
              <h4 className="quick-start-title">How can I help you today?</h4>
              <div className="quick-start-grid">
                <div 
                  className={`quick-start-card ${activeCategory === "coding" ? "active" : ""}`}
                  onClick={() => setActiveCategory("coding")}
                >
                  <span className="card-emoji">💻</span>
                  <div className="card-info">
                    <h5>Coding Assistant</h5>
                    <p>Write clean code, translate languages, build apps</p>
                  </div>
                </div>
                <div 
                  className={`quick-start-card ${activeCategory === "debugging" ? "active" : ""}`}
                  onClick={() => setActiveCategory("debugging")}
                >
                  <span className="card-emoji">🐛</span>
                  <div className="card-info">
                    <h5>Code Debugger</h5>
                    <p>Analyze console logs, trace errors, optimize logic</p>
                  </div>
                </div>
                <div 
                  className={`quick-start-card ${activeCategory === "image" ? "active" : ""}`}
                  onClick={() => setActiveCategory("image")}
                >
                  <span className="card-emoji">🎨</span>
                  <div className="card-info">
                    <h5>AI Art Studio</h5>
                    <p>Generate beautiful visual designs and assets</p>
                  </div>
                </div>
                <div 
                  className={`quick-start-card ${activeCategory === "study" ? "active" : ""}`}
                  onClick={() => setActiveCategory("study")}
                >
                  <span className="card-emoji">📚</span>
                  <div className="card-info">
                    <h5>Study Hub</h5>
                    <p>Create flashcards, summarize guides, prep quizzes</p>
                  </div>
                </div>
              </div>

              {activeCategory && (
                <div className="suggestions-container animate-fade-in">
                  <div className="suggestions-header">
                    <span>Suggested Questions:</span>
                  </div>
                  <div className="suggestions-list">
                    {categorySuggestions[activeCategory].map((sug, idx) => (
                      <button 
                        key={idx} 
                        className="suggestion-pill"
                        onClick={() => handleSend(sug.prompt)}
                      >
                        <span className="sug-label">{sug.label}</span>
                        <span className="sug-arrow">➔</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="message-wrapper model">
              <div className="message-avatar" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-accent)' }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--bg-accent)" fillOpacity="0.2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="message-content-box">
                <div className="message-bubble-v2" style={{ fontStyle: "italic", opacity: 0.7 }}>
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Footer Input Area */}
      <div className="chat-input-area">
        <div className="input-container-inner">
          
          {/* Previews of attached files ready to send */}
          {attachment && (
            <div className="attachment-preview-strip">
              <div className="preview-pill">
                {attachment.mimeType.startsWith("image/") ? (
                  <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt="preview" />
                ) : (
                  <span>📄</span>
                )}
                <span className="preview-pill-name" title={attachment.name}>{attachment.name}</span>
                <button className="remove-preview-btn" onClick={handleRemoveAttachment}>✕</button>
              </div>
            </div>
          )}

          {/* Input field and actions */}
          <div className="rich-input-wrapper">
            
            {/* Attachment Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleFileChange}
              accept="image/*,application/pdf,text/*,application/json"
            />
            <button 
              className="input-action-btn" 
              onClick={triggerFileSelect}
              title="Attach File (Image, PDF, Text)"
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* AI Image Generation Shortcut */}
            <button 
              className="input-action-btn" 
              onClick={() => {
                setInput("/image ");
                textareaRef.current?.focus();
              }}
              title="Generate AI Image"
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
                <path d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904Z" />
                <path d="M19.071 4.929l-.353 2.121-.354-2.121-2.121-.354 2.121-.353.354-2.121.353 2.121 2.121.353-2.121.354Z" />
              </svg>
            </button>

            {/* Microphone Voice Input */}
            <button 
              className={`input-action-btn ${isListening ? "active-mic" : ""}`}
              onClick={handleMicClick}
              title={isSupported ? "Voice Input" : "Voice input not supported on this browser"}
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="svg-icon">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>

            {/* Speech Wave Visualizer when mic listening */}
            {isListening ? (
              <div className="speech-wave-container" style={{ flex: 1 }}>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "12px" }}>Listening... Speak now</span>
              </div>
            ) : (
              <textarea 
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or use /image <prompt>..."
                rows={1}
                disabled={isLoading}
              />
            )}

            {/* Send Button */}
            <button 
              className="send-message-btn" 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && !attachment)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon send-icon-svg">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="input-footer-caption">
            Press Enter to Send, Shift+Enter for New Line
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMaximized ? (
        <div className={`workspace-container ${theme}-theme`}>
          {/* Sidebar Backdrop for mobile drawer toggle */}
          {sidebarOpen && (
            <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
          )}
          {renderSidebarMarkup()}
          {renderChatContainerMarkup()}
        </div>
      ) : (
        <div className={`widget-mode-container ${theme}-theme`}>
          {renderChatContainerMarkup()}
        </div>
      )}
    </>
  );
}

export default ChatWindow;
