import { FlatList } from 'react-native';
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import FeedItem from './feedItem';
import sync from '../data/sync';

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

function onItemsChanged(event) {
  const { changed, viewableItems } = event;
  if (changed.length > 1) {
    return;
  }
  const mostRecent = Math.max(...viewableItems.map((item) => (item.item.pubDate)));
  changed.forEach(({ isViewable, item }) => {
    if (!isViewable) {
      if (item.pubDate >= mostRecent) {
        console.log(`mark read: ${item.title}`);
      }
    }
  });
}

function onScroll({ nativeEvent }) {
  const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
  const difference = Math.abs(contentSize.height - layoutMeasurement.height - contentOffset.y);
  if (difference < 5) {
    console.log('scrolled to bottom');
  }
}

export default function Feed({ items, feeds }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const feedsMap = Object.fromEntries(feeds.map((feed) => [feed.id, feed]));
  const mappedItems = items.map((item) => mapItem(item, feedsMap));
  const dispatch = useDispatch();
  const credentials = useSelector((state) => state.user.credentials);

  const viewabilityConfigCallbackPairs = useRef([{
    onViewableItemsChanged: onItemsChanged,
  }]);

  return <FlatList
        style={{
          marginLeft: 5,
          marginRight: 5,
          width: '100%',
        }}
        // contentContainerStyle={{ height: '105%' }}
        data={mappedItems}
        keyExtractor={({ id }) => id}
        onScroll={onScroll}
        overScrollMode='always'
        onRefresh={async () => {
          setRefreshing(true);
          await sync({ dispatch, credentials });
          setRefreshing(false);
        }}
        refreshing={refreshing}
        // onViewableItemsChanged={onItemsChanged}
        viewabilityConfigCallbackPairs={
          viewabilityConfigCallbackPairs.current
        }
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
