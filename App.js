import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  darkColors, lightColors, createTheme, ThemeProvider,
} from '@rneui/themed';
import { Platform, useColorScheme } from 'react-native';
import CustomDrawer from './components/drawer';

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.web,
      android: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
  darkColors: {
    ...Platform.select({
      default: darkColors.platform.web,
      android: darkColors.platform.android,
      ios: darkColors.platform.ios,
    }),
  },
});

export default function App() {
  theme.mode = useColorScheme();
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <CustomDrawer></CustomDrawer>
      </NavigationContainer>
    </ThemeProvider>
  );
}
