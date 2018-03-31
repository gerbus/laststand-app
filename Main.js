import moment from 'moment-timezone';
import { material } from 'react-native-typography';
import waiting from './spiffygif_40x40.gif';
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


export default class Main extends React.Component {
  render() {
    const {
      currentDate,
      currentTime,
      currentDepth,
      unitsInFeet,
      currentDirection,
      currentRate,
      dataFetched,
      data,
      handleSettingsClick,
    } = this.props;

    return (
      <View
        style={styles.appContainer}
        >

        {/* App Title Bar */}
        <View 
          style={styles.titleBar}
          >  
          <View style={{flex: 4}}>
            <Text style={material.titleWhite}>Low Tide Predictor</Text>
            <Text style={material.subheadingWhite}>Vancouver, BC</Text>
          </View>
          <View style={{flex: 1}}>
            <TouchableOpacity
              onPress={handleSettingsClick}
              >
              <IconMaterial 
                style={styles.alignEnd}
                name='settings' 
                size={28} 
                color='white'
                />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Current Conditions Bar */}
        <View 
          style={styles.conditionsBar}
          >
          
          <View style={{flex: 1}}>
            <Text style={styles.info}>{currentDate}</Text>
            <Text style={styles.info}>{currentTime}</Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={[styles.info, styles.alignR]}>Current depth is {parseFloat(currentDepth).toFixed(2)} {unitsInFeet ? "ft" : "m"}</Text>
            <Text style={[styles.info, styles.alignR]}>({currentDirection} at {
            unitsInFeet ? 
              parseFloat(currentRate * 12).toFixed(1) + " inches"
            :
              parseFloat(currentRate * 100).toFixed(1) + " cm"
          }/min)
            </Text>
          </View>

        </View>        
        
        {/* App Content */}
        <ScrollView
          style={styles.scrollView}
          >

          {/* Results Table */}
          <View>

            {/* Headings */}
            {(dataFetched && data.length > 0) ? (
              <View style={styles.row}>
                <View style={{flex: 5}}>
                  <Text style={styles.tableHeading}>When</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={[styles.alignR, styles.tableHeading]}>Low Tide Level</Text>
                </View>
              </View>
            ) : null}

            <View>
            {
              (dataFetched) ? (
                (data.length > 0) ? (
                  data.map((item, index) => (
                    <View style={styles.row} key={index}>
                      <View style={{flex: 5}}>
                        <Text>{item.date}</Text>
                        <Text>{item.time}</Text>
                      </View>
                      <View style={{flex: 1, alignSelf: 'center'}}>
                        <Text style={styles.alignR}>{parseFloat(item.tideLevel).toFixed(1)} {unitsInFeet ? "ft" : "m"}</Text>
                      </View>
                    </View>
                  )) 
                ) : (
                  <View>
                    <Text>No results...</Text>
                  </View>
                )
              ) : (
                <View>
                  <Image source={waiting} alt="Loading data..."/>
                </View>
              )
            }
            </View>

          </View>

          {/* Footer/info */}
          <View
            style={styles.footerContainer}
            >
            
            <Text 
              style={[styles.info, {marginTop: 12}]}
              >Meteorological conditions can cause differences (time and height) between the predicted and the observed tides. These differences are mainly the result of atmospheric pressure changes, strong prolonged winds or variations of freshwater discharge.
    </Text>
            <Text
              style={[styles.info, {marginTop: 12}]}
              >Low tide levels are in reference to a fixed vertical datum, which water levels should rarely drop beneath.</Text>
            
            <TouchableOpacity
              onPress={ ()=>{ Linking.openURL('http://www.tides.gc.ca/eng/info/verticaldatums') }}
              >
              <Text style={[styles.info, styles.link]}>Read more about vertical datums</Text>
            </TouchableOpacity>
            
            <Text 
              style={[styles.info, {marginTop: 12}]}
              >Data provided by the</Text>
            <TouchableOpacity
              onPress={ ()=>{ Linking.openURL('http://www.charts.gc.ca/help-aide/about-apropos/index-eng.asp') }}
              >
              <Text style={[styles.info, styles.link]}>Canadian Hydrographic Service</Text>
            </TouchableOpacity>
            
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
  background: {
    position: 'absolute',
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    paddingTop: 13 + getStatusBarHeight(),
    backgroundColor: 'rgba(160,126,76,0.6)',
  },
  conditionsBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    backgroundColor: 'rgba(160,126,76,0.4)'
  },
  title: {
    fontSize: 20,
    color: 'white',
  },
  subTitle: {
    fontSize: 14,
    color: 'white',
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
  },
  tableHeading: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 12
  },
  alignR: {
    textAlign: 'right',
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  link: {
    color: '#88ff88',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  footerContainer: {
    padding: 13,
  }
});
