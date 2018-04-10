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
  constructor(props) {
    super(props);
    this.state = {
      settingDays: false,
      settingDepth: false,
      settingStartHour: false,
      settingEndHour: false
    }
    this.handleShowSettingsDays = this.handleShowSettingsDays.bind(this);
    this.handleShowSettingsDepth = this.handleShowSettingsDepth.bind(this);
    this.handleShowSettingsStartHour = this.handleShowSettingsStartHour.bind(this);
    this.handleShowSettingsEndHour = this.handleShowSettingsEndHour.bind(this);
  }
  handleShowSettingsDays() {
    this.props.navigation.navigate('SettingsDays');
  }
  handleShowSettingsDepth() {
    this.props.navigation.navigate('SettingsDepth');
  }
  handleShowSettingsStartHour() {
    this.props.navigation.navigate('SettingsStartHour');
  }
  handleShowSettingsEndHour() {
    this.props.navigation.navigate('SettingsEndHour');
  }

  render() {
    const {
      unitsInFeet,
      days,
      depth,
      startHour,
      endHour,
    } = this.props.screenProps.state;
    const {
      handleChangeUnits
    } = this.props.screenProps.handlers;
    const {
      settingDays,
      settingDepth,
      settingStartHour,
      settingEndHour,
    } = this.state;
    
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
            onPress={handleChangeUnits}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Units</Text>
              <Text style={[material.body1, styles.settingsValue]}>{unitsInFeet ? 'Feet' : 'Meters'}</Text>
            </View>
          </TouchableHighlight>
          
          <TouchableHighlight
            underlayColor='#dddddd'
            onPress={this.handleShowSettingsDays}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Days to Look Forward</Text>
              <Text style={[material.body1, styles.settingsValue]}>{days}</Text>
            </View>      
          </TouchableHighlight>
          
          <TouchableHighlight
            underlayColor='#dddddd'
            onPress={this.handleShowSettingsDepth}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Highest depth to show</Text>
              <Text style={[material.body1, styles.settingsValue]}>{depth} {unitsInFeet ? 'feet' : 'meters'}</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            underlayColor='#dddddd'
            onPress={this.handleShowSettingsStartHour}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Earliest hour to show</Text>
              <Text style={[material.body1, styles.settingsValue]}>{startHour}:00</Text>
            </View>
          </TouchableHighlight>
      
          <TouchableHighlight
            underlayColor='#dddddd'
            onPress={this.handleShowSettingsEndHour}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Latest hour to show</Text>
              <Text style={[material.body1, styles.settingsValue]}>{endHour}:00</Text>
            </View>
          </TouchableHighlight>
          
        </ScrollView>
        
      </View>
    );
  }
}

export class SettingsDays extends React.Component {
  render() {
    const {
      days
    } = this.props.screenProps.state;
    
    return (
      <Text>{days}</Text>
    );
  }
}

export class SettingsDepth extends React.Component {
  render() {
    const {
      unitsInFeet,
      depth
    } = this.props.screenProps.state;
    
    return (
      <Text>{depth}</Text>
    );
  }
}

export class SettingsStartHour extends React.Component {
  render() {
    const {
      startHour
    } = this.props.screenProps;
    
    return (
      <Text>{startHour}</Text>
    );
  }
}

export class SettingsEndHour extends React.Component {
  render() {
    const {
      endHour
    } = this.props.screenProps;
    
    return (
      <Text>{endHour}</Text>
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
