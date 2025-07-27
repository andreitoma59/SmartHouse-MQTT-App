import React, { Component } from 'react';
import { StyleSheet, PanResponder, Dimensions, Button, View } from 'react-native';
import * as theme from '../Theme';
import Block from './Block';
import Text from './Text';
import { mqttData } from '../components/mqtt';
import { MQTTContext } from '../components/mqttContext';

const { height } = Dimensions.get('window');
const CONTROLLER_HEIGHT = height * 0.35; // Increased height for the PanSlider

class PanSlider extends Component {
  static contextType = MQTTContext;

  constructor(props) {
    super(props);
    const initialTemperature = mqttData.tempDHT;
    console.log(initialTemperature);

    this.state = {
      panValue: initialTemperature,
      rangeValue: initialTemperature,
      percentage: this.calculatePercentage(initialTemperature, props.minValue, props.maxValue),
      lastMoveDy: 0,
    };

    this.lastMoveTimestamp = Date.now();
  }

  calculatePercentage = (value, minValue, maxValue) => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  handleMove = (moveValue) => {
    const { minValue, maxValue } = this.props;
    const max = maxValue > CONTROLLER_HEIGHT ? maxValue : CONTROLLER_HEIGHT;
    const range = (maxValue || max) - minValue;

    let value = this.state.panValue - (moveValue / CONTROLLER_HEIGHT) * range;
    value = Math.round(value); // Ensure the value moves in steps of 1
    if (value > maxValue) value = maxValue;
    if (value < minValue) value = minValue;

    const percentage = this.calculatePercentage(value, minValue, maxValue);
    const rangeValue = minValue + ((maxValue - minValue) * percentage) / 100;

    this.setState({ panValue: value, rangeValue, percentage });
  };

  sendMQTTMessage = () => {
    const { rangeValue } = this.state;
    const mqttClient = this.context;
    const roundedValue = Math.round(rangeValue);

    if (mqttClient && mqttClient.isConnected()) {
      mqttClient.publish('commands', `t${roundedValue}`, 1, false);
      console.log(`Message published to commands: t${roundedValue}`);
    } else {
      console.log('MQTT client is not connected.');
    }
  };

  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (evt, { dy }) => {
      const now = Date.now();
      if (now - this.lastMoveTimestamp > 10) { // Adjust the debounce interval as necessary
        this.handleMove(dy - this.state.lastMoveDy);
        this.setState({ lastMoveDy: dy });
        this.lastMoveTimestamp = now;
      }
    },
    onPanResponderRelease: () => {
      this.setState({ lastMoveDy: 0 });
    },
  });

  render() {
    const { minValue } = this.props;
    const { rangeValue, percentage } = this.state;

    return (
      <Block style={styles.container}>
        <Block right {...this.panResponder.panHandlers} style={styles.controller}>
          <Block center style={styles.controllerValue}>
            <Text weight="600" color="black">
              {rangeValue !== undefined ? rangeValue.toFixed(0) : minValue}
            </Text>
          </Block>
          <Block style={[styles.controllerOverlay, { height: `${percentage || 0}%` }]} />
        </Block>
        <View style={styles.buttonContainer}>
          <Button title="Set Temperature" onPress={this.sendMQTTMessage} />
        </View>
      </Block>
    );
  }
}

PanSlider.defaultProps = {
  minValue: 10,
  maxValue: 45,
};

export default PanSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controller: {
    width: 120, // Increased width for the PanSlider
    height: CONTROLLER_HEIGHT,
    borderRadius: 20,
    backgroundColor: theme.colors.gray2,
    alignContent: 'center',
    overflow: 'hidden',
    marginTop: 40,
  },
  controllerValue: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  controllerOverlay: {
    width: 120, // Match the width of the controller
    backgroundColor: theme.colors.accent,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
