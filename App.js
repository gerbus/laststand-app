import React from 'react';
import { 
  StyleSheet, 
  AsyncStorage,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment-timezone';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { material } from 'react-native-typography';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Main from './Main';
import Settings, { SettingUnits } from './Settings';
import { StackNavigator } from 'react-navigation';

const Navigator = StackNavigator({
  Main: { 
    screen: Main,
    navigationOptions: ({navigation, screenProps}) => ({
      title: 'Low Tide Predictor',
      headerStyle: {
        backgroundColor: '#977651',
      },
      headerTitleStyle: material.titleWhite,
      headerTintColor: '#fff',
      headerRight: (
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings',{headerStyleBackgroundColor: '#977651'})}
          >
          <IconMaterial 
            name='settings' 
            size={28} 
            color='white'
            />
        </TouchableOpacity>
      )
    })
  },
  Settings: { 
    screen: Settings,
    navigationOptions: ({navigation}) => ({
      title: 'Settings',
      headerStyle: {
        backgroundColor: navigation.state.params.headerStyleBackgroundColor,
      },
      headerTitleStyle: material.titleWhite,
      headerTintColor: '#fff',
    })
  },
},{
  initialRouteName: 'Main',
  headerMode: 'float',
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /* Settings */
      days: 30,
      depth: 1.5,
      startHour: 9,
      endHour: 16,
      unitsInFeet: false,      
      /* Data */
      data: [],
      currentDepth: null,
      currentDirection: "", // "rising" or "falling"
      currentRate: null,
      currentDate: null,
      currentTime: null,
      /* Other */
      showSubmit: false,
      dataFetched: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeUnits = this.handleChangeUnits.bind(this);
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
    const {
      currentDate,
      currentTime,
      currentDepth,
      unitsInFeet,
      currentDirection,
      currentRate,
      dataFetched,
      data,
      settingsView,
    } = this.state;
    
    return (
      <Navigator 
        screenProps={
          {
            state: this.state,
            handlers: {
              handleChangeUnits: this.handleChangeUnits    
            },
          }
        }
        />
    );
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