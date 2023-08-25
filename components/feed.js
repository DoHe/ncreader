import {
  View, FlatList, Pressable, Linking,
} from 'react-native';
import React from 'react';
import PropTypes, { func } from 'prop-types';
import {
  Text, useTheme, Image, Icon, ListItem, Button,
} from '@rneui/themed';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { readItem, starItem, unstarItem } from '../data/news';
import { markItemRead, toggleStarredItem } from '../slices/newsSlice';

const htmlTagsRegex = /(<([^>]+)>)/ig;
const imageRegex = /<img[\s\S]*?src="(.*?)"[\s\S]*?>/;

const imageFromBody = (body) => {
  const match = body.match(imageRegex);
  if (!match || match.length < 1) {
    return undefined;
  }
  return match[1];
};

function mapItem(item, feedsMap) {
  return {
    ...item,
    feedFavicon: feedsMap[`${item.feedId}`]?.faviconLink,
    feedTitle: feedsMap[`${item.feedId}`]?.title,
    previewImageURL: item.enclosureLink || imageFromBody(item.body),
  };
}

function toggleStar(item, credentials, dispatch) {
  dispatch(toggleStarredItem(item.id));
  if (item.starred) {
    unstarItem({ id: item.id, credentials });
  } else {
    starItem({ id: item.id, credentials });
  }
}

function markItemAsRead(item, credentials, dispatch) {
  dispatch(markItemRead(item.id));
  readItem({ id: item.id, credentials });
}

function shareItem(item) {
  console.log(`Should share: ${item.id}`);
}

function FeedItem({ item, theme }) {
  const dispatch = useDispatch();
  const credentials = useSelector((state) => state.user.credentials);
  return (
    <ListItem.Swipeable
      bottomDivider={true}
      leftContent={(reset) => (
        <Button
          onPress={() => {
            shareItem(item);
            reset();
          }}
          icon={{ name: 'open-in-browser', type: 'material-icons', color: theme.colors.white }}
          buttonStyle={{ minHeight: '100%' }}
        />
      )}
      rightContent={(reset) => (
        <Button
          onPress={() => {
            toggleStar(item, credentials, dispatch);
            reset();
          }}
          icon={{ name: 'star', type: 'ant-design', color: theme.colors.black }}
          buttonStyle={{ minHeight: '100%', backgroundColor: theme.colors.warning }}
        />
      )}
    >
      <ListItem.Content>
        <Pressable
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          }}
          onPress={() => {
            if ((new Date().getTime() - this.lastClick) <= 200) {
              clearTimeout(this.singleClickTimeout);
              toggleStar(item, credentials, dispatch);
              return;
            }
            this.lastClick = new Date().getTime();
            this.singleClickTimeout = setTimeout(() => {
              Linking.openURL(item.url);
              markItemAsRead(item, credentials, dispatch);
            }, 201);
          }}
          onLongPress={() => console.log('long pressed')}
        >
          <View style={{
            display: 'flex',
            flexShrink: 10,
          }}>
            <Text
            numberOfLines={2}
            style={{
              fontWeight: item.unread ? 'bold' : 'normal',
              color: item.unread ? theme.colors.black : theme.colors.grey3,
            }}>
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                color: item.unread ? theme.colors.black : theme.colors.grey3,
                marginBottom: 5,
                marginTop: 5,
              }}>
              { item.body.replace(htmlTagsRegex, '').trim()}
            </Text>
            <View
              style={{
                display: 'flex',
                fontStyle: 'italic',
                alignItems: 'center',
                marginTop: 'auto',
                flexWrap: 'nowrap',
                flexDirection: 'row',
              }}
            >
              { item.feedFavicon && (
                <Image
                  source={{ uri: item.feedFavicon }}
                  style={{
                    width: 16,
                    height: 16,
                  }}
                />
              )}
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.grey4,
                  flexShrink: 100,
                }}
              >
                &nbsp;{item.feedTitle}
              </Text>
              <Text style={{
                color: theme.colors.grey4,
              }}>
                &nbsp;·&nbsp;
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.grey4,
                  flexShrink: 1,
                }}
              >
                { moment(item.pubDate * 1000).fromNow(true) }
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            { item.previewImageURL && (
              <Image
                source={{ uri: item.previewImageURL }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  marginBottom: 10,
                }}
              />
            )}
            { item.starred && (
                  <Icon
                    name='star'
                    type='ant-design'
                    color={theme.colors.warning}
                    size={16}
                  />
            )}
          </View>
        </Pressable>
      </ListItem.Content>
    </ListItem.Swipeable>
  );
}

FeedItem.propTypes = {
  item: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default function Feed({ items, feeds }) {
  const { theme } = useTheme();
  const feedsMap = Object.fromEntries(feeds.map((feed) => [feed.id, feed]));
  const mappedItems = items.map((item) => mapItem(item, feedsMap));

  return <FlatList
        style={{ marginLeft: 5, marginRight: 5, width: '100%' }}
        data={mappedItems}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <FeedItem
            item={item}
            theme={theme}
          />
        )}
      />;
}

Feed.propTypes = {
  items: PropTypes.array.isRequired,
  feeds: PropTypes.array.isRequired,
};
