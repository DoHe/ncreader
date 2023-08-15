import {
  Header, Icon, Text, useTheme,
} from '@rneui/themed';
import * as React from 'react';
import { Platform } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import PropTypes from 'prop-types';
import StyledView from './styledView';

export default function ADrawer({ content }) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useTheme();

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
            <Text>Drawer content</Text>
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
