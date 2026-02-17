import React, { createContext, useContext } from 'react';
import { useVersionCheck } from '../hooks/useVersionCheck';

const VersionCheckContext = createContext(null);

export const VersionCheckProvider = ({ children }) => {
  const versionCheck = useVersionCheck();
  
  console.log('🏭 VersionCheckProvider rendered - updateInfo:', !!versionCheck.updateInfo, 'showModal:', versionCheck.showModal);
  
  return (
    <VersionCheckContext.Provider value={versionCheck}>
      {children}
    </VersionCheckContext.Provider>
  );
};

export const useVersionCheckContext = () => {
  const context = useContext(VersionCheckContext);
  if (!context) {
    throw new Error('useVersionCheckContext must be used within VersionCheckProvider');
  }
  return context;
};
