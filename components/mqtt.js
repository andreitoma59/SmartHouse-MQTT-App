import MQTT from 'sp-react-native-mqtt';
import { PushNotification } from 'react-native-push-notification';

const mqttData = {
  stateAlarm: null,
  nDetections: null,
  co2ppm: null,
  windowIsOpen: null,
  tempDHT: null,
  humDHT: null,
  IsNight: null,
  GasAlarm: null,
  luxVal: null,
  intruder: null,
  gasLeak: null,
  current1: null,
  current2: null,
  current3: null,
  isLightOn: null,
};

export function setupMQTTClient() {
  return MQTT.createClient({
    uri: 'mqtt://192.168.0.101:1883',
    user: "toma",
    pass: "120q",
    auth: true,
    keepalive: 60,
  }).then(function (client) {

    client.on('closed', function () {
      console.log('mqtt.event.closed');
    });

    client.on('error', function (msg) {
      console.log('mqtt.event.error', msg);
    });

    client.on('message', function (msg) {
      const topic = msg.topic;
      const data = msg.data;
      if (mqttData.hasOwnProperty(topic)) {
        mqttData[topic] = data === 'true' ? true : data === 'false' ? false : data;
      }

      if (topic === "tempDHT") {
        mqttData.tempDHT = parseInt(data, 10);
      }
      if (topic === "humDHT") {
        mqttData.humDHT = parseInt(data, 10);
      }
    });

    client.on('connect', function () {
      console.log('connected');
      client.subscribe('stateAlarm', 1);
      client.subscribe("nDetections", 1);
      client.subscribe("co2ppm", 1);
      client.subscribe("windowIsOpen", 1);
      client.subscribe("tempDHT", 1);
      client.subscribe("humDHT", 1);
      client.subscribe("IsNight", 1);
      client.subscribe("GasAlarm", 1);
      client.subscribe("luxVal", 1);
      client.subscribe("intruder", 1);
      client.subscribe("current1", 1);
      client.subscribe("current2", 1);
      client.subscribe("current3", 1);
      client.subscribe("isLightOn", 1);
    });

    client.connect();
    return client;
  }).catch(function (err) {
    console.log(err);
    throw err;
  });
}

export { mqttData };