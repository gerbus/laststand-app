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
  TouchableHighlight
} from 'react-native';
import { 
  material, 
  materialColors 
} from 'react-native-typography';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment-timezone';
import { getStatusBarHeight } from 'react-native-status-bar-height';


export default class Settings extends React.Component {
  render() {
    const {
      unitsInFeet,
      days,
      depth,
      startHour,
      endHour,
    } = this.props.screenProps;

    return (
      <View
        style={styles.appContainer}
        >

        {/* Settings */}
        <ScrollView
          style={styles.scrollView}
          >

          <TouchableHighlight 
            underlayColor='#dddddd'
            onPress={() => this.props.navigation.navigate('SettingUnits')}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Units</Text>
              <Text style={[material.body1, styles.settingsValue]}>{unitsInFeet ? 'Feet' : 'Meters'}</Text>
            </View>
          </TouchableHighlight>
    
          <View style={styles.row}>
            <Text style={material.subheading}>Days to Look Forward</Text>
            <Text style={[material.body1, styles.settingsValue]}>{days}</Text>
          </View>      

          <View style={styles.row}>
            <Text style={material.subheading}>Highest depth to show</Text>
            <Text style={[material.body1, styles.settingsValue]}>{depth} {unitsInFeet ? 'feet' : 'meters'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={material.subheading}>Earliest hour to show</Text>
            <Text style={[material.body1, styles.settingsValue]}>{startHour}:00</Text>
          </View>
      
          <View style={styles.row}>
            <Text style={material.subheading}>Latest hour to show</Text>
            <Text style={[material.body1, styles.settingsValue]}>{endHour}:00</Text>
          </View>
          
        </ScrollView>
        
      </View>
    );
  }
}

export class SettingUnits extends React.Component {
  render() {
    const {
      unitsInFeet
    } = this.props.screenProps;
    
    return (
      <Text>Modal</Text>
    );
  }
}
const styles = StyleSheet.create({
  appContainer: {
    flex: 1, /* need to set for ScrollView to have right height */
  },
  scrollView: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  row: {
    paddingLeft: 21,
    paddingRight: 21,
    paddingTop: 13,
    paddingBottom: 13,
    borderBottomWidth: 1 / PixelRatio.get(),
    borderBottomColor: '#a07e4c',
  },
  settingsValue: {
    color: materialColors.blackSecondary
  }
});
