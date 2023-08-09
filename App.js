import 'react-native-gesture-handler';
import {
  StyleSheet, Text, View, FlatList, Image, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  NavigationContainer,
} from '@react-navigation/native';
import PropTypes from 'prop-types';

import feedsMock from './mocks/feeds.json';
import foldersMock from './mocks/folders.json';
import itemsMock from './mocks/items.json';

const feedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function Feed({ folderId, mocked }) {
  const [itemsData, setItemsData] = useState([]);

  const getData = async () => {
    try {
      if (mocked) {
        const feedsInFolder = feedsMock.feeds.filter(
          (item) => item.folderId === folderId,
        );
        const feedsMap = Object.fromEntries(feedsInFolder.map((feed) => [feed.id, feed]));
        const feedIds = Object.keys(feedsMap);
        const items = itemsMock.items.filter(
          (item) => feedIds.includes(`${item.feedId}`),
        ).map(
          (item) => ({ ...item, favicon: feedsMap[`${item.feedId}`].faviconLink }),
        );
        setItemsData(items);
      } else {
        const response = await fetch('https://reactnative.dev/movies.json');
        const json = await response.json();
        setItemsData(json.movies);
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
        data={itemsData}
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
  folderId: PropTypes.number.isRequired,
  mocked: PropTypes.bool.isRequired,
};

const Drawer = createDrawerNavigator();

export default function App() {
  const folders = [...foldersMock.folders];
  folders.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  const screens = folders.map((folder) => {
    const FolderFeed = () => Feed({ folderId: folder.id, mocked: true });
    return <Drawer.Screen key={folder.id} name={folder.name} component={FolderFeed} />;
  });

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
        {screens}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
