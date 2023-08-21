import { useDispatch, useSelector } from 'react-redux';
import { Icon, ListItem, useTheme } from '@rneui/themed';
import React from 'react';
import PropTypes from 'prop-types';

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
      containerStyle={
      isSelected
        ? { backgroundColor: `${theme.colors.primary}50` }
        : {}
      }
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

export default CustomItem;
