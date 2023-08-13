import React, { useState } from 'react';
import {
  createDrawerNavigator, DrawerContentScrollView, DrawerItem,
} from '@react-navigation/drawer';
import {
  Linking, useWindowDimensions, View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Icon, useTheme, Text } from '@rneui/themed';
import Feed from './feed';

import { breakPointDesktop } from '../constants';
import foldersMock from '../mocks/folders.json';
import feedsMock from '../mocks/feeds.json';

function FolderDrawerItem({ props, options, route }) {
  const [icon, setIcon] = useState('caret-down');
  return (<Text
      key={route.key}
      style={{
        paddingLeft: 10,
      }}
    >
    <Icon
      name={icon}
      type='font-awesome'
      onPress={() => {
        options.setIsVisible(!options.isVisible);
        setIcon(options.isVisible ? 'caret-down' : 'caret-up');
      }}
    />
    <DrawerItem
      label={route.name}
      labelStyle={{ fontSize: 12, fontWeight: 'bold', color: options.theme.colors.black }}
      focused={props.state.routes[props.state.index].key === route.key}
      onPress={() => { props.navigation.navigate(route.name); }}
    />
  </Text>);
}

FolderDrawerItem.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  props: PropTypes.object.isRequired,
};

function FeedDrawerItem({ props, options, route }) {
  if (!options.isVisible) {
    return <View key={route.key}/>;
  }
  return (<DrawerItem
    key={route.key}
    label={route.name}
    labelStyle={{ fontSize: 10, color: options.theme.colors.black }}
    icon={() => (<Icon name="rss-box" type="material-community" />)}
    focused={props.state.routes[props.state.index].key === route.key}
    onPress={() => {
      props.navigation.navigate(route.name);
    }}
  />);
}

FeedDrawerItem.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  props: PropTypes.object.isRequired,
};

function CustomDrawerItemList(props) {
  const folders = Object.values(props.descriptors).map(({ route, options }) => {
    switch (options.feedType) {
      case 'folder':
        return FolderDrawerItem({ props, route, options });
      case 'feed':
        return FeedDrawerItem({ props, route, options });
      case 'unread':
        return (<DrawerItem
          key={route.key}
          label={route.name}
          labelStyle={{ fontSize: 10, color: options.theme.colors.black }}
          icon={() => (<Icon name="eyeo" type="ant-design" />)}
          focused={props.state.routes[props.state.index].key === route.key}
          onPress={() => {
            props.navigation.navigate(route.name);
          }}
        />);
      default:
        return <View key={route.key}/>;
    }
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
  const { theme } = useTheme();

  const screens = [];
  folders.forEach((folder) => {
    const [isVisible, setIsVisible] = useState(false);
    const FolderFeed = () => Feed({ folderId: folder.id });
    screens.push(<Drawer.Screen
      key={folder.id}
      name={folder.name}
      component={FolderFeed}
      options={{
        isVisible, setIsVisible, feedType: 'folder', theme,
      }}/>);
    feeds.forEach((feed) => {
      if (feed.folderId === folder.id) {
        const FeedFeed = () => Feed({ feedId: feed.id });
        screens.push(<Drawer.Screen
          key={feed.id}
          name={feed.title}
          component={FeedFeed}
          options={{
            isVisible, setIsVisible, feedType: 'feed', theme,
          }} />);
      }
    });
  });

  const UnreadFeed = () => Feed({ unread: true, theme });
  return (
  <Drawer.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
        borderBottomColor: theme.colors.primary,
      },
      drawerType: dimensions.width >= breakPointDesktop ? 'permanent' : 'front',
      headerTintColor: theme.colors.black,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      drawerStyle: {
        backgroundColor: theme.colors.background,
        borderRightColor: theme.colors.primary,
      },
    }}
    initialRouteName="Home"
    defaultStatus="open"
    drawerContent={CustomDrawerItemList}
  >
    {screens}
    <Drawer.Screen name="Unread" component={UnreadFeed} options={{ feedType: 'unread', theme }}/>
  </Drawer.Navigator>
  );
}
