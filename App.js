import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, Button, FlatList, ActivityIndicator, Image, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useEffect, useState } from 'react';
import mock from './mock';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mocked = true;

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getMovies = async () => {
    try {
      if (mocked) {
        setData(mock.Comics);
      } else {
        const response = await fetch('https://reactnative.dev/movies.json');
        const json = await response.json();
        setData(json.movies);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMovies();
  }, []);

  return (
    <View style={styles.container}>
      <Text>My texts 2</Text>
      <Button
        onPress={() => {
          console.log('You tapped the button!');
        }}
        title="Press Me"
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={data}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => (
            <View>
              <Image
                source={{ uri: item.favicon }}
                style={{ width: 16, height: 16 }}
              />
              <Text>
                {item.title}
              </Text>
              {Platform.OS === 'web' ? (
                <div dangerouslySetInnerHTML={{ __html: item.body }} />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: item.body }}
                  style={{
                    backgroundColor: 'ff0000',
                    width: 100,
                    height: 100,
                  }}
                />)}
            </View>
          )}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
