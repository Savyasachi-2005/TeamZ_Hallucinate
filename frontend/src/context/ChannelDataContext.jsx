import { createContext, useContext, useState } from 'react';

const ChannelDataContext = createContext(null);

export const ChannelDataProvider = ({ children }) => {
  const [channelData, setChannelData] = useState(null);
  const [channelUrl, setChannelUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');

  const saveChannelData = (data, url, competitor = '') => {
    setChannelData(data);
    setChannelUrl(url);
    setCompetitorUrl(competitor);
  };

  const clearChannelData = () => {
    setChannelData(null);
    setChannelUrl('');
    setCompetitorUrl('');
  };

  return (
    <ChannelDataContext.Provider value={{
      channelData,
      channelUrl,
      competitorUrl,
      saveChannelData,
      clearChannelData
    }}>
      {children}
    </ChannelDataContext.Provider>
  );
};

export const useChannelData = () => {
  const context = useContext(ChannelDataContext);
  if (!context) {
    throw new Error('useChannelData must be used within a ChannelDataProvider');
  }
  return context;
};
