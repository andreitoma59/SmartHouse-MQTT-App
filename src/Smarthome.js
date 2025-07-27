import React from "react";
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createAppContainer } from 'react-navigation';
import Icon from "react-native-vector-icons/FontAwesome";

import Dashboard from "../screens/Dashboard";
import Settings from "../screens/Settings";
import Options from "../screens/Options";
import Graphs from "../screens/Graphs";

// Dashboard Stack Navigator
const DashboardStack = createStackNavigator({
  Dashboard: Dashboard,
});

// Settings Stack Navigator
const SettingsStack = createStackNavigator({
  Settings: Settings,
});
const OptionsStack = createStackNavigator({
  Options: Options,
});
const GraphsStack = createStackNavigator({
  Graphs: Graphs,
});

// Bottom Tab Navigator
const TabNavigator = createBottomTabNavigator({
  DashboardTab: {
    screen: DashboardStack,
    navigationOptions: {
      tabBarLabel: "Dashboard",
      tabBarIcon: ({ tintColor }) => (
        <Icon name="dashboard" color={tintColor} size={25} />
      ),
    },
  },
  SettingsTab: {
    screen: SettingsStack,
    navigationOptions: {
      tabBarLabel: "Settings",
      tabBarIcon: ({ tintColor }) => (
        <Icon name="cog" color={tintColor} size={25} />
      ),
    },
  },
  OptionsTab: {
    screen: OptionsStack,
    navigationOptions: {
      tabBarLabel: "Options",
      tabBarIcon: ({ tintColor }) => (
        <Icon name="sliders" color={tintColor} size={25} />
      ),
    },
  },
  GraphsTab: {
    screen: GraphsStack,
    navigationOptions: {
      tabBarLabel: "Graphs",
      tabBarIcon: ({ tintColor }) => (
        <Icon name="bar-chart" color={tintColor} size={25} />
      ),
    },
  },
}, {
  tabBarOptions: {
    activeTintColor: '#2096CF',
    inactiveTintColor: 'gray',
    style: {
      paddingBottom: 30,
      height: 80,
    },
    safeAreaInset: { bottom: 'always' },
  }
});

export default createAppContainer(TabNavigator);