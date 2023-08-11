import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import CustomDrawer from './components/drawer';

export default function App() {
  return (
    <NavigationContainer>
      <CustomDrawer></CustomDrawer>
    </NavigationContainer>
  );
}
