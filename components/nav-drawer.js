import React from 'react';
import { useSelector } from 'react-redux';
import {
  createDrawerNavigator, DrawerContentScrollView, DrawerItem,
} from '@react-navigation/drawer';
import {
  Linking, useWindowDimensions, View,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  Icon, useTheme, Image, ListItem,
} from '@rneui/themed';
import Feed from './nav-feed';

import { breakPointDesktop } from '../constants';

function FolderDrawerItem({ props, options, route }) {
  const { key, name } = route;
  const { theme } = options;
  return (
    <ListItem.Accordion
      key={route.key}
      content={
        <DrawerItem
          label={name}
          labelStyle={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.black }}
          focused={props.state.routes[props.state.index].key === key}
          onPress={() => { props.navigation.navigate(name); }}
        />
      }
      isExpanded={false}
      onPress={() => { console.log('pressed'); }}
    >
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Title>HI!</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    </ListItem.Accordion>);
}

FolderDrawerItem.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  props: PropTypes.object.isRequired,
};

function FeedDrawerItem({ props, options, route }) {
  const { feedId } = route.params;
  const { theme, feeds } = options;
  const { key, name } = route;

  if (!false) {
    return <View key={key}/>;
  }

  const feedForId = feeds.find((feed) => feed.id === feedId);
  return (<DrawerItem
    key={key}
    label={name}
    labelStyle={{ fontSize: 10, color: theme.colors.black }}
    icon={() => {
      if (feedForId?.faviconLink) {
        return <Image
          source={{ uri: feedForId.faviconLink }}
          style={{ width: 24, height: 24 }}
      />;
      }
      return <Icon name="rss-box" type="material-community" />;
    }}
    focused={props.state.routes[props.state.index].key === key}
    onPress={() => {
      props.navigation.navigate(name);
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
  const storeFolders = useSelector((state) => state.news.folders);
  const folders = sortedAlphabetically(storeFolders, 'name');
  const storeFeeds = useSelector((state) => state.news.feeds);
  const feeds = sortedAlphabetically(storeFeeds, 'name');
  const { theme } = useTheme();

  const screens = [];
  folders.forEach((folder) => {
    screens.push(<Drawer.Screen
      key={folder.id}
      name={folder.name}
      component={Feed}
      initialParams={{ folderId: folder.id }}
      options={{ feedType: 'folder', theme, feeds }}/>);
    feeds.forEach((feed) => {
      if (feed.folderId === folder.id) {
        screens.push(<Drawer.Screen
          key={feed.id}
          name={feed.title}
          component={Feed}
          initialParams={{ feedId: feed.id }}
          options={{ feedType: 'feed', theme, feeds }} />);
      }
    });
  });

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
    <Drawer.Screen
      name="Unread"
      component={Feed}
      initialParams={{ unread: true }}
      options={{
        feedType: 'unread', theme,
      }}
    />
  </Drawer.Navigator>
  );
}
