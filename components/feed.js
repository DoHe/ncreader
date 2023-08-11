import 'react-native-gesture-handler';
import {
  StyleSheet, Text, View, FlatList, Image, Platform, useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Icon } from '@rneui/themed';

import moment from 'moment';
import feedsMock from '../mocks/feeds.json';
import foldersMock from '../mocks/folders.json';
import itemsMock from '../mocks/items.json';
import { breakPointDesktop } from '../constants';

const htmlTagsRegex = /(<([^>]+)>)/ig;
const imageRegex = /<img[\s\S]*?src="(.*?)"[\s\S]*?>/;

const feedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const imageFromBody = (body) => {
  const match = body.match(imageRegex);
  if (!match || match.length < 1) {
    return undefined;
  }
  return match[1];
};

function Feed({ folderId, mocked }) {
  const [itemsData, setItemsData] = useState([]);

  const getData = async () => {
    try {
      if (mocked) {
        const feedsInFolder = feedsMock.feeds.filter(
          (item) => item.folderId === folderId,
        );
        const feedsMap = Object.fromEntries(feedsInFolder.map((feed) => [feed.id, feed]));
        const feedIds = Object.keys(feedsMap);
        const items = itemsMock.items.filter(
          (item) => feedIds.includes(`${item.feedId}`),
        ).map(
          (item) => ({
            ...item,
            feedFavicon: feedsMap[`${item.feedId}`].faviconLink,
            feedTitle: feedsMap[`${item.feedId}`].title,
            previewImageURL: item.enclosureLink || imageFromBody(item.body),
          }),
        );
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
    <View style={feedStyles.container}>
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
              <View style={{ flexShrink: 10 }}>
                <Text style={{
                  fontWeight: 'bold',
                }}
                >
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
                <Text>
                  { `${item.body.replace(htmlTagsRegex, '').trim().slice(0, bodyPreviewSize)}...` }
                </Text>
                <Text
                  style={{
                    display: 'flex',
                    fontStyle: 'italic',
                    color: 'gray',
                    alignItems: 'center',
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
                    <Text>
                      &nbsp;{item.feedTitle}
                    </Text>
                  )}
                  <Text>
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
    </View>
  );
}

Feed.propTypes = {
  folderId: PropTypes.number.isRequired,
  mocked: PropTypes.bool.isRequired,
};

export default Feed;
