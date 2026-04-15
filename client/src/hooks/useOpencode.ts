import { useState, useEffect, useCallback } from 'react';

interface UseOpencodeReturn {
  connected: boolean;
  sendPrompt: (content: string, selection?: string) => Promise<string | null>;
  error: string | null;
}

export function useOpencode(): UseOpencodeReturn {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  async function checkConnection() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setConnected(data.status === 'ok');
    } catch {
      setConnected(false);
    }
  }

  const sendPrompt = useCallback(async (content: string, selection?: string): Promise<string | null> => {
    setError(null);
    try {
      const res = await fetch('/api/session/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, selection }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send prompt');
      }
      
      const data = await res.json();
      
      if (data.response?.parts?.[0]?.text) {
        return data.response.parts[0].text;
      }
      
      if (data.response?.content?.[0]?.text) {
        return data.response.content[0].text;
      }
      
      return JSON.stringify(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  return { connected, sendPrompt, error };
}
