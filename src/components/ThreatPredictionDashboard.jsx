import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, Activity, Clock, Target } from 'lucide-react';
import api from '../services/api';

const ThreatPredictionDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [emerging, setEmerging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [predsRes, trendsRes, emergingRes] = await Promise.all([
        api.get('/threat-prediction/predictions?limit=20'),
        api.get('/threat-prediction/trends?limit=5'),
        api.get('/threat-prediction/emerging?limit=10')
      ]);
      
      setPredictions(predsRes.data);
      setTrends(trendsRes.data);
      setEmerging(emergingRes.data);
    } catch (error) {
      console.error('Failed to load threat predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrediction = async (packageName, ecosystem) => {
    try {
      setLoading(true);
      await api.post('/threat-prediction/predict', {
        package_name: packageName,
        ecosystem: ecosystem,
        threat_types: ['typosquatting', 'zero_day_vulnerability', 'supply_chain_attack']
      });
      await loadData();
    } catch (error) {
      console.error('Failed to create prediction:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || colors.medium;
  };

  const getThreatIcon = (type) => {
    const icons = {
      typosquatting: Target,
      zero_day_vulnerability: AlertTriangle,
      supply_chain_attack: Shield,
      package_abandonment: Clock
    };
    return icons[type] || Activity;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Threat Prediction</h1>
          <p className="text-gray-600 mt-1">AI-powered predictive threat intelligence</p>
        </div>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions.filter(p => p.confidence_score > 70).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Threats</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions.filter(p => p.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emerging Threats</p>
              <p className="text-2xl font-bold text-gray-900">{emerging.length}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Active Predictions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {predictions.map((pred) => {
                const Icon = getThreatIcon(pred.threat_type);
                return (
                  <tr 
                    key={pred.prediction_id}
                    onClick={() => setSelectedPrediction(pred)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {pred.threat_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${pred.confidence_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{pred.confidence_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(pred.severity)}`}>
                        {pred.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(pred.predicted_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {pred.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emerging Threats */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Emerging Threats</h2>
        </div>
        <div className="p-6 space-y-4">
          {emerging.map((threat) => (
            <div key={threat.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{threat.threat_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {threat.threat_category} | Growth: {threat.growth_rate}%
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(threat.severity)}`}>
                    {threat.severity}
                  </span>
                  {threat.affected_ecosystems?.map((eco, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {eco}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatPredictionDashboard;
