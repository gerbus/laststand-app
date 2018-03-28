import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  AsyncStorage,
  ScrollView,
  Button,
  TextInput,
  Image,
  WebView,
  Linking,
  StatusBar,
  TouchableOpacity,
  PixelRatio,
} from 'react-native';
import moment from 'moment-timezone';
import waiting from './spiffygif_40x40.gif';
import background from './last_stand_2015_july_selgauss_cropped.jpg';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { material } from 'react-native-typography';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      days: 30,
      depth: 1.5,
      startHour: 9,
      endHour: 16,
      data: [],
      currentDepth: null,
      currentDirection: "", // "rising" or "falling"
      currentRate: null,
      currentDate: null,
      currentTime: null,
      showSubmit: false,
      dataFetched: false,
      unitsInFeet: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleChangeUnits = this.handleChangeUnits.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
  }
  componentDidMount() {
    // Check storage for params, apply to state
    const state = this.state;
    AsyncStorage.getItem('days')
    .then(days => {
      state.days = days;
    });
    AsyncStorage.getItem('depth')
    .then(depth => {
      state.depth = depth;
    });
    AsyncStorage.getItem('startHour')
    .then(startHour => {
      state.startHour = startHour;
    });
    AsyncStorage.getItem('endHour')
    .then(endHour => {
      state.endHour = endHour;
    });
    this.setState(state);
    
    // Fetch data from Canadian Hydrographic Service
    this.getData();
    
    // Refresh current conditions every 5s, time every 1s
    setInterval(() => {this.getCurrentConditionsData();}, 5000);
    setInterval(() => {this.getCurrentTime();}, 1000);
  }
  getData() {
    this.getLowTideData();
    this.getCurrentConditionsData();
  }
  getLowTideData() {
    // Get Low Tide Prediction Data
    const startDate = moment();
    const endDate = moment().add(this.state.days,"days");
    //console.log("lowTideData",startDate,endDate);
    const endpoint = "http://api.gerbus.ca/chs/hilo/" + startDate.valueOf() + "-" + endDate.valueOf();  // .valueOf always gets UTC
    
    fetch(endpoint)
    .then(resp => resp.json())
    .then(rawData => {
      //console.log(rawData.searchReturn.data);
      let data = [];
      let depthInMeters = this.getInMeters(this.state.depth);
      rawData.searchReturn.data.data.map(item => {
        let itemDateTime = moment.utc(item.boundaryDate.max.$value,"YYYY-MM-DD HH:mm:ss");
        itemDateTime = itemDateTime.tz("America/Vancouver");  // Convert to Vancouver Time
        const itemTideLevel = item.value.$value;  // Always in meters
        
        // Filter results
        if (itemTideLevel <= depthInMeters && 
            this.state.startHour <= itemDateTime.hours() && 
            itemDateTime.hours() < this.state.endHour) {
          
          // Highlight weekends and long weekends
          let itemClassName = "";
          switch (itemDateTime.day()) {
            case 0:
            case 6:
              itemClassName = "weekend";
              break;
            case 1:
            case 5:
              itemClassName = "longweekend";
              break;
          }
          
          // Convert depths to feet if necessary
          let tideLevelInCurrentUnits = itemTideLevel;  // always in meters
          if (this.state.unitsInFeet) {
            tideLevelInCurrentUnits = this.convertMetersToFeet(itemTideLevel).toFixed(2);
          }
          
          // Build data
          data.push({
            className: itemClassName,
            date: itemDateTime.format("dddd, MMM D"),
            time: itemDateTime.format("h:mma"),
            tideLevel: tideLevelInCurrentUnits
          });
        }
      });
      
      // Push to state (render)
      this.setState({data: data, dataFetched: true});
    })
    .catch(err => console.log("Fetch error: " + err))
  }
  getCurrentConditionsData() {
    // Get Current Water Level Prediction Data
    const nowUtc = moment().format("YYYY-MM-DD HH:mm:ss");
    //console.log(nowUtc);
    const startDate = moment(nowUtc).subtract(16,"m");
    const endDate = moment(nowUtc).add(14,"m");
    //console.log(startDate,endDate);
    const endpoint = "http://api.gerbus.ca/chs/wl15/" + startDate.valueOf() + "-" + endDate.valueOf();  // .valueOf always gets UTC
    
    fetch(endpoint)
    .then(resp => resp.json())
    .then(rawData => {
      //console.log(rawData.searchReturn.data);
      const l1 = parseFloat(rawData.searchReturn.data.data[0].value.$value);
      const l2 = parseFloat(rawData.searchReturn.data.data[1].value.$value);
      const t1 = moment.utc(rawData.searchReturn.data.data[0].boundaryDate.max.$value).valueOf();
      const t2 = moment.utc(rawData.searchReturn.data.data[1].boundaryDate.max.$value).valueOf();
      //console.log("t1",t1,rawData.searchReturn.data.data[0].boundaryDate.max.$value);
      //console.log("t2",t2,rawData.searchReturn.data.data[1].boundaryDate.max.$value);
      //console.log("t",moment().valueOf());
      
      // Linear interpolation
      const intervalL = l2 - l1;  // meters
      const intervalT = t2 - t1;  // milliseconds
      const t = moment();
      const dT = t.valueOf() - t1;  // milliseconds
      const dL = intervalL * dT / intervalT;  // interpolate; meters
      const l = l1 + dL;
      //console.log("intervalL",intervalL,"dT",dT,"intervalT",intervalT,"dL",dL,"l1",l1);
      
      // Convert depths to feet if necessary
      let waterLevelInCurrentUnits = l;   // always in meters
      let depthChangeRateInCurrentUnits = Math.abs(dL) * 60000 / dT;   // meters per minute
      if (this.state.unitsInFeet) {
        waterLevelInCurrentUnits = this.convertMetersToFeet(waterLevelInCurrentUnits).toFixed(2);
        depthChangeRateInCurrentUnits = this.convertMetersToFeet(depthChangeRateInCurrentUnits).toFixed(2);
      }
      
      // Direction
      const direction = (dL < 0) ? "falling" : "rising";
      
      this.setState({
        currentDepth: waterLevelInCurrentUnits, 
        currentRate: depthChangeRateInCurrentUnits, 
        currentDirection: direction
      });
      //console.log(t1,t2,l1,l2,intervalT,intervalL,dT,dL,l1+dL);
    })
    .catch(err => console.log("Fetch error: " + err))
  }
  getCurrentTime() {
    this.setState({
      currentDate: moment().tz("America/Vancouver").format("ddd, MMM D, YYYY"),
      currentTime: moment().tz("America/Vancouver").format("h:mm:ssa z")
    });
  }
  render() {
    const endDate = moment().add(this.state.days,"days");
    
    return (
      <View
        style={styles.appContainer}
        >
       
        {/* Background */}
        <Image
          source={background}
          style={styles.background}
          />
        
        {/* System Status Bar */}
        <StatusBar
          networkActivityIndicatorVisible={true}
          barStyle='light-content'>
        </StatusBar>        

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
              onPress={this.handleSettingsClick}
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
            <Text style={styles.info}>{this.state.currentDate}</Text>
            <Text style={styles.info}>{this.state.currentTime}</Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={[styles.info, styles.alignR]}>Current depth is {parseFloat(this.state.currentDepth).toFixed(2)} {this.state.unitsInFeet ? "ft" : "m"}</Text>
            <Text style={[styles.info, styles.alignR]}>({this.state.currentDirection} at {
            this.state.unitsInFeet ? 
              parseFloat(this.state.currentRate * 12).toFixed(1) + " inches"
            :
              parseFloat(this.state.currentRate * 100).toFixed(1) + " cm"
          }/min)
            </Text>
          </View>

        </View>        
        
        {/* App Content */}
        <ScrollView
          style={styles.scrollView}
          >

          {/* Intro */}
          <View 
            style={[styles.frostedGlass, {marginTop: 25, display: 'none'}]}
            >
            
            <View>
              <Text>Listed below are dates within 
                <TextInput 
                  type="number" 
                  max="365"
                  id="days" 
                  value={this.state.days.toString()} 
                  onChange={this.handleChange} 
                  onFocus={this.handleFocus}
                  />
                days (today to {endDate.format("MMM Do")}) on which low tide levels of less than 
                <TextInput 
                  type="number"
                  step="any"
                  id="depth" 
                  value={this.state.depth.toString()} 
                  onChange={this.handleChange}  
                  onFocus={this.handleFocus}
                  />
                {this.state.unitsInFeet ? "ft" : "m"} occur between the hours of 
                <TextInput 
                  type="number" 
                  max="24" 
                  id="startHour" 
                  value={this.state.startHour.toString()} 
                  onChange={this.handleChange}  
                  onFocus={this.handleFocus}
                  />
                :00 and 
                <TextInput 
                  type="number" 
                  max="24" 
                  id="endHour" 
                  value={this.state.endHour.toString()} 
                  onChange={this.handleChange}  
                  onFocus={this.handleFocus}
                  />
                :00 on Vancouver shores.
              </Text>
              <View style={{width:"100%"}}>
                { (this.state.showSubmit) ? (
                <Button 
                  className="btn btn-primary btn-sm" 
                  onPress={this.handleSubmit}
                  title="Find Low Tides"
                />
                  ) : null
                 }
                <Button 
                  onPress={this.handleChangeUnits}
                  title={"Switch to" + this.state.unitsInFeet ? 'meters' : 'feet'}
                />
              </View>
            </View>
          </View>

          {/* Results Table */}
          <View>

            {/* Headings */}
            {(this.state.dataFetched && this.state.data.length > 0) ? (
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
              (this.state.dataFetched) ? (
                (this.state.data.length > 0) ? (
                  this.state.data.map((item, index) => (
                    <View style={styles.row} key={index}>
                      <View style={{flex: 5}}>
                        <Text>{item.date}</Text>
                        <Text>{item.time}</Text>
                      </View>
                      <View style={{flex: 1, alignSelf: 'center'}}>
                        <Text style={styles.alignR}>{parseFloat(item.tideLevel).toFixed(1)} {this.state.unitsInFeet ? "ft" : "m"}</Text>
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
  handleFocus(e) {
    e.target.select();
  }
  handleChange(e) {
    if (e.target.type === "number" && e.target.max) {
      if (parseFloat(e.target.value) > parseFloat(e.target.max)) {
        return;
      } 
    }
    this.setState({[e.target.id]: e.target.value, showSubmit: true});
  }
  handleSubmit(e) {
    e.preventDefault();
    this.setState({dataFetched: false, showSubmit: false});

    // Push to browser history
    let depthInMeters = this.getInMeters(this.state.depth); // Convert to Meters if necessary
    window.history.pushState(this.state,"Low Tide Finder | Vancouver (" + this.state.days + "d/" + depthInMeters + "m/" + this.state.startHour + ":00/" + this.state.endHour + ":00)","/?days=" + this.state.days + "&depth=" + depthInMeters + "&startHour=" + this.state.startHour + "&endHour=" + this.state.endHour);
    
    // Fetch new data
    this.getData();
  }
  handleChangeUnits(e) {
    // Scale factor
    let s = 1;
    if (this.state.unitsInFeet) {
      // Feet to Meters
      s = 1 / 3.28084;
    } else {
      // Meters to Feet
      s = 3.28084;
    }
    
    // Mutate input
    let depth = this.state.depth;
    let convertedDepth = depth * s;
    convertedDepth = convertedDepth.toFixed(1);
    
    // Mutate data
    let data = this.state.data;
    let convertedData = [];
    convertedData = data.map(item => {
      item.tideLevel = item.tideLevel * s;
      return item;
    });
    const convertedCurrentDepth = this.state.currentDepth * s;
    const convertedCurrentRate = this.state.currentRate * s;
    
    // Update state
    this.setState({
      unitsInFeet: !this.state.unitsInFeet,
      depth: convertedDepth,
      data: convertedData,
      currentDepth: convertedCurrentDepth,
      currentRate: convertedCurrentRate
    });
  }
  handleSettingsClick(e) {
    console.log("Settings");
  }
  getInMeters(measure) {
    let s = 1;  // assume measure already in meters
    if (this.state.unitsInFeet) s = 1 / 3.28084;
    let measureInMeters = s * measure;    
    return measureInMeters.toFixed(3);
  }
  convertMetersToFeet(measureInMeters) {
    let s = 3.28084;
    let measureInFeet = s * measureInMeters;    
    return measureInFeet;
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
