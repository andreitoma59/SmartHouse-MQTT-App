import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Chart, VerticalAxis, HorizontalAxis, Line, Area, Tooltip } from 'react-native-responsive-linechart';
import axios from 'axios';

const Graphs = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [topic, setTopic] = useState('stateAlarm');
  const [data, setData] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    // Automatically show date pickers when the component mounts
    setShowStartDatePicker(true);
    setShowEndDatePicker(true);
  }, []);

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://rpi-toma.go.ro:5000/data`, {
        params: {
          startDate: startDate.toISOString().substring(0, 10),
          endDate: endDate.toISOString().substring(0, 10),
          topic: topic
        }
      });
  
      const chartData = response.data.map(item => {
        const date = new Date(item.timestamp.$date);
        const timeFloat = date.getUTCHours() + date.getUTCMinutes() / 60;  // Converts time to a float (HH.MM)
        return {
          x: timeFloat,
          y: parseFloat(item.value)
        };
      });
      
      setData(chartData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        console.error('Server Error:', error.response.status);
      } else if (error.request) {
        console.error('Network Error:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      setData([]);  // Reset data on error
    }
  };
  
  
  
  

  return (
    <ScrollView style={{ padding: 20 }}>
      <View>
        <Button onPress={() => setShowStartDatePicker(true)} title="Select Start Date" />
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onChangeStartDate}
          />
        )}
      </View>

      <View>
        <Button onPress={() => setShowEndDatePicker(true)} title="Select End Date" />
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onChangeEndDate}
          />
        )}
      </View>

      <Text>Topic:</Text>
      <Picker selectedValue={topic} onValueChange={setTopic}>
        <Picker.Item label="State Alarm" value="stateAlarm" />
        <Picker.Item label="Number of Detections" value="nDetections" />
        <Picker.Item label="CO2 PPM" value="co2ppm" />
        <Picker.Item label="Window is Open" value="windowIsOpen" />
        <Picker.Item label="Temperature DHT" value="tempDHT" />
        <Picker.Item label="Humidity DHT" value="humDHT" />
        <Picker.Item label="Is Night" value="IsNight" />
        <Picker.Item label="Gas Alarm" value="GasAlarm" />
      </Picker>

      <Button title="Fetch Data" onPress={fetchData} />

      {data.length > 0 ? (
      <Chart
      style={{ height: 200, width: '100%' }}
      data={data}
      padding={{ left: 40, bottom: 20, right: 20, top: 20 }}
      xDomain={{ min: Math.min(...data.map(d => d.x)), max: Math.max(...data.map(d => d.x)) }}
      yDomain={{ min: Math.min(...data.map(d => d.y)), max: Math.max(...data.map(d => d.y)) }}
      xAccessor={({ item }) => item.x}
      yAccessor={({ item }) => item.y}
    >
      <VerticalAxis tickCount={5} theme={{ labels: { formatter: (v) => v.toFixed(2) } }} />
      <HorizontalAxis
        tickCount={5}
        theme={{
          labels: {
            formatter: (v) => {
              const hours = Math.floor(v);
              const minutes = Math.round((v - hours) * 60);
              return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
            }
          }
        }}
      />

      <Area theme={{ gradient: { from: { color: '#2096CF', opacity: 0.4 }, to: { color: '#2096CF', opacity: 0 }}}} />
      <Line theme={{ stroke: { color: '#2096CF', width: 2 } }} />
      <Tooltip theme={{ label: { color: 'black' } }} />
    </Chart>    
      ) : (
        <Text>No data available.</Text>
      )}
    </ScrollView>
  );
};

export default Graphs;
