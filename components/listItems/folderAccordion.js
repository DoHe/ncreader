import { useDispatch, useSelector } from 'react-redux';
import {
  Icon, ListItem, Text, useTheme,
} from '@rneui/themed';
import React from 'react';
import PropTypes from 'prop-types';
import { setSelectedByFolderId } from '../../slices/newsSlice';

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
            dispatch(setSelectedByFolderId({ id, name }));
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
      containerStyle={
        isSelected
          ? { backgroundColor: `${theme.colors.primary}50` }
          : {}
        }
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

export default FolderAccordion;
