import React, { createContext, useState, useEffect } from 'react';
import { setupMQTTClient } from './mqtt'; // Adjust the path as necessary

// Create a Context
export const MQTTContext = createContext();

export const MQTTProvider = ({ children }) => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    setupMQTTClient()
      .then(setClient)
      .catch((error) => console.error('Failed to setup MQTT client:', error));
  }, []);

  return (
    <MQTTContext.Provider value={client}>
      {children}
    </MQTTContext.Provider>
  );
};
