import { useState, useEffect } from 'react';
import { Item, Purchase } from '../types/types';

export const useDataSync = (interval = 5000) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const checkForUpdates = () => {
      const currentData = {
        listings: JSON.parse(localStorage.getItem('listings') || '[]'),
        purchases: JSON.parse(localStorage.getItem('purchases') || '[]')
      };

      // Update state in components that use this data
      window.dispatchEvent(new CustomEvent('datastoreUpdate', { 
        detail: currentData 
      }));
      
      setLastUpdate(Date.now());
    };

    // Check for updates every X seconds
    const intervalId = setInterval(checkForUpdates, interval);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [interval]);

  return lastUpdate;
}; 