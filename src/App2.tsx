import React, { Component } from 'react';
import { Text } from 'react-native';

import { createBottomTabNavigator, createDrawerNavigator } from 'react-navigation';
import Home from './containers/Home';
import Settings from './containers/Settings';
import ComicViewer from './components/ComicViewer';

class App extends Component {
	static navigationOptions = {
	  title: 'App',
      header: null,
	}

  render = () => {
    return (
      <>
        <Text>App</Text>
        <ComicViewer/>
      </>
    );
  }
}

const MainNavigator = createDrawerNavigator({
  Home: {
    screen: App,
  },
  Settings: {
    screen: Settings,
  },
});

export default MainNavigator;
