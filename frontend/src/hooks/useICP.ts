import { useState, useEffect } from 'react';
import { ICPConfig } from '../types';

const STORAGE_KEY = 'acq_fit_icp_config';

const DEFAULT_CONFIG: ICPConfig = {
  target_industries: [],
  target_locations: [],
  min_employees: null,
  max_employees: null,
  min_revenue: null,
  max_revenue: null,
  min_years: null,
  max_years: null,
  decision_maker_preferred: true,
  website_preferred: true,
  exclusion_keywords: []
};

export function useICP() {
  const [config, setConfig] = useState<ICPConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load ICP config from localStorage', e);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save ICP config to localStorage', e);
    }
  }, [config]);

  const saveConfig = (newConfig: Partial<ICPConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return {
    config,
    saveConfig,
    resetConfig
  };
}
