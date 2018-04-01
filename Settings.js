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

          <View style={styles.row}>
            <Text style={material.subheading}>Units</Text>
            <Text style={[material.body1, styles.settingsValue]}>{unitsInFeet ? 'Feet' : 'Meters'}</Text>
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
