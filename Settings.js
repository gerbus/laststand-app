import moment from 'moment-timezone';
import { material } from 'react-native-typography';
import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  PixelRatio,
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { getStatusBarHeight } from 'react-native-status-bar-height';


export default class Settings extends React.Component {
  render() {
    /*const {
      unitsInFeet,
    } = this.props;*/

    return (
      <View
        style={styles.appContainer}
        >

        {/* App Title Bar */}
        <View 
          style={styles.titleBar}
          >  
          <View style={{flex: 4}}>
            <Text style={material.titleWhite}>Settings</Text>
          </View>
          <View style={{flex: 1}}>
            
          </View>
        </View>
        
        {/* Settings */}
        <ScrollView
          style={styles.scrollView}
          >

          <View>
            <Text>Settings</Text>
          </View>
          
        </ScrollView>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1, /* need to set for ScrollView to have right height */
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    paddingTop: 13 + getStatusBarHeight(),
    backgroundColor: 'rgba(160,126,76,0.6)',
  },
  scrollView: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 21,
    paddingRight: 21,
    paddingTop: 13,
    paddingBottom: 13,
    borderBottomWidth: 1 / PixelRatio.get(),
    borderBottomColor: '#a07e4c',
  }
});
