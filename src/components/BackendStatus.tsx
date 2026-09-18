/**
 * Backend Status Component
 * 
 * Displays backend connection status.
 * This is optional and can be hidden/shown as needed.
 */

import { useState, useEffect } from 'react';
import { getAnalysisStatus, getCoachStatus } from '../api';

interface BackendStatusProps {
  visible?: boolean;
}

export function BackendStatus({ visible = false }: BackendStatusProps) {
  const [analysisStatus, setAnalysisStatus] = useState<string>('checking');
  const [coachStatus, setCoachStatus] = useState<string>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const checkStatus = async () => {
      try {
        const [analysis, coach] = await Promise.all([
          getAnalysisStatus(),
          getCoachStatus(),
        ]);
        setAnalysisStatus(analysis.status);
        setCoachStatus(coach.status);
        setError(null);
      } catch (err) {
        setError('Backend unavailable');
        setAnalysisStatus('offline');
        setCoachStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      padding: '8px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
    }}>
      <div style={{ marginBottom: '4px' }}>
        <strong>Backend Status</strong>
      </div>
      <div>
        Analysis: <span style={{ color: analysisStatus === 'not_implemented' ? '#ffa500' : analysisStatus === 'offline' ? '#ff4444' : '#44ff44' }}>
          {analysisStatus}
        </span>
      </div>
      <div>
        Coach: <span style={{ color: coachStatus === 'not_implemented' ? '#ffa500' : coachStatus === 'offline' ? '#ff4444' : '#44ff44' }}>
          {coachStatus}
        </span>
      </div>
      {error && (
        <div style={{ color: '#ff4444', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
