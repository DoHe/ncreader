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
  setSelectedByFeedId, setSelectedByFolderId, setSelectedByUnread, setSelectedByStarred,
} from '../slices/newsSlice';

function selectedStyle(theme) {
  return {
    backgroundColor: `${theme.colors.primary}50`,
  };
}

function FolderAccordion({
  id, name, children, setOpen,
}) {
  const [expanded, setExpanded] = React.useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isSelected = useSelector(
    (state) => state.news.selectionType === 'folder' && state.news.selectionId === id,
  );

  return (<ListItem.Accordion
      content={
        <Text
          onPress={() => {
            dispatch(setSelectedByFolderId(id));
            setOpen(false);
          }}
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
      containerStyle={isSelected ? selectedStyle(theme) : {}}

    >
      {children}
    </ListItem.Accordion>);
}

FolderAccordion.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  children: PropTypes.array.isRequired,
  setOpen: PropTypes.func.isRequired,
};

function FeedItem({
  id, name, faviconLink, setOpen,
}) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isSelected = useSelector(
    (state) => state.news.selectionType === 'feed' && state.news.selectionId === id,
  );

  return (
    <ListItem
      style={{ marginLeft: 10 }}
      onPress={() => {
        dispatch(setSelectedByFeedId(id));
        setOpen(false);
      }}
      containerStyle={isSelected ? selectedStyle(theme) : {}}
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
  setOpen: PropTypes.func.isRequired,
};

function CustomItem({
  title, iconName, iconType, selectionFunc, selectionType, setOpen,
}) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isSelected = useSelector(
    (state) => state.news.selectionType === selectionType,
  );

  return (
    <ListItem
      onPress={() => {
        dispatch(selectionFunc());
        setOpen(false);
      }}
      containerStyle={isSelected ? selectedStyle(theme) : {}}
    >
      <Icon
        name={iconName}
        type={iconType}
        size={20}
      />
      <ListItem.Content>
        <ListItem.Title>{title}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}

CustomItem.propTypes = {
  title: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
  iconType: PropTypes.string.isRequired,
  selectionFunc: PropTypes.func.isRequired,
  selectionType: PropTypes.string.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default function ADrawer({ content, folders, feeds }) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useTheme();

  const accordions = folders.map((folder) => {
    const feedItems = feeds.filter((feed) => feed.folderId === folder.id).map((feed) => (
      <FeedItem
        key={feed.id}
        id={feed.id}
        name={feed.title}
        faviconLink={feed.faviconLink}
        setOpen={setOpen}
      />
    ));
    return (<FolderAccordion
      key={folder.id}
      id={folder.id}
      name={folder.name}
      setOpen={setOpen}
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
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>News</Text>
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
