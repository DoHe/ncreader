import 'react-native-gesture-handler';
import {
  StyleSheet, View, FlatList, Platform, useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Text, useTheme, Image,
} from '@rneui/themed';

import moment from 'moment';
import feedsMock from '../mocks/feeds.json';
import foldersMock from '../mocks/folders.json';
import itemsMock from '../mocks/items.json';
import { breakPointDesktop } from '../constants';
import StyledView from './styledView';

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
    feedFavicon: feedsMap[`${item.feedId}`].faviconLink,
    feedTitle: feedsMap[`${item.feedId}`].title,
    previewImageURL: item.enclosureLink || imageFromBody(item.body),
  };
}

function itemsForFolder(folderId) {
  const feedsInFolder = feedsMock.feeds.filter(
    (feed) => feed.folderId === folderId,
  );
  const feedsMap = Object.fromEntries(feedsInFolder.map((feed) => [feed.id, feed]));
  const feedIds = Object.keys(feedsMap);
  return itemsMock.items.filter(
    (item) => feedIds.includes(`${item.feedId}`),
  ).map(
    (item) => (mapItem(item, feedsMap)),
  );
}

function itemsForFeed(feedId) {
  const feedForId = feedsMock.feeds.find((feed) => feed.id === feedId);
  const feedsMap = {};
  feedsMap[feedId] = feedForId;
  return itemsMock.items.filter(
    (item) => feedId === item.feedId,
  ).map(
    (item) => (mapItem(item, feedsMap)),
  );
}

function unreadItems() {
  const feedsMap = Object.fromEntries(feedsMock.feeds.map((feed) => [feed.id, feed]));
  return itemsMock.items.filter((item) => item.unread).map((item) => mapItem(item, feedsMap));
}

function Feed(props) {
  const mocked = true;
  const { folderId, feedId, unread } = props.route.params;
  const [itemsData, setItemsData] = useState([]);
  const { theme } = useTheme();

  const getData = async () => {
    try {
      if (mocked) {
        let items = [];
        if (folderId) {
          items = itemsForFolder(folderId);
        } else if (feedId) {
          items = itemsForFeed(feedId);
        } else if (unread) {
          items = unreadItems();
        }
        setItemsData(items);
      } else {
        const response = await fetch('https://reactnative.dev/movies.json');
        const json = await response.json();
        setItemsData(json.movies);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const dimensions = useWindowDimensions();
  const bodyPreviewSize = dimensions.width >= breakPointDesktop ? 400 : 100;

  return (
    <StyledView style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <FlatList
        style={{ marginLeft: 5, marginRight: 5, width: '100%' }}
        data={itemsData}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <Card style={{ marginTop: 20 }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 10,
            }}>
              <View style={{
                display: 'flex',
                flexShrink: 10,
              }}>
                <Text style={{
                  fontWeight: item.unread ? 'bold' : 'normal',
                  color: item.unread ? theme.colors.black : theme.colors.grey3,
                }}>
                  {item.title}
                </Text>
                {/* <View>
                  {Platform.OS === 'web' ? (
                    <div dangerouslySetInnerHTML={{ __html: item.body }} />
                  ) : (
                    <WebView
                      originWhitelist={['*']}
                      source={{ html: item.body }}
                      style={{
                        height: 100,
                      }}
                    />)}
                    </View> */}
                <Text style={{
                  color: item.unread ? theme.colors.black : theme.colors.grey3,
                  marginBottom: 5,
                  marginTop: 5,
                }}>
                  { `${item.body.replace(htmlTagsRegex, '').trim().slice(0, bodyPreviewSize)}...` }
                </Text>
                <Text
                  style={{
                    display: 'flex',
                    fontStyle: 'italic',
                    alignItems: 'center',
                    marginTop: 'auto',
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
                  { item.feedTitle && (
                    <Text style={{ color: theme.colors.grey4 }}>
                      &nbsp;{item.feedTitle}
                    </Text>
                  )}
                  <Text style={{ color: theme.colors.grey4 }}>
                    &nbsp;·&nbsp;{ moment(item.pubDate * 1000).fromNow() }
                  </Text>
                </Text>
              </View>
              { item.previewImageURL && (
                <Image
                  source={{ uri: item.previewImageURL }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                  }}
                />
              )}
            </View>
          </Card>
        )}
      />
    </StyledView>
  );
}

Feed.propTypes = {
  route: PropTypes.object.isRequired,
};

export default Feed;
