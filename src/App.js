import React from 'react';
import { createAppContainer } from 'react-navigation';

import { MQTTProvider } from './components/mqttContext'; // Adjust the path as necessary
import TabNavigator from './navigation/Smarthome';

const AppContainer = createAppContainer(TabNavigator);

export default function App() {
  return (
    <MQTTProvider>
      <AppContainer />
    </MQTTProvider>
  );
}