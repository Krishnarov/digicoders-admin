import { useState, useCallback } from 'react';

// Custom hook for managing loading states
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [loadingKey, setLoadingKey] = useState('');

  const startLoading = useCallback((key = '') => {
    setLoading(true);
    setLoadingKey(key);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingKey('');
  }, []);

  const isLoading = useCallback((key = '') => {
    return loading && (key === '' || loadingKey === key);
  }, [loading, loadingKey]);

  return {
    loading,
    loadingKey,
    startLoading,
    stopLoading,
    isLoading,
  };
};

// Custom hook for managing multiple loading states
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    clearAllLoading,
  };
};

// Custom hook for async operations with loading
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    execute,
  };
};