"use client";

import { useState } from 'react';
import type { ClockStatus, ApiResponse, StatusResponse } from '@/type';

interface ClockButtonsProps {
  personId: number;
  initialStatus?: ClockStatus;
  onStatusChange?: (status: ClockStatus) => void;
}

const ClockButtons: React.FC<ClockButtonsProps> = ({
  personId,
  initialStatus = 'clocked_out',
  onStatusChange,
}) => {
  const [status, setStatus] = useState<ClockStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClock = async (action: 'clock-in' | 'clock-out') => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_ID: personId }),
      });
      const json: ApiResponse<StatusResponse> = await res.json();

      if (!res.ok || !json.success) {
        setMessage(json.error ?? 'Something went wrong.');
        return;
      }

      const newStatus: ClockStatus = action === 'clock-in' ? 'clocked_in' : 'clocked_out';
      setStatus(newStatus);
      setMessage(action === 'clock-in' ? '✓ Clocked in successfully!' : '✓ Clocked out successfully!');
      onStatusChange?.(newStatus);
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clock-buttons">
      <button
        className="clock-btn clock-in"
        onClick={() => handleClock('clock-in')}
        disabled={loading || status === 'clocked_in'}
      >
        {loading && status === 'clocked_out' ? 'Clocking in…' : 'Clock In'}
      </button>
      <button
        className="clock-btn clock-out"
        onClick={() => handleClock('clock-out')}
        disabled={loading || status === 'clocked_out'}
      >
        {loading && status === 'clocked_in' ? 'Clocking out…' : 'Clock Out'}
      </button>
      {message && (
        <p className={`clock-message ${message.startsWith('✓') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
      <style>{`
        .clock-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
        .clock-btn {
          padding: 0.65rem 1.25rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .clock-btn:active { transform: scale(0.97); }
        .clock-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .clock-in  { background: #48bb78; color: #0f1117; }
        .clock-out { background: #fc8181; color: #fff; }
        .clock-message { font-size: 0.8rem; margin: 0.25rem 0 0; }
        .clock-message.success { color: #48bb78; }
        .clock-message.error   { color: #fc8181; }
      `}</style>
    </div>
  );
};

export default ClockButtons;

