import * as React from 'react';
import { withTheme } from '@rneui/themed';
import { View } from 'react-native';

function StyledView({
  theme, children, style, ...props
}) {
  return (
    <View {...props} style={{ backgroundColor: theme.colors.background, ...(style ?? {}) }}>
      {children}
    </View>
  );
}

export default withTheme(StyledView);
