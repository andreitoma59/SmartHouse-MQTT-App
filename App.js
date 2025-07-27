import React from 'react';
import { createAppContainer } from 'react-navigation';

import { MQTTProvider } from './components/mqttContext'; // Adjust the path as necessary
import TabNavigator from './navigation/Smarthome';
import NotificationHandler from './components/NotificationHandler'; // Import the new NotificationHandler component

const AppContainer = createAppContainer(TabNavigator);

export default function App() {
  return (
    <MQTTProvider>
      <AppContainer />
      <NotificationHandler />
    </MQTTProvider>
  );
}