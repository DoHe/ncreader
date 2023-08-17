import 'react-native-gesture-handler';
import { View, FlatList, useWindowDimensions } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Text, useTheme, Image, Icon,
} from '@rneui/themed';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { breakPointDesktop } from '../constants';

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

function FeedItem({ item, theme, bodyPreviewSize }) {
  return (
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
      </View>
    </Card>
  );
}

FeedItem.propTypes = {
  item: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  bodyPreviewSize: PropTypes.number.isRequired,
};

export default function Feed() {
  const { theme } = useTheme();
  const feeds = useSelector((state) => state.news.feeds);
  const feedsMap = Object.fromEntries(feeds.map((feed) => [feed.id, feed]));
  const items = useSelector(
    (state) => state.news.selectedItems,
  ).map(
    (item) => mapItem(item, feedsMap),
  );

  const dimensions = useWindowDimensions();
  const bodyPreviewSize = dimensions.width >= breakPointDesktop ? 400 : 100;

  return <FlatList
        style={{ marginLeft: 5, marginRight: 5, width: '100%' }}
        data={items}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <FeedItem
            item={item}
            theme={theme}
            bodyPreviewSize={bodyPreviewSize}
          />
        )}
      />;
}
