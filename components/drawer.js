import React from 'react';
import {
  createDrawerNavigator, DrawerContentScrollView, DrawerItem,
} from '@react-navigation/drawer';
import { Linking, useWindowDimensions } from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from '@rneui/themed';
import Feed from './feed';

import { breakPointDesktop } from '../constants';
import foldersMock from '../mocks/folders.json';

function CustomDrawerItem(props) {
  const folders = Object.values(props.descriptors).map(({ route }) => (
    <DrawerItem
        key={route.key}
        label={route.name}
        labelStyle={{ color: '#fbae41', fontSize: 10 }}
        icon={() => <Icon name='rowing' />}
        focused={props.state.history[props.state.history.length - 1].key === route.key}
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

CustomDrawerItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  descriptors: PropTypes.object.isRequired,
};

const Drawer = createDrawerNavigator();

export default function CustomDrawer() {
  const dimensions = useWindowDimensions();
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
    drawerContent={CustomDrawerItem}
  >
    {screens}
  </Drawer.Navigator>
  );
}
