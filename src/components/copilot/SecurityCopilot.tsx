import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PiCodesandboxLogoLight } from 'react-icons/pi';
import { FiCopy, FiCheck, FiTrash2, FiUser, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import './SecurityCopilot.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_KEY = 'nexula_copilot_messages';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelUsed?: string;
}

export const SecurityCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restored = parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(restored);
        if (restored.length > 0) {
          const lastAssistant = [...restored].reverse().find((m: Message) => m.role === 'assistant');
          if (lastAssistant?.modelUsed) {
            setCurrentModel(lastAssistant.modelUsed);
          }
        }
      } catch {
        // Invalid storage, ignore
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentModel('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;

      // Extract context from URL
      const pathParts = currentPath.split('/');
      const context: Record<string, string | number> = {};

      if (pathParts.includes('projects')) {
        const projectIndex = pathParts.indexOf('projects') + 1;
        if (pathParts[projectIndex]) context.project_slug = pathParts[projectIndex];
      }

      if (pathParts.includes('scans')) {
        const scanIndex = pathParts.indexOf('scans') + 1;
        if (pathParts[scanIndex]) context.scan_id = parseInt(pathParts[scanIndex]);
      }

      const response = await fetch(`${API_URL}/api/v1/copilot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          context
        }),
      });

      const data = await response.json();
      const modelUsed = data.model_used || 'AI';
      setCurrentModel(modelUsed);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        modelUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  const getModelDisplayName = (model: string): string => {
    if (model.toLowerCase().includes('nexula')) return 'Nexula-8B';
    if (model.toLowerCase().includes('gpt-4')) return 'GPT-4o';
    if (model.toLowerCase().includes('gpt')) return 'GPT-4o';
    return model || 'AI';
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <>
          <div className="copilot-label">
            AI/ML Copilot
            <span className="copilot-shortcut">⌘K</span>
          </div>
          <button
            className="copilot-fab"
            onClick={() => setIsOpen(true)}
            aria-label="AI Security Copilot (Press Ctrl+K)"
          >
            <PiCodesandboxLogoLight size={32} />
          </button>
        </>
      )}

      {/* Slide-up Panel */}
      <div className={`copilot-panel ${isOpen ? 'open' : ''}`}>
        <div className="copilot-header">
          <div className="copilot-title">
            <PiCodesandboxLogoLight size={36} />
            <div>
              <h3>AI Security Copilot</h3>
              <p>Ask me anything about your security</p>
            </div>
          </div>
          <div className="copilot-header-actions">
            {currentModel && (
              <span className="copilot-model-badge">
                <FiCpu size={12} />
                {getModelDisplayName(currentModel)}
              </span>
            )}
            {messages.length > 0 && (
              <button
                className="copilot-clear"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <FiTrash2 size={16} />
              </button>
            )}
            <button className="copilot-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>
        </div>

        <div className="copilot-messages">
          {messages.length === 0 && (
            <div className="copilot-welcome">
              <div className="copilot-welcome-icon">
                <PiCodesandboxLogoLight size={48} />
              </div>
              <h4>Hi! I'm your AI Security Copilot</h4>
              <p>I can help you understand vulnerabilities, generate fixes, and improve your security posture.</p>
              <div className="copilot-suggestions">
                <button onClick={() => handleSuggestionClick('Why is this CVE critical for my ML model?')}>
                  <span className="suggestion-icon">🔍</span>
                  Why is this CVE critical?
                </button>
                <button onClick={() => handleSuggestionClick('How do I fix this LangChain vulnerability?')}>
                  <span className="suggestion-icon">🔧</span>
                  How do I fix this vulnerability?
                </button>
                <button onClick={() => handleSuggestionClick('Generate a security policy for my AI app')}>
                  <span className="suggestion-icon">📋</span>
                  Generate security policy
                </button>
                <button onClick={() => handleSuggestionClick('What are the top security risks in my project?')}>
                  <span className="suggestion-icon">⚠️</span>
                  Top security risks
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`copilot-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? (
                  <FiUser size={16} />
                ) : (
                  <PiCodesandboxLogoLight size={18} />
                )}
              </div>
              <div className="message-wrapper">
                <div className="message-header">
                  <span className="message-sender">
                    {msg.role === 'user' ? 'You' : 'Copilot'}
                  </span>
                  <span className="message-time">{formatRelativeTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const isBlock = className?.includes('language-');
                        return isBlock ? (
                          <pre className="md-code-block">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="md-inline-code" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre({ children }) {
                        return <>{children}</>;
                      },
                      p({ children }) {
                        return <p className="md-paragraph">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="md-list">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="md-list md-list-ordered">{children}</ol>;
                      },
                      li({ children }) {
                        return <li className="md-list-item">{children}</li>;
                      },
                      h1({ children }) {
                        return <h1 className="md-heading md-h1">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="md-heading md-h2">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="md-heading md-h3">{children}</h3>;
                      },
                      h4({ children }) {
                        return <h4 className="md-heading md-h4">{children}</h4>;
                      },
                      blockquote({ children }) {
                        return <blockquote className="md-blockquote">{children}</blockquote>;
                      },
                      hr() {
                        return <hr className="md-hr" />;
                      },
                      table({ children }) {
                        return <table className="md-table">{children}</table>;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'assistant' && (
                  <div className="message-actions">
                    <button
                      className={`action-btn ${copiedId === msg.id ? 'copied' : ''}`}
                      onClick={() => handleCopy(msg.content, msg.id)}
                      title="Copy to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <FiCheck size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <FiCopy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    {msg.modelUsed && (
                      <span className="message-model">
                        {getModelDisplayName(msg.modelUsed)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="copilot-message assistant">
              <div className="message-avatar">
                <PiCodesandboxLogoLight size={18} />
              </div>
              <div className="message-wrapper">
                <div className="message-header">
                  <span className="message-sender">Copilot</span>
                  <span className="message-time">Thinking...</span>
                </div>
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="copilot-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about security, vulnerabilities, fixes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
