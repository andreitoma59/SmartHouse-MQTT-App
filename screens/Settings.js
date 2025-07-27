import React, { Component } from 'react';
import { Alert, StyleSheet, TouchableWithoutFeedback, Switch, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as theme from '../Theme';
import { Block, Text, PanSlider } from '../components';
import mocks from '../settings';

import { mqttData } from '../components/mqtt';
import { MQTTContext } from '../components/mqttContext';

console.log(mqttData);

class Settings extends Component {
  static contextType = MQTTContext;
  static navigationOptions = ({ navigation }) => ({
    headerLeft: () => (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('DashboardTab')}>
        <FontAwesome size={theme.sizes.font * 1.5} color={theme.colors.black} name="arrow-left" />
      </TouchableWithoutFeedback>
    ),
    headerLeftContainerStyle: {
      paddingLeft: theme.sizes.base * 2,
    },
    headerStyle: {
      borderBottomColor: 'transparent',
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      direction: 45,
      speed: 12,
      isAlarmOn: !!parseInt(mqttData.stateAlarm, 10),
      detectionCount: mqttData.nDetections,
      isLightOn: !!parseInt(mqttData.isLightOn, 10),
      isGasAlarmOn: !!parseInt(mqttData.GasAlarm, 10),
      lux: parseInt(mqttData.luxVal, 10),
      lightoutside: !!parseInt(mqttData.IsNight, 10),
      isWindowOpen: !!parseInt(mqttData.windowIsOpen, 10),
      temperature: mqttData.tempDHT,
      co2ppm: mqttData.co2ppm,
      humidity: mqttData.humDHT,
      bulbCurrent: mqttData.current2,
      peltierCurrent: mqttData.current1,
      fanCurrent: mqttData.current3,
    };
  }

  componentDidMount() {
    this.mqttDataListener = setInterval(() => {
      this.setState({
        direction: 45,
        speed: 12,
        isAlarmOn: !!parseInt(mqttData.stateAlarm, 10),
        detectionCount: mqttData.nDetections,
        isLightOn: !!parseInt(mqttData.isLightOn, 10),
        isGasAlarmOn: !!parseInt(mqttData.GasAlarm, 10),
        lux: parseInt(mqttData.luxVal, 10),
        lightoutside: !!parseInt(mqttData.IsNight, 10),
        isWindowOpen: !!parseInt(mqttData.windowIsOpen, 10),
        temperature: mqttData.tempDHT,
        co2ppm: mqttData.co2ppm,
        humidity: mqttData.humDHT,
        bulbCurrent: mqttData.current2,
        peltierCurrent: mqttData.current1,
        fanCurrent: mqttData.current3,
      });
    }, 1000); // Update every second
  }

  toggleSettingAndPublishConditionalMessage = (settingName, mqttTopic, trueStateMessage, falseStateMessage) => {
    const mqttClient = this.context; // Access the MQTT client from context
    const newState = !this.state[settingName];
    const message = newState ? trueStateMessage : falseStateMessage;

    // Toggle the state variable and then publish the message
    this.setState({ [settingName]: newState }, () => {
      if (mqttClient && mqttClient.isConnected()) {
        // Adjusted for sp-react-native-mqtt's publish signature
        mqttClient.publish(mqttTopic, message, 1, false);
        console.log(`Message published to ${mqttTopic}: ${message}`);
      } else {
        console.log('MQTT client is not connected.');
      }
    });
  };

  handleEmergencyPowerDown = () => {
    Alert.alert(
      'Emergency Power Down',
      'If you Power Down you need to press the red button on the Arduino board. Are you sure you want to continue?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            const mqttClient = this.context;
            if (mqttClient && mqttClient.isConnected()) {
              mqttClient.publish('commands', 'x', 1, false);
              console.log('Message published to commands: x');
            } else {
              console.log('MQTT client is not connected.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  renderController() {
    return (
      <Block flex={1} right style={styles.controller}>
        <Block center style={styles.controllerValue}>
          <Text color="white">34</Text>
        </Block>
        <Block flex={0.8} style={[styles.controllerOverlay]} />
      </Block>
    );
  }

  render() {
    const { navigation, settings } = this.props;
    const name = navigation.getParam('name');
    const Icon = settings[name].icon;
    if (name === 'temperature') {
      return (
        <Block flex={1} style={styles.settings}>
          <Block flex={0.5} row style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Block column style={{ marginHorizontal: 20, alignItems: 'center' }}>
              <Icon size={theme.sizes.font * 4} color={theme.colors.gray2} />
              <Block flex={1.2} row style={{ alignItems: 'flex-end' }}>
                <Text h1>{this.state.temperature}</Text>
                <Text h1 size={30} height={80} weight={'600'} spacing={0.1}>
                  °C
                </Text>
              </Block>
              <Text caption>Temperature</Text>
            </Block>
            <Block column style={{ marginHorizontal: 20, alignItems: 'center' }}>
              <Block flex={1.2} row style={{ alignItems: 'flex-end' }}>
                <Text h1>{this.state.humidity}</Text>
                <Text h1 size={30} height={80} weight={'600'} spacing={0.1}>
                  %
                </Text>
              </Block>
              <Text caption>Humidity</Text>
            </Block>
          </Block>
          <Block flex={1} center style={{ paddingTop: theme.sizes.base * 2 }}>
            <Text caption>HVAC Control</Text>
            <PanSlider />
          </Block>
        </Block>
      );
    } else if (name == 'alarm') {
      return (
        <Block flex={1} style={styles.settings}>
          <Block flex={0.5} row>
            <Block column style={{ marginLeft: 20 }}>
              <Icon size={theme.sizes.font * 4} color={theme.colors.gray2} />
              <Block flex={1.2} row style={{ alignItems: 'flex' }}>
                <Text h1 style={this.state.isAlarmOn ? styles.alarmOn : styles.alarmOff}>
                  {this.state.isAlarmOn ? 'ON' : 'OFF'}
                </Text>
              </Block>
              <Block flex={1.9}>
                <Text caption>State Alarm</Text>
              </Block>
            </Block>
            <Block flex={0.7} style={styles.switchContainer}>
              <Switch
                value={this.state.isAlarmOn}
                onValueChange={(value) => {
                  this.toggleSettingAndPublishConditionalMessage('isAlarmOn', 'commands', 'n', 'f');
                  if (value) {
                    Alert.alert("Alarm Status", "Alarm is armed");
                  } else {
                    Alert.alert("Alarm Status", "Alarm is disabled");
                  }
                }}
                trackColor={{ false: "red", true: "green" }}
                thumbColor={this.state.isAlarmOn ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="red"
                style={styles.switch}
              />
            </Block>
          </Block>
          <Block style={styles.detectionContainer}>
            <Text size={20}>Number of Detections:<Text style={styles.detectionText}>{this.state.detectionCount}</Text></Text>
          </Block>
        </Block>
      );
    } else if (name == 'light') {
      return (
        <Block flex={1} style={styles.settings}>
          <Block flex={0.5} row>
            <Block column style={{ marginLeft: 20 }}>
              <Icon size={theme.sizes.font * 4} color={theme.colors.gray2} />
              <Block flex={1.2} row style={{ alignItems: 'flex' }}>
                <Text h1 style={this.state.isLightOn ? styles.lightOn : styles.lightOff}>
                  {this.state.isLightOn ? 'ON' : 'OFF'}
                </Text>
              </Block>
              <Block flex={1}>
                <Text caption>Light</Text>
              </Block>
            </Block>
            <Block flex={0.7} style={styles.switchContainer}>
              <Switch
                value={this.state.isLightOn}
                onValueChange={(value) => {
                  this.toggleSettingAndPublishConditionalMessage('isLightOn', 'commands', 'd', 'e');
                }}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.isLightOn ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                style={styles.switch}
              />
            </Block>
          </Block>
          <Block style={styles.detectionContainer}>
            <Text size={20}>
              Light Outside:
              <Text style={styles.detectionText}>
                {this.state.lightoutside ? 'No' : 'Yes'}
              </Text>
            </Text>
            <View style={{ height: 100 }} />
            <Text size={20}>
              Light Level:
              <Text style={styles.detectionText}>
                {this.state.lux} Lux
              </Text>
            </Text>
          </Block>
        </Block>
      );
    } else if (name == 'gas') {
      return (
        <Block flex={1} style={styles.settings}>
          <Block flex={0.3} row>
            <Block column style={{ marginLeft: 20, marginRight: 20 }}>
              <Icon size={theme.sizes.font * 4} color={theme.colors.gray2} />
              <Block flex={1.5} row style={{ alignItems: 'flex-end', }}>
                <Text h1> {this.state.co2ppm}</Text>
                <Text h1 size={20} height={80} weight={'600'} spacing={0.1}>co2/ppm</Text>
              </Block>
              <Text caption>Gas Sensor</Text>
            </Block>
          </Block>
          <Block flex={0.5} center middle style={styles.switchBlock}>
            <Text style={[styles.gasAlarmText, { marginBottom: 10 }]}>Gas Alarm</Text>
            <Switch
              value={this.state.isGasAlarmOn}
              onValueChange={(value) => this.toggleSettingAndPublishConditionalMessage('isGasAlarmOn', 'commands', 'h', 'g')}
              thumbColor={this.state.isGasAlarmOn ? theme.colors.primary : theme.colors.gray}
              trackColor={{ false: theme.colors.gray2, true: theme.colors.secondary }}
              style={styles.gasAlarmSwitch}
            />
            <Text caption style={{ marginTop: 10, fontSize: theme.sizes.font * 1.1 }}>
              Gas Alarm {this.state.isGasAlarmOn ? "On" : "Off"}
            </Text>
          </Block>
        </Block>
      );
    } else if (name == 'window') {
      const iconName = this.state.isWindowOpen ? 'window-open-variant' : 'window-closed-variant';
      const windowStateText = this.state.isWindowOpen ? 'Yes' : 'No';
      const iconColor = this.state.isWindowOpen ? '#4FC3F7' : '#607D8B'; // Light blue for open, Grey for closed

      return (
        <Block flex={0.8} center middle style={{ padding: theme.sizes.base * 2 }}>
          <TouchableOpacity onPress={() => this.toggleSettingAndPublishConditionalMessage('isWindowOpen', 'commands', 'w', 'm')}>
            <MaterialCommunityIcons name={iconName} size={300} color={iconColor} />
            <View style={{ height: 20 }} />
            <Text size={34} style={{ textAlign: 'center' }}>
              Window is open:
              <Text style={[styles.detectionTextwindow, { color: iconColor }]}>
                {windowStateText}
              </Text>
            </Text>
          </TouchableOpacity>
        </Block>
      );
    } else if (name === 'electricity') {
      return (
        <Block flex={1} style={styles.settings}>
          <Block flex={0.7} center>
            <Text size={34}>Bulb Current: <Text style={styles.detectionText}>{this.state.bulbCurrent} A</Text></Text>
            <Text size={34}>Peltier Current:<Text style={styles.detectionText}> {this.state.peltierCurrent} A</Text></Text>
            <Text size={34}>Fan Current:<Text style={styles.detectionText}> {this.state.fanCurrent} A</Text></Text>
          </Block>
          <Block flex={0.3} center middle style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={this.handleEmergencyPowerDown}
            >
              <Text style={styles.emergencyButtonText}>Emergency Power Down</Text>
            </TouchableOpacity>
          </Block>
        </Block>
      );
    }
  }
}

Settings.defaultProps = {
  settings: mocks,
};

export default Settings;

const styles = StyleSheet.create({
  emergencyButtonText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  emergencyButton: {
    borderWidth: 2,
    borderColor: 'red',
    padding: 20,
    borderRadius: 10,
    alignSelf: 'stretch',
    marginHorizontal: 20,
  },
  switchContainer: {
    width: 40, // Adjust the width of the container as needed
    alignItems: 'flex-end',
    marginTop: 100, // Center the switch horizontally
    marginRight: 20,
  },
  detectionContainer: {
    marginTop: -40,
    marginLeft: 20,
    marginRight: 20,
  },
  detectionText: {
    fontSize: 42, // Adjust the font size as needed
    fontWeight: 'bold', // Make the text bold
  },
  detectionTextwindow: {
    fontSize: 42, // Adjust the font size as needed
    fontWeight: 'bold', // Make the text bold
  },
  alarmOn: {
    fontWeight: 'bold', // Make the text bold
    color: 'green', // Color for the "ON" state
  },
  alarmOff: {
    fontWeight: 'bold', // Make the text bold
    color: 'red', // Color for the "OFF" state
  },
  lightOn: {
    fontWeight: 'bold', // Make the text bold
    color: '#81b0ff', // Color for the "ON" state
  },
  lightOff: {
    fontWeight: 'bold', // Make the text bold
    color: '#3e3e3e', // Color for the "OFF" state
  },
  switch: {
    transform: [{ scale: 3 }], // Adjust the scale for a bigger switch
  },
  slider: {},
  switchBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  gasAlarmText: {
    fontSize: theme.sizes.font * 1.5, // Make the text larger
    color: theme.colors.black, // Change color if necessary for better visibility
    fontWeight: 'bold', // Make the text bold for emphasis
  },
  gasAlarmSwitch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], // Scale up the switch size
    marginVertical: 20, // Add some space around the switch
  }
});
