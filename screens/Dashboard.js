import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { Component } from 'react';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import * as theme from '../Theme';
import { Block, Text } from '../components';
import mocks from '../settings';
import { mqttData } from '../components/mqtt';
import { TemperatureDisplay } from '../components/displays';

console.log(mqttData);

class Dashboard extends Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      tempDHT: mqttData.tempDHT, // Initialize from mqttData
      humDHT: mqttData.humDHT,
    };
  }

  componentDidMount() {
    this.mqttDataListener = setInterval(() => {
      this.setState({
        tempDHT: mqttData.tempDHT,
        humDHT: mqttData.humDHT,
      });
    }, 10); // Example: Update every second
  }

  componentWillUnmount() {
    clearInterval(this.mqttDataListener);
  }

  render() {
    const { navigation, settings } = this.props;
    const LightIcon = settings['light'].icon;
    const ACIcon = settings['ac'].icon;
    const AlarmIcon = settings['alarm'].icon;
    const TempIcon = settings['temperature'].icon;
    const FanIcon = settings['fan'].icon;
    const WifiIcon = settings['wi-fi'].icon;
    const ElectrictyIcon = settings['electricity'].icon;
    const GasIcon = settings['gas'].icon;
    const WindowIcon = settings['window'].icon;

    return (
      <ScrollView contentContainerStyle={styles.dashboard}>
        <Block column style={{ marginVertical: theme.sizes.base * 2 }}>
          <Text welcome>Welcome</Text>
          <Text name>Toma Andrei</Text>
        </Block>

        <Block row style={{ paddingVertical: 10 }}>
          <TemperatureDisplay temperature={this.state.tempDHT} />
          <Block flex={1} column>
            <Text caption>Humidity</Text>
            <LineChart
              yMax={100}
              yMin={0}
              data={[0, 20, 25, 15, 20, 55, 60]}
              style={{ flex: 0.8 }}
              curve={shape.curveNatural}
              svg={{ stroke: theme.colors.accent, strokeWidth: 3 }}
            />
          </Block>
        </Block>

        <Block flex column space="between" style={styles.circlesContainer}>
          <Block row space="around" style={{ marginVertical: theme.sizes.base }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings', { name: 'light' })}
            >
              <Block center middle style={styles.button}>
                <LightIcon size={38} />
                <Text button>{settings['light'].name}</Text>
              </Block>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings', { name: 'alarm' })}
            >
              <Block center middle style={styles.button}>
                <AlarmIcon size={38} />
                <Text button>{settings['alarm'].name}</Text>
              </Block>
            </TouchableOpacity>
          </Block>

          <Block row space="around" style={{ marginVertical: theme.sizes.base }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings', { name: 'temperature' })}
            >
              <Block center middle style={styles.button}>
                <TempIcon size={38} />
                <Text button>{settings['temperature'].name}</Text>
              </Block>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings', { name: 'window' })}
            >
              <Block center middle style={styles.button}>
                <WindowIcon size={38} />
                <Text button>{settings['window'].name}</Text>
              </Block>
            </TouchableOpacity>
          </Block>

          <Block row space="around" style={{ marginVertical: theme.sizes.base }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings', { name: 'gas' })}
            >
              <Block center middle style={styles.button}>
                <GasIcon size={38} />
                <Text button>{settings['gas'].name}</Text>
              </Block>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings', { name: 'electricity' })}
            >
              <Block center middle style={styles.button}>
                <ElectrictyIcon size={38} />
                <Text button>{settings['electricity'].name}</Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
      </ScrollView>
    );
  }
}

Dashboard.defaultProps = {
  settings: mocks,
};

export default Dashboard;

const styles = StyleSheet.create({
  dashboard: {
    padding: theme.sizes.base * 2,
    flex: 1,
  },
  circlesContainer: {
    marginTop: theme.sizes.base * 2,
  },
  button: {
    backgroundColor: theme.colors.button,
    width: 120, // Adjust the width to make the button smaller
    height: 120, // Adjust the height to make the button smaller
    borderRadius: 120 / 2,
  }})