import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AttackTheater } from '../components/attack/AttackTheater';
import './AttackSimulation.css';

const API_URL = import.meta.env.VITE_API_URL || '${API_URL}';

interface AttackType {
  id: string;
  name: string;
  description: string;
  icon: string;
  severity: string;
  duration: string;
}

const AttackSimulation: React.FC = () => {
  const { orgSlug, projectSlug } = useParams();
  const navigate = useNavigate();
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [simulationId, setSimulationId] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const attackTypes: AttackType[] = [
    {
      id: 'prompt_injection',
      name: 'Prompt Injection',
      description: 'Simulate adversarial prompts attempting to bypass LLM safety guardrails and extract sensitive information',
      icon: '💉',
      severity: 'Critical',
      duration: '~15 seconds'
    },
    {
      id: 'model_poisoning',
      name: 'Model Poisoning',
      description: 'Simulate backdoor injection into training pipeline to compromise model integrity',
      icon: '☠️',
      severity: 'Critical',
      duration: '~20 seconds'
    },
    {
      id: 'rag_poisoning',
      name: 'RAG Context Poisoning',
      description: 'Simulate malicious document injection into vector database to manipulate RAG responses',
      icon: '🗂️',
      severity: 'High',
      duration: '~15 seconds'
    }
  ];

  const startSimulation = async (attackType: string) => {
    setIsStarting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Get all projects and find by slug
      const projectsResponse = await fetch(`${API_URL}/api/v1/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = await projectsResponse.json();
      
      const project = projectsData.find((p: any) => 
        p.project_name.toLowerCase().replace(/\s+/g, '-') === projectSlug
      );
      
      if (!project) {
        alert('Project not found');
        return;
      }
      
      const simResponse = await fetch(`${API_URL}/api/v1/attack-simulation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: project.id,
          attack_type: attackType,
          target_config: {}
        })
      });

      const data = await simResponse.json();
      setSimulationId(data.id);
      setSelectedAttack(attackType);
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Failed to start attack simulation');
    } finally {
      setIsStarting(false);
    }
  };

  const handleComplete = (_results: any[]) => {
    // Attack simulation completed - results are displayed in the UI
  };

  const resetSimulation = () => {
    setSelectedAttack(null);
    setSimulationId(null);
  };

  return (
    <DashboardLayout>
      <div className="attack-simulation-content">
        <div className="attack-simulation-header">
          <div>
            <h1>🎯 Live Attack Simulation</h1>
            <p>Simulate real-world attacks on your AI systems in a safe sandbox environment</p>
          </div>
          {selectedAttack && (
            <button className="btn-reset" onClick={resetSimulation}>
              ← Back to Attack Types
            </button>
          )}
        </div>

        {!selectedAttack ? (
          <div className="attack-types-grid">
            {attackTypes.map((attack) => (
              <div key={attack.id} className="attack-card">
                <div className="attack-card-header">
                  <span className="attack-icon">{attack.icon}</span>
                  <div>
                    <h3>{attack.name}</h3>
                    <div className="attack-meta">
                      <span className={`severity-badge ${attack.severity.toLowerCase()}`}>
                        {attack.severity}
                      </span>
                      <span className="duration-badge">{attack.duration}</span>
                    </div>
                  </div>
                </div>
                
                <p className="attack-description">{attack.description}</p>
                
                <button
                  className="btn-simulate"
                  onClick={() => startSimulation(attack.id)}
                  disabled={isStarting}
                >
                  {isStarting ? 'Starting...' : '⚡ Simulate Attack'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="attack-theater-container">
            {simulationId && (
              <AttackTheater
                simulationId={simulationId}
                attackType={selectedAttack}
                onComplete={handleComplete}
              />
            )}
          </div>
        )}

        {!selectedAttack && (
          <div className="attack-info-section">
            <div className="info-card">
              <h3>🛡️ Safe & Isolated</h3>
              <p>All attacks run in isolated Docker containers - your production systems are never touched</p>
            </div>
            <div className="info-card">
              <h3>📊 Real-Time Visualization</h3>
              <p>Watch attacks unfold in real-time with Matrix-style terminal and detailed step-by-step analysis</p>
            </div>
            <div className="info-card">
              <h3>📋 Detailed Reports</h3>
              <p>Get comprehensive attack reports with proof-of-concept exploits and remediation guidance</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttackSimulation;
