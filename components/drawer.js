import { useSelector } from 'react-redux';
import {
  Header, Icon, Text, useTheme,
} from '@rneui/themed';
import React from 'react';
import { Platform } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledView from './styledView';
import { setSelectedByUnread, setSelectedByStarred } from '../slices/newsSlice';

import SyncItem from './listItems/syncItem';
import CustomItem from './listItems/customItem';
import FeedItem from './listItems/feedItem';
import FolderAccordion from './listItems/folderAccordion';

const feedHasUnreadItems = (feedId, items) => {
  for (const item of items) {
    if (item.unread && item.feedId === feedId) {
      return true;
    }
  }
  return false;
};

export default function ADrawer({
  content, folders, feeds, items,
}) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useTheme();
  const title = useSelector((state) => state.news.selectionTitle);

  const accordions = folders.map((folder) => {
    const feedItems = feeds.filter(
      (feed) => (feed.folderId === folder.id) && feedHasUnreadItems(feed.id, items),
    ).map((feed) => (
      <FeedItem
        key={feed.id}
        id={feed.id}
        name={feed.title}
        faviconLink={feed.faviconLink}
        setOpen={setOpen}
      />
    ));
    return feedItems.length && (<FolderAccordion
      key={folder.id}
      id={folder.id}
      name={folder.name}
      setOpen={setOpen}
    >
      {feedItems}
    </FolderAccordion>);
  }).filter((component) => component);

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
              />
              <CustomItem
                title='Unread'
                iconName='eyeo'
                iconType='ant-design'
                selectionFunc={setSelectedByUnread}
                selectionType='unread'
                setOpen={setOpen}
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
