import * as React from 'react';
import { withTheme } from '@rneui/themed';
import { View } from 'react-native';
import PropTypes from 'prop-types';

function StyledView({
  theme, children, style, ...props
}) {
  return (
    <View {...props} style={{ backgroundColor: theme.colors.background, ...(style ?? {}) }}>
      {children}
    </View>
  );
}

StyledView.propTypes = {
  theme: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  style: PropTypes.object.isRequired,
};

export default withTheme(StyledView);
