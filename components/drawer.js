import { useSelector } from 'react-redux';
import {
  Header, Icon, Text, useTheme,
} from '@rneui/themed';
import React, { useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledView from './styledView';
import { setSelectedByUnread, setSelectedByStarred } from '../slices/newsSlice';

import SyncItem from './listItems/syncItem';
import CustomItem from './listItems/customItem';
import FeedItem from './listItems/feedItem';
import FolderAccordion from './listItems/folderAccordion';

const unreadCountFeed = (feedId, items) => {
  let count = 0;
  for (const item of items) {
    if (item.unread && item.feedId === feedId) {
      count += 1;
    }
  }
  return count;
};

const unreadCountProperty = (propertyName, items) => {
  let count = 0;
  for (const item of items) {
    if (item[propertyName]) {
      count += 1;
    }
  }
  return count;
};

export default function ADrawer({
  content, folders, feeds, items,
}) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useTheme();
  const title = useSelector((state) => state.news.selectionTitle);

  const unreadCountsFolder = {};
  const unreadCountsFeed = {};

  const accordions = folders.map((folder) => {
    const feedItems = feeds.filter(
      (feed) => {
        if (feed.folderId !== folder.id) {
          return false;
        }
        const count = unreadCountFeed(feed.id, items);
        unreadCountsFeed[feed.id] = count;
        const prevCount = unreadCountsFolder[folder.id] || 0;
        unreadCountsFolder[folder.id] = prevCount + count;
        return count;
      },
    ).map((feed) => (
      <FeedItem
        key={feed.id}
        id={feed.id}
        name={feed.title}
        faviconLink={feed.faviconLink}
        displayCount={unreadCountsFeed[feed.id]}
        setOpen={setOpen}
      />
    ));
    return feedItems.length && (<FolderAccordion
      key={folder.id}
      id={folder.id}
      name={folder.name}
      displayCount={unreadCountsFolder[folder.id]}
      setOpen={setOpen}
    >
      {feedItems}
    </FolderAccordion>);
  }).filter((component) => component);

  useEffect(() => {
    const backAction = () => {
      if (open) {
        BackHandler.exitApp();
      } else {
        setOpen(true);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <StyledView style={{
      flex: 1,
    }}>
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType={Platform.OS === 'web' ? 'permanent' : 'front'}
        renderDrawerContent={() => (
          <SafeAreaView style={{ flex: 1 }}>
            <StyledView style={{ flex: 1 }}>
              <SyncItem theme={theme}/>
              <CustomItem
                title='Starred'
                iconName='star'
                iconType='ant-design'
                selectionFunc={setSelectedByStarred}
                selectionType='starred'
                setOpen={setOpen}
                displayCount={unreadCountProperty('starred', items)}
              />
              <CustomItem
                title='Unread'
                iconName='eyeo'
                iconType='ant-design'
                selectionFunc={setSelectedByUnread}
                selectionType='unread'
                setOpen={setOpen}
                displayCount={unreadCountProperty('unread', items)}
              />
              {accordions}
            </StyledView>
          </SafeAreaView>
        )}
      >
        <Header
          leftComponent={
            (Platform.OS !== 'web') ? (<Icon
              name='menu'
              size={30}
              onPress={() => setOpen((prevOpen) => !prevOpen)}
            />) : <></>
          }
          backgroundColor={theme.colors.primary}
          centerComponent={
            <Text
              numberOfLines={1}
              style={{ fontSize: 20, fontWeight: 'bold' }}
            >
              {title}
            </Text>
          }
        />
        {content}
      </Drawer>
    </StyledView>
  );
}

ADrawer.propTypes = {
  content: PropTypes.object.isRequired,
  folders: PropTypes.array.isRequired,
  feeds: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
};
