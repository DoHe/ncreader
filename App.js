import 'react-native-gesture-handler';
import {
  StyleSheet, Text, View, FlatList, Image, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import PropTypes from 'prop-types';

import mock from './mock';

const feedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function Feed({ category, mocked }) {
  const [data, setData] = useState([]);

  const getData = async () => {
    try {
      if (mocked) {
        setData(mock[category]);
      } else {
        const response = await fetch('https://reactnative.dev/movies.json');
        const json = await response.json();
        setData(json.movies);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={feedStyles.container}>
      <FlatList
        style={{ marginLeft: 10, marginRight: 10 }}
        data={data}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image
                source={{ uri: item.favicon }}
                style={{
                  width: 16, height: 16,
                }}
              />
              <Text>
                {item.title}
              </Text>
            </View>
            <View>
              {Platform.OS === 'web' ? (
                <div dangerouslySetInnerHTML={{ __html: item.body }} />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: item.body }}
                  style={{
                    height: 100,
                  }}
                />)}
            </View>
          </View>
        )}
      />
    </View>
  );
}

Feed.propTypes = {
  category: PropTypes.string.isRequired,
  mocked: PropTypes.bool.isRequired,
};

const Drawer = createDrawerNavigator();

export default function App() {
  const ITFeed = () => Feed({ category: 'IT', mocked: true });
  const ComicsFeed = () => Feed({ category: 'Comics', mocked: true });
  return (
    <NavigationContainer>
      <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      initialRouteName="Home"
      >
        <Drawer.Screen name="IT" component={ITFeed} />
        <Drawer.Screen name="Comics" component={ComicsFeed} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
