import { useSelector } from 'react-redux';
import {
  Header, Icon, ListItem, Text, useTheme, Image,
} from '@rneui/themed';
import * as React from 'react';
import { Platform } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import PropTypes from 'prop-types';
import StyledView from './styledView';

function FolderAccordion({ name, children }) {
  const [expanded, setExpanded] = React.useState(false);

  return (<ListItem.Accordion
      content={
        <Text
          onPress={() => { console.log('inner'); }}
          style={{
            display: 'flex',
            flex: 1,
          }}
        >
          <Icon
            name="folder"
            size={20}
            style={{ marginRight: 10 }}
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
  children: PropTypes.object.isRequired,
};

function FeedItem({ name, faviconLink }) {
  return (
    <ListItem
      style={{ marginLeft: 10 }}
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
  faviconLink: PropTypes.string,
};

export default function ADrawer({ content }) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useTheme();

  const folders = useSelector((state) => state.news.folders);
  const accordions = folders.map((folder) => {
    const feeds = useSelector((state) => state.news.feeds);
    const feedItems = feeds.filter((feed) => feed.folderId === folder.id).map((feed) => (
      <FeedItem
        key={feed.id}
        name={feed.title}
        faviconLink={feed.faviconLink}
      />
    ));
    return (<FolderAccordion
      key={folder.id}
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
          <StyledView style={{ flex: 1 }}>
            {accordions}
          </StyledView>
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
