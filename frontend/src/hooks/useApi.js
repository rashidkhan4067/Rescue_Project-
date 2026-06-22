import { useState, useCallback } from 'react';

/**
 * ⚡ Universal API Operation coordinator
 * Automates loading flag, error messages, and response payload mapping.
 */
export function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'An unexpected error occurred';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute, setData };
}
