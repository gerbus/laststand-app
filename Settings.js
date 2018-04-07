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
  TouchableHighlight,
  Modal,
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
      settingEndHour: false,
    };
    this.handleShowDaysModal = this.handleShowDaysModal.bind(this);
    this.handleHideDaysModal = this.handleHideDaysModal.bind(this);
  }
  handleShowDaysModal() {
    //this.props.navigation.setParams({ headerStyleBackgroundColor: '#000000' });
    this.setState({settingDays: true});
  }
  handleHideDaysModal() {
    //this.props.navigation.setParams({ headerStyleBackgroundColor: '#977651' });
    this.setState({settingDays: false});
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
    
    //console.log(this.props);
    
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
            onPress={this.handleShowDaysModal}
            >
            <View style={styles.row}>
              <Text style={material.subheading}>Days to look forward</Text>
              <Text style={[material.body1, styles.settingsValue]}>{days}</Text>
            </View>
          </TouchableHighlight>

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
        
        {/* Modals */}
        <Modal
          visible={settingDays}
          onRequestClose={this.handleHideDaysModal}
          transparent={true}
          animationType='fade'
          >
          <View style={styles.modalBackground}>
            <Text>Setting days...</Text>
          </View>
        </Modal>
        
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
  },
  modalBackground: {
    position: 'absolute',
    top: -10,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  hidden: {
    display: 'none'
  }
});
