import React, { useState } from 'react';
import {
  createDrawerNavigator, DrawerContentScrollView, DrawerItem,
} from '@react-navigation/drawer';
import { Linking, useWindowDimensions, View } from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from '@rneui/themed';
import Feed from './feed';

import { breakPointDesktop } from '../constants';
import foldersMock from '../mocks/folders.json';
import feedsMock from '../mocks/feeds.json';

function FolderDrawerItem({ props, options, route }) {
  options.setIsVisible(props.state.routes[props.state.index].key === route.key);
  return (<DrawerItem
    key={route.key}
    label={route.name}
    labelStyle={{ color: '#000000', fontSize: 12, fontWeight: 'bold' }}
    icon={() => (<Icon name='arrow-drop-down' />)}
    focused={props.state.routes[props.state.index].key === route.key}
    onPress={() => {
      props.navigation.navigate(route.name);
    }}
  />);
}

function FeedDrawerItem({ props, options, route }) {
  if (!options.isVisible && props.state.routes[props.state.index].key !== route.key) {
    return <View key={route.key}/>;
  }
  return (<DrawerItem
    key={route.key}
    label={route.name}
    labelStyle={{ color: '#333333', fontSize: 10 }}
    icon={() => (<Icon name='arrow-drop-up' />)}
    focused={props.state.routes[props.state.index].key === route.key}
    onPress={() => {
      props.navigation.navigate(route.name);
    }}
  />);
}

function CustomDrawerItemList(props) {
  const folders = Object.values(props.descriptors).map(({ route, options }) => {
    if (options.feedType === 'folder') {
      return FolderDrawerItem({ props, route, options });
    }
    if (options.feedType === 'feed') {
      return FeedDrawerItem({ props, route, options });
    }
    return <View key={route.key}/>;
  });

  return (
    <DrawerContentScrollView {...props}>
      {/* <DrawerItemList {...props} /> */}
      {folders}
      <DrawerItem
        label="Help"
        onPress={() => Linking.openURL('https://mywebsite.com/help')}
      />
    </DrawerContentScrollView>
  );
}

CustomDrawerItemList.propTypes = {
  navigation: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  descriptors: PropTypes.object.isRequired,
};

function sortedAlphabetically(array, attribute) {
  const copy = [...array];
  copy.sort((a, b) => {
    if (a[attribute] < b[attribute]) {
      return -1;
    }
    if (a[attribute] > b[attribute]) {
      return 1;
    }
    return 0;
  });
  return copy;
}

const Drawer = createDrawerNavigator();

export default function CustomDrawer() {
  const dimensions = useWindowDimensions();
  const folders = sortedAlphabetically(foldersMock.folders, 'name');
  const feeds = sortedAlphabetically(feedsMock.feeds, 'name');

  const screens = [];
  folders.forEach((folder) => {
    const [isVisible, setIsVisible] = useState(false);
    const FolderFeed = () => Feed({ folderId: folder.id });
    screens.push(<Drawer.Screen
      key={folder.id}
      name={folder.name}
      component={FolderFeed}
      options={{ setIsVisible, feedType: 'folder' }}/>);
    feeds.forEach((feed) => {
      if (feed.folderId === folder.id) {
        const FeedFeed = () => Feed({ feedId: feed.id });
        screens.push(<Drawer.Screen
          key={feed.id}
          name={feed.title}
          component={FeedFeed}
          options={{ isVisible, feedType: 'feed' }} />);
      }
    });
  });

  const UnreadFeed = () => Feed({ unread: true });

  return (
  <Drawer.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      drawerType: dimensions.width >= breakPointDesktop ? 'permanent' : 'front',
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      drawerStyle: {
        backgroundColor: '#EEEEEE',
      },
    }}
    initialRouteName="Home"
    defaultStatus="open"
    drawerContent={CustomDrawerItemList}
  >
    {screens}
    <Drawer.Screen name="Unread" component={UnreadFeed} />
  </Drawer.Navigator>
  );
}
