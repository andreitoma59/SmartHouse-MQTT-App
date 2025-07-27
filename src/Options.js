import React, { useState } from 'react';
import { View, Text, Switch, Button, StyleSheet } from 'react-native';

const Options = () => {
  const [isNotificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);

  const handleSaveOptions = () => {
    // Logic to save these settings, maybe in AsyncStorage or state management
    alert('Settings saved!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Options</Text>

      <View style={styles.option}>
        <Text style={styles.optionText}>Enable Notifications:</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setNotificationsEnabled}
          value={isNotificationsEnabled}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.optionText}>Enable Dark Mode:</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setDarkMode}
          value={isDarkMode}
        />
      </View>

      <Button
        title="Save Options"
        onPress={handleSaveOptions}
        color="#2096CF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  option: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionText: {
    fontSize: 18
  }
});

export default Options;
