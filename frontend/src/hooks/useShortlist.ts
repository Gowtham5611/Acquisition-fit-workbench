import { useState, useEffect, useCallback } from 'react';
import { Lead } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export function useShortlist() {
  const [shortlist, setShortlist] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShortlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await api.getShortlist();
      setShortlist(items);
    } catch (err) {
      console.error('Failed to load shortlist', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  const toggleShortlist = async (leadId: number, currentlyShortlisted: boolean) => {
    try {
      if (currentlyShortlisted) {
        await api.removeFromShortlist(leadId);
        toast.success('Removed from shortlist');
      } else {
        await api.addToShortlist(leadId);
        toast.success('Added to shortlist');
      }
      await fetchShortlist();
      return !currentlyShortlisted;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shortlist');
      return currentlyShortlisted;
    }
  };

  const isShortlisted = (leadId: number) => {
    return shortlist.some(l => l.id === leadId);
  };

  return {
    shortlist,
    shortlistCount: shortlist.length,
    isLoading,
    fetchShortlist,
    toggleShortlist,
    isShortlisted
  };
}
