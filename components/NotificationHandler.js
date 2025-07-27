import React, { useEffect, useRef } from 'react';
import PushNotification from 'react-native-push-notification';
import BackgroundFetch from 'react-native-background-fetch';
import { mqttData } from './mqtt'; // Ensure the correct path

PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  popInitialNotification: true,
  requestPermissions: true,
});

const NotificationHandler = () => {
  const previousDetectionsRef = useRef(mqttData.nDetections); // Initialize the ref with the current nDetections value
  const lastReminderTimestampRef = useRef(0); // Initialize the ref to store the last reminder timestamp

  useEffect(() => {
    // Initialize BackgroundFetch
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Attempt to fetch every 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      async (taskId) => {
        console.log("[BackgroundFetch] taskId: ", taskId);

        // Fetch your MQTT data and handle notifications
        checkConditions();

        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.log("[BackgroundFetch] Failed to start", error);
      }
    );

    BackgroundFetch.start();

    const checkConditions = () => {
      console.log('Checking conditions for notifications...');
      console.log('mqttData:', mqttData); // Check what data is being received

      const currentDetections = mqttData.nDetections;
      const previousDetections = previousDetectionsRef.current;
      const now = Date.now();
      console.log('current:', currentDetections);
      console.log('previous:', previousDetections);

      if (mqttData.intruder == 1 && currentDetections > previousDetections) {
        console.log('intruder:', mqttData.intruder);
        PushNotification.localNotification({
          title: 'Alert',
          message: 'Intruder detected',
        });
      }

      if (mqttData.isLightOn == 0 && mqttData.stateAlarm == 0 && mqttData.IsNight == 1) {
        const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;
        if (now - lastReminderTimestampRef.current >= twoHoursInMilliseconds) {
          PushNotification.localNotification({
            title: 'Reminder',
            message: "It seems that you are home and it's dark outside. Do you want to turn on the lights?",
          });
          lastReminderTimestampRef.current = now; // Update the last reminder timestamp
        }
      }

      // Update the previous detections reference
      previousDetectionsRef.current = currentDetections;
    };

    const intervalId = setInterval(checkConditions, 3000); // Check conditions every 5 seconds

    return () => {
      clearInterval(intervalId);
      BackgroundFetch.stop();
    };
  }, []);

  return null; // This component does not render anything
};

export default NotificationHandler;