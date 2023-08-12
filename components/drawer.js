import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  createDrawerNavigator, DrawerContentScrollView, DrawerItem,
} from '@react-navigation/drawer';
import { Linking, useWindowDimensions } from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from '@rneui/themed';
import Feed from './feed';

import { breakPointDesktop } from '../constants';
import foldersMock from '../mocks/folders.json';
import feedsMock from '../mocks/feeds.json';

function CustomDrawerItemList(props) {
  const folders = Object.values(props.descriptors).map(({ route }) => (
    <DrawerItem
        key={route.key}
        label={route.name}
        labelStyle={{ color: '#fbae41', fontSize: 10 }}
        icon={() => (<Icon name='rowing' />)}
        focused={props.state.routes[props.state.index].key === route.key}
        onPress={() => {
          props.navigation.navigate(route.name);
        }}
      />
  ));
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

  const screens = folders.map((folder) => {
    const FolderFeed = () => Feed({ folderId: folder.id });
    return <Drawer.Screen key={folder.id} name={folder.name} component={FolderFeed} />;
  });

  const feeds = sortedAlphabetically(feedsMock.feeds, 'name');
  feeds.forEach((feed) => {
    const FeedFeed = () => Feed({ feedId: feed.id });
    screens.push(<Drawer.Screen key={feed.id} name={feed.title} component={FeedFeed} />);
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
