import { useDispatch, useSelector } from 'react-redux';
import {
  Header, Icon, ListItem, Text, useTheme, Image,
} from '@rneui/themed';
import * as React from 'react';
import { Platform } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledView from './styledView';
import {
  setSelectedByFeedId, setSelectedByFolderId, setSelectedByUnread, unsetSelected,
} from '../slices/newsSlice';

function FolderAccordion({ id, name, children }) {
  const [expanded, setExpanded] = React.useState(false);
  const dispatch = useDispatch();

  return (<ListItem.Accordion
      content={
        <Text
          onPress={() => { dispatch(setSelectedByFolderId(id)); }}
          style={{
            display: 'flex',
            flex: 1,
          }}
        >
          <Icon
            name="folder"
            size={20}
            style={{ marginRight: 16 }}
          />
          <ListItem.Content>
            <ListItem.Title>{name}</ListItem.Title>
          </ListItem.Content>
        </Text>
      }
      isExpanded={expanded}
      onPress={() => { setExpanded(!expanded); }}
    >
      {children}
    </ListItem.Accordion>);
}

FolderAccordion.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  children: PropTypes.array.isRequired,
};

function FeedItem({ id, name, faviconLink }) {
  const dispatch = useDispatch();

  return (
    <ListItem
      style={{ marginLeft: 10 }}
      onPress={() => {
        dispatch(setSelectedByFeedId(id));
      }}
    >
      <Image
          source={{ uri: faviconLink }}
          style={{ width: 20, height: 20 }}
      />
      <ListItem.Content>
        <ListItem.Title>{name}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}

FeedItem.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  faviconLink: PropTypes.string,
};

function AllItem() {
  const dispatch = useDispatch();

  return (
    <ListItem
      onPress={() => {
        dispatch(unsetSelected());
      }}
    >
      <Icon
        name="folder"
        size={20}
      />
      <ListItem.Content>
        <ListItem.Title>All</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}

function UnreadItem() {
  const dispatch = useDispatch();

  return (
    <ListItem
      onPress={() => {
        dispatch(setSelectedByUnread());
      }}
    >
      <Icon
        name="folder"
        size={20}
      />
      <ListItem.Content>
        <ListItem.Title>Unread</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}

export default function ADrawer({ content }) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useTheme();

  const folders = useSelector((state) => state.news.folders);
  const accordions = folders.map((folder) => {
    const feeds = useSelector((state) => state.news.feeds);
    const feedItems = feeds.filter((feed) => feed.folderId === folder.id).map((feed) => (
      <FeedItem
        key={feed.id}
        id={feed.id}
        name={feed.title}
        faviconLink={feed.faviconLink}
      />
    ));
    return (<FolderAccordion
      key={folder.id}
      id={folder.id}
      name={folder.name}
    >
      {feedItems}
    </FolderAccordion>);
  });

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
              <AllItem/>
              <UnreadItem/>
              {accordions}
            </StyledView>
          </SafeAreaView>
        )}
      >
        <Header
          leftComponent={
            <Icon
              name='menu'
              onPress={() => setOpen((prevOpen) => !prevOpen)}
            />
          }
          backgroundColor={theme.colors.primary}
          centerComponent={
            <Text>News</Text>
          }
        />
        {content}
      </Drawer>
    </StyledView>
  );
}

ADrawer.propTypes = {
  content: PropTypes.object.isRequired,
};
