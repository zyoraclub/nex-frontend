import React, { useState, useRef, useEffect } from 'react';
import { PiCodesandboxLogoLight } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import './SecurityCopilot.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const SecurityCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const context: any = {};
      
      if (pathParts.includes('projects')) {
        const projectIndex = pathParts.indexOf('projects') + 1;
        if (pathParts[projectIndex]) context.project_slug = pathParts[projectIndex];
      }
      
      if (pathParts.includes('scans')) {
        const scanIndex = pathParts.indexOf('scans') + 1;
        if (pathParts[scanIndex]) context.scan_id = parseInt(pathParts[scanIndex]);
      }

      const response = await fetch('http://localhost:8000/api/v1/copilot/chat', {
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Copilot error:', error);
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <>
          <div className="copilot-label">AI/ML Copilot</div>
          <button
            className="copilot-fab"
            onClick={() => setIsOpen(true)}
            aria-label="AI Security Copilot"
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
          <button className="copilot-close" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="copilot-messages">
          {messages.length === 0 && (
            <div className="copilot-welcome">
              <h4>👋 Hi! I'm your AI Security Copilot</h4>
              <p>Try asking:</p>
              <div className="copilot-suggestions">
                <button onClick={() => setInput('Why is this CVE critical for my ML model?')}>
                  Why is this CVE critical?
                </button>
                <button onClick={() => setInput('How do I fix this LangChain vulnerability?')}>
                  How do I fix this vulnerability?
                </button>
                <button onClick={() => setInput('Generate a security policy for my AI app')}>
                  Generate security policy
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`copilot-message ${msg.role}`}>
              <div className="message-content">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="copilot-message assistant">
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="copilot-input">
          <input
            type="text"
            placeholder="Ask about security, vulnerabilities, fixes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}>
            ➤
          </button>
        </div>
      </div>
    </>
  );
};
