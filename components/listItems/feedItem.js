import { useDispatch, useSelector } from 'react-redux';
import { ListItem, useTheme, Image } from '@rneui/themed';
import React from 'react';
import PropTypes from 'prop-types';
import { setSelectedByFeedId } from '../../slices/newsSlice';

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
        dispatch(setSelectedByFeedId({ id, name }));
        setOpen(false);
      }}
      containerStyle={
        isSelected
          ? { backgroundColor: `${theme.colors.primary}50` }
          : {}
        }
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

export default FeedItem;
