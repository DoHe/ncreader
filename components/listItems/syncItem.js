import { Icon, ListItem } from '@rneui/themed';
import React, { useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import sync from '../../data/sync';

function SyncItem({ theme }) {
  const dispatch = useDispatch();
  const credentials = useSelector((state) => state.user.credentials);
  const syncing = useSelector((state) => state.news.syncing);

  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const rotation = Animated.loop(
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }),
  );

  const startRotate = () => {
    rotation.reset();
    rotation.start();
  };
  const stopRotate = () => {
    rotation.stop();
  };

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (syncing) {
    startRotate();
  } else {
    stopRotate();
  }

  return (
    <ListItem
      containerStyle={{
        backgroundColor: theme.colors.primary,
      }}
      onPress={async () => {
        if (syncing) {
          console.log('already syncing...');
          return;
        }
        sync({ dispatch, credentials });
      }}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Icon
          name="sync"
          size={24}
        />
      </Animated.View>
      <ListItem.Content>
        <ListItem.Title style={{
          fontWeight: 'bold',
          fontSize: 24,
        }}
        >
          News
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}

SyncItem.propTypes = {
  theme: PropTypes.object.isRequired,
};

export default SyncItem;
