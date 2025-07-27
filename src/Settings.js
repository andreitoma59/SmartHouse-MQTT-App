import React, { Component } from 'react'
import { Alert, StyleSheet, TouchableWithoutFeedback, Switch, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider'
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
      paddingLeft: theme.sizes.base * 2
    },
    headerStyle: {
      borderBottomColor: 'transparent',
    }
  });

  constructor(props) {
    super(props);
    this.state = {
      direction: 45,
      speed: 12,
      isAlarmOn: !!parseInt(mqttData.stateAlarm, 10),
      detectionCount: mqttData.nDetections,
      isLightOn:false,
      isGasAlarmOn: !!parseInt(mqttData.GasAlarm, 10),
      lux:0,
      lightoutside: !!parseInt(mqttData.IsNight, 10),
      isWindowOpen: !!parseInt(mqttData.windowIsOpen, 10),
      temperature: mqttData.tempDHT,
      co2ppm: mqttData.co2ppm
    }
}

componentDidMount() {
  this.mqttDataListener = setInterval(() => {
    this.setState({
      direction: 45,
      speed: 12,
      isAlarmOn: !!parseInt(mqttData.stateAlarm, 10),
      detectionCount: mqttData.nDetections,
      isLightOn:false,
      isGasAlarmOn: !!parseInt(mqttData.GasAlarm, 10),
      lux:0,
      lightoutside: !!parseInt(mqttData.IsNight, 10),
      isWindowOpen: !!parseInt(mqttData.windowIsOpen, 10),
      temperature: mqttData.tempDHT,
      co2ppm: mqttData.co2ppm
    });
  }, 10); // Example: Update every second
}

  toggleSettingAndPublishConditionalMessage = (settingName, mqttTopic, trueStateMessage, falseStateMessage) => {
    const mqttClient = this.context; // Access the MQTT client from context
    const newState = !this.state[settingName];
    const message = newState ? trueStateMessage : falseStateMessage;

    // Toggle the state variable and then publish the message
    this.setState({ [settingName]: newState }, () => {
        if (mqttClient && mqttClient.isConnected() ) {
            // Adjusted for sp-react-native-mqtt's publish signature
            mqttClient.publish(mqttTopic, message, 1, false);
            console.log(`Message published to ${mqttTopic}: ${message}`);
        } else {
            console.log('MQTT client is not connected.');
        }
    });
};


  
  


  renderController() {
    return (
      <Block flex={1} right style={styles.controller}>
        <Block center style={styles.controllerValue}>
          <Text color="white">34</Text>
        </Block>
        <Block flex={0.8} style={[styles.controllerOverlay]} />
      </Block>
    )
    }
  
    render() {
      const { navigation, settings } = this.props;
      const name = navigation.getParam('name');
      const Icon = settings[name].icon;
      if (name=='temperature'){
        return (
          <Block flex={1} style={styles.settings}>
            <Block flex={0.5} row>
              <Block column style={{marginLeft:20,marginRight:20}}>
                <Icon size={theme.sizes.font * 4} color={theme.colors.gray2} />
                <Block flex={1.2} row style={{ alignItems: 'flex-end', }}>
                  <Text h1>{this.state.temperature}</Text>
                  <Text h1 size={34} height={80} weight={'600'} spacing={0.1}>°C</Text>
                </Block>
                <Text caption>Temperature</Text>
              </Block>
              <Block flex={1} center>
                <PanSlider />
              </Block>
            </Block>
            <Block flex={1} style={{ paddingTop: theme.sizes.base * 2 }}>
              <Block column style={{ marginVertical: theme.sizes.base * 5 ,marginLeft:20,marginRight:20}}>
                <Block row space="between">
                  <Text welcome color="black">Direction</Text>
                  <Text welcome color="black">{this.state.direction}</Text>
                </Block>
                <Slider
                  value={45}
                  mininumValue={0}
                  maximumValue={90}
                  thumbTintColor={theme.colors.accent}
                  minimumTrackTintColor={theme.colors.accent}
                  maximumTrackTintColor={theme.colors.gray2}
                  onValueChange={value => this.setState({ direction: parseInt(value, 10) })}
                />
              </Block>
              
              <Block column style={{ marginVertical: theme.sizes.base * 5,marginLeft:20,marginRight:20 }}>
                <Block row space="between">
                  <Text welcome color="black">Speed</Text>
                  <Text welcome color="black">{this.state.speed}</Text>
                </Block>
                <Slider
                  value={12}
                  mininumValue={0}
                  maximumValue={30}
                  thumbTintColor={theme.colors.accent}
                  minimumTrackTintColor={theme.colors.accent}
                  maximumTrackTintColor={theme.colors.gray2}
                  onValueChange={value => this.setState({ speed: parseInt(value, 10) })}
                />
              </Block>
            </Block>
          </Block>
        );
      }else if (name=='alarm'){
        return(
          <Block flex={1} style={styles.settings}>
          <Block flex={0.5} row>
            <Block column style={{marginLeft:20}}>
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
      }else if(name=='light'){
        return(
          <Block flex={1} style={styles.settings}>
          <Block flex={0.5} row>
            <Block column style={{marginLeft:20}}>
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
                this.setState({ isLightOn: value });
                // if (value) {
                //   Alert.alert("Light Bulb", "The light has been turned on");
                // } else {
                //   Alert.alert("", "Alarm is disabled");
                // }
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
                {this.state.lightoutside ? 'Yes' : 'No'}
              </Text>
              </Text>
              <View style={{height: 100}} />
              <Text size={20}>
              Light Level:
              <Text style={styles.detectionText}>
                {this.state.lux} Lux
              </Text>
              </Text>
          </Block>
        </Block>
          );
      }else if (name=='gas'){
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
                onValueChange={(value) =>  this.toggleSettingAndPublishConditionalMessage('isGasAlarmOn', 'commands', 'h', 'g')}
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
      }else if (name=='window'){
        const iconName = this.state.isWindowOpen ? 'window-open-variant' : 'window-closed-variant';
        const windowStateText = this.state.isWindowOpen ? 'Yes' : 'No';
        const iconColor = this.state.isWindowOpen ? '#4FC3F7' : '#607D8B'; // Light blue for open, Grey for closed

        return (
          <Block flex={0.8} center middle style={{ padding: theme.sizes.base * 2 }}>
            <TouchableOpacity onPress={() => this.toggleSettingAndPublishConditionalMessage('isWindowOpen', 'commands', 'w', 'm')}>
              <MaterialCommunityIcons name={iconName} size={400} color={iconColor} />
              <View style={{height: 100}} />
              <Text size={40}>
                Window is open: 
                <Text style={[styles.detectionTextwindow, {color: iconColor}]}>
                {windowStateText}
                </Text>
              </Text>
            </TouchableOpacity>
          </Block>
      );
    }
      }
}
  Settings.defaultProps = {
    settings: mocks,
  }
  
  export default Settings;
  
  const styles = StyleSheet.create({
    switchContainer: {
      width: 40, // Adjust the width of the container as needed
      alignItems: 'flex-end',
      marginTop: 100, // Center the switch horizontally
      marginRight:20
    },
    detectionContainer: {
      marginTop: -40,
      marginLeft:20,
      marginRight:20
    },
    detectionText: {
      fontSize: 42, // Adjust the font size as needed
      fontWeight: 'bold', // Make the text bold
    },
    detectionTextwindow: {
      fontSize: 52, // Adjust the font size as needed
      fontWeight: 'bold', // Make the text bold
    },
    alarmOn: {
      // fontSize: 24, // Adjust the font size as needed
      fontWeight: 'bold', // Make the text bold
      color: 'green', // Color for the "ON" state
    },
    alarmOff: {
      // fontSize: 24, // Adjust the font size as needed
      fontWeight: 'bold', // Make the text bold
      color: 'red', // Color for the "OFF" state
    },
    lightOn: {
      // fontSize: 24, // Adjust the font size as needed
      fontWeight: 'bold', // Make the text bold
      color: '#81b0ff', // Color for the "ON" state
    },
    lightOff: {
      // fontSize: 24, // Adjust the font size as needed
      fontWeight: 'bold', // Make the text bold
      color: '#3e3e3e', // Color for the "OFF" state
    },
    switch: {
      transform: [{ scale: 3 }] // Adjust the scale for a bigger switch
    },

    slider: {},
    switchBlock: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 30
    },
    gasAlarmText: {
      fontSize: theme.sizes.font * 1.5, // Make the text larger
      color: theme.colors.black, // Change color if necessary for better visibility
      fontWeight: 'bold', // Make the text bold for emphasis
    },
    gasAlarmSwitch: {
      transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], // Scale up the switch size
      marginVertical: 20, // Add some space around the switch
    },
  })