import React, { useEffect, useState, useRef } from 'react';
import './AttackTheater.css';

interface AttackStep {
  step: number;
  name: string;
  description: string;
  payload: string;
  response: string;
  success: boolean;
  severity: string;
  impact: string;
  timestamp: string;
}

interface AttackTheaterProps {
  simulationId: number;
  attackType: string;
  onComplete: (results: AttackStep[]) => void;
}

export const AttackTheater: React.FC<AttackTheaterProps> = ({ simulationId, attackType, onComplete }) => {
  const [steps, setSteps] = useState<AttackStep[]>([]);
  const [currentStep, setCurrentStep] = useState<AttackStep | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState({ total: 0, successful: 0, critical: 0 });
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:8000/api/v1/attack-simulation/ws/${simulationId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Attack simulation WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'status') {
        console.log('Status:', data.message);
      } else if (data.type === 'step') {
        const step: AttackStep = {
          step: data.data.step_number,
          name: data.data.step_name,
          description: data.data.step_description,
          payload: data.data.payload,
          response: data.data.response,
          success: data.data.success === 1,
          severity: data.data.severity,
          impact: data.data.impact,
          timestamp: data.data.timestamp
        };
        
        setCurrentStep(step);
        setSteps(prev => [...prev, step]);
        
        // Auto-scroll terminal
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, 100);
      } else if (data.type === 'complete') {
        setIsRunning(false);
        setStats({
          total: data.total_steps,
          successful: data.successful_attacks,
          critical: steps.filter(s => s.severity === 'critical' && s.success).length
        });
        onComplete(steps);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [simulationId]);

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: '#00ff00',
      medium: '#ffff00',
      high: '#ff9900',
      critical: '#ff0000'
    };
    return colors[severity as keyof typeof colors] || '#00ff00';
  };

  const getAttackTypeLabel = (type: string) => {
    const labels = {
      prompt_injection: 'Prompt Injection Attack',
      model_poisoning: 'Model Poisoning Attack',
      rag_poisoning: 'RAG Context Poisoning Attack',
      api_exploitation: 'API Exploitation Attack'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="attack-theater">
      {/* Header */}
      <div className="theater-header">
        <div className="theater-title">
          <span className="attack-icon">⚡</span>
          <h2>{getAttackTypeLabel(attackType)}</h2>
          {isRunning && <span className="running-badge">LIVE</span>}
        </div>
        <div className="theater-stats">
          <div className="stat">
            <span className="stat-label">Steps</span>
            <span className="stat-value">{steps.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Successful</span>
            <span className="stat-value success">{steps.filter(s => s.success).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Critical</span>
            <span className="stat-value critical">{steps.filter(s => s.severity === 'critical' && s.success).length}</span>
          </div>
        </div>
      </div>

      {/* Terminal Display */}
      <div className="theater-terminal" ref={terminalRef}>
        <div className="terminal-header">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
          <span className="terminal-title">nexula-attack-simulator</span>
        </div>
        
        <div className="terminal-content">
          {steps.map((step, index) => (
            <div key={index} className="terminal-step">
              <div className="step-header">
                <span className="step-number">[{step.step}]</span>
                <span className="step-name">{step.name}</span>
                <span className={`step-status ${step.success ? 'success' : 'failed'}`}>
                  {step.success ? 'EXPLOITED' : 'BLOCKED'}
                </span>
              </div>
              
              <div className="step-description">{step.description}</div>
              
              <div className="step-details">
                <div className="detail-section">
                  <span className="detail-label">Attack Payload</span>
                  <div className="detail-code">
                    <code>{step.payload}</code>
                  </div>
                </div>
                
                {step.success && (
                  <>
                    <div className="detail-section">
                      <span className="detail-label">Why This Works</span>
                      <div className="detail-content">
                        {step.severity === 'info' && 'Your LLM lacks input validation, allowing reconnaissance of system prompts and configuration.'}
                        {step.severity === 'medium' && 'Insufficient prompt filtering enables instruction override, potentially exposing sensitive logic.'}
                        {step.severity === 'high' && 'Missing safety guardrails allow jailbreak attempts that could bypass content policies.'}
                        {step.severity === 'critical' && 'No privilege separation or SQL injection protection detected in your AI system.'}
                      </div>
                    </div>
                    
                    <div className="detail-section">
                      <span className="detail-label">Business Impact</span>
                      <div className="detail-content">
                        <span className="vulnerability-tag">{step.severity.toUpperCase()}</span>
                        {step.impact}
                      </div>
                    </div>
                    
                    <div className="remediation-box">
                      <div className="remediation-title">🛠️ How to Fix</div>
                      <ul className="remediation-steps">
                        {step.severity === 'info' && (
                          <>
                            <li>Implement input sanitization for all LLM prompts</li>
                            <li>Hide system prompts from user-facing responses</li>
                            <li>Add rate limiting to prevent reconnaissance</li>
                          </>
                        )}
                        {step.severity === 'medium' && (
                          <>
                            <li>Deploy prompt injection filters (e.g., LangChain's PromptGuard)</li>
                            <li>Implement instruction hierarchy with priority levels</li>
                            <li>Use separate system/user prompt contexts</li>
                          </>
                        )}
                        {step.severity === 'high' && (
                          <>
                            <li>Enable content moderation APIs (OpenAI Moderation, Azure Content Safety)</li>
                            <li>Implement multi-layer safety checks before execution</li>
                            <li>Add human-in-the-loop for sensitive operations</li>
                          </>
                        )}
                        {step.severity === 'critical' && (
                          <>
                            <li>Implement role-based access control (RBAC) for AI operations</li>
                            <li>Use parameterized queries to prevent SQL injection</li>
                            <li>Enable audit logging for all privilege escalation attempts</li>
                            <li>Deploy Web Application Firewall (WAF) with AI-specific rules</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </>
                )}
                
                {!step.success && (
                  <div className="detail-section">
                    <span className="detail-label">Security Controls Working</span>
                    <div className="detail-content">
                      ✓ Your security measures successfully blocked this attack vector.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isRunning && currentStep && (
            <div className="terminal-cursor">
              <span className="cursor-blink">▊</span>
              <span className="cursor-text">Executing next attack vector...</span>
            </div>
          )}
          
          {!isRunning && steps.length > 0 && (
            <div className="terminal-complete">
              <div className="complete-banner">
                ═══════════════════════════════════════════════════
              </div>
              <div className="complete-message">
                ⚡ ATTACK SIMULATION COMPLETED
              </div>
              <div className="complete-stats">
                Total Steps: {stats.total} | Successful Exploits: {stats.successful} | Critical Vulnerabilities: {stats.critical}
              </div>
              <div className="complete-banner">
                ═══════════════════════════════════════════════════
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="theater-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(steps.length / 5) * 100}%` }}></div>
          </div>
          <div className="progress-text">Simulating attack vectors...</div>
        </div>
      )}
    </div>
  );
};
