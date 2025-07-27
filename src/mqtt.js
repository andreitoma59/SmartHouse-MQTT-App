import MQTT from 'sp-react-native-mqtt';

const mqttData = {
  stateAlarm: null,
  nDetections: null,
  co2ppm: null,
  windowIsOpen: null,
  tempDHT: null,
  humDHT: null,
  IsNight: null,
  GasAlarm:null,
  luxVal:null,
  intruder:null,
  gasLeak:null,
  current1:null,
  current2:null,
  current3:null,
  isLightOn:null
};


export function setupMQTTClient() {
  return MQTT.createClient({
    uri: 'mqtt://rpi-toma.go.ro:1883', // Ensure the URI is correct. MQTT usually uses `mqtt://` or `mqtts://` protocol.
    user: "toma",
    pass: "120q",
    auth: true,
    keepalive: 60, // Assuming a keepalive value, it needs to be defined
  }).then(function(client) {

    client.on('closed', function() {
      console.log('mqtt.event.closed');
    });

    client.on('error', function(msg) {
      console.log('mqtt.event.error', msg);
    });

    client.on('message', function(msg) {
      // console.log('mqtt.event.message', msg);
      // Assuming msg.topic and msg.data hold the relevant information
      if (mqttData.hasOwnProperty(msg.topic)) {
        // Update the corresponding value in mqttData
        mqttData[msg.topic] = msg.data;
      }
      if (msg.topic && msg.topic === "tempDHT") {
        // Convert the string to an integer
        const tempValue = parseInt(msg.data, 10);
        mqttData.tempDHT = tempValue;
      }
      if (msg.topic && msg.topic === "humDHT") {
        // Convert the string to an integer
        const humValue = parseInt(msg.data, 10);
        mqttData.humDHT = humValue;
      }
      // console.log(mqttData.stateAlarm);
      // console.log(mqttData.tempDHT);
    });
    client.on('connect', function() {
      console.log('connected');
      client.subscribe('stateAlarm',1);
      client.subscribe("nDetections",1);
      client.subscribe("co2ppm",1);
      client.subscribe("windowIsOpen",1);
      client.subscribe("tempDHT",1);
      client.subscribe("humDHT",1);
      client.subscribe("IsNight",1);
      client.subscribe("GasAlarm",1)
      client.subscribe("luxVal",1)
      client.subscribe("intrude",1)
      client.subscribe("current1",1)
      client.subscribe("current2",1)
      client.subscribe("current3",1)
      client.subscribe("isLightOn",1)
    });

    client.connect();
    return client; // This ensures that the connected client is the resolved value of the promise
  }).catch(function(err){
    console.log(err);
    throw err; // Rethrow or handle as appropriate for your application
  });
}
export { mqttData };
