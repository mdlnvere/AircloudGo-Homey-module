const Homey = require('homey');
const fetch = require('node-fetch');
const { HOST_API, URN_CONTROL } = require('../installations/api-const');

module.exports = class MyDevice extends Homey.Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log(`Device ${this.getName()} initialized`);
     // Fetch the driver
     this.driver = this.homey.drivers.getDriver('installations');
     if (!this.driver) {
       this.log("Error : unable to find a driver");
       return;
     }

    // Event listener
    this.registerCapabilityListener("measure_current", async (value) => this.handleMeasureCurrent(value));
    this.registerCapabilityListener("onoff", async (value) => this.handleOnOff(value, this.driver.splitsData));
    this.registerCapabilityListener("target_temperature", async (value) => this.handleTargetTemperature(value));
    this.registerCapabilityListener("measure_temperature", async (value) => this.handleMeasureTemperature(value));
    this.registerCapabilityListener("thermostat_mode", async (value) => this.handleThermostatMode(value));
    this.registerCapabilityListener("fan_mode.mode", async (value) => this.handleFanMode(value));
    this.registerCapabilityListener("fan_mode.speed", async (value) => this.handleFanSpeed(value));

    // fetch split's id 
    const splitId = this.getData().id;

    let splitCurrentId = '';
    // Automatic update 
    this.startDatasUpdate();
  }

  /**
   * 
   * Refresh the datas every 5s
   */
  startDatasUpdate() {
    this.temperatureInterval = setInterval(() => {
  
      if (this.driver.splitsData) {
        this.updateDatas(this.driver.splitsData);
      } else {
        this.log("Error : no available data");
      }
    }, 5000);
  }

  /**
   * 
   * Update the datas using driver's data
   */
  updateDatas(splitsData) {
    if (!Array.isArray(splitsData)) {
      this.log("Error : not an array");
      return;
    }

    const splitId = this.getData().id;
    const split = splitsData.find(s => s.id === splitId);

    if (!split) {
      this.log(`There is no device with this ID :  ${splitId}`);
      return;
    }

    const iduTemperature = split.iduTemperature;
    const roomTemperature = split.roomTemperature;
    const fanMode = this.defineFanMode(split)
    const isOn = split.power == "ON" ? true : false;
    const fanSpeed = this.defineFanSpeed(split)



    this.setCapabilityValue('measure_temperature', roomTemperature)
      .catch(err => this.log('Error on measure_temp update', err));

    this.setCapabilityValue('target_temperature', iduTemperature)
      .catch(err => this.log('Error on target_temperature update', err));

    this.setCapabilityValue('onoff', isOn)
      .catch(err => this.log('Error on ON/OFF update', err));
    
    
    this.setCapabilityValue('fan_mode.mode', fanMode)
      .catch(err => this.log('Error on fan mode update', err));
  }

  /**
   * Converts fan speed in order to be compatible with Homey's var
   * 
   */
  defineFanSpeed(data) {
    const fanSpeeds = {
      "AUTO": "auto",
      "LV1": "low",
      "LV2": "medium",
      "LV3": "middle",
      "LV4": "high",
    };
    return fanSpeeds[data.fan_speed] || "auto";
  }

  /**
   * Converts fan speed in order to be compatible with Homey's var
   * 
   */
  defineFanMode(data) {
    const fanModes = {
      "OFF": "off",
      "VERTICAL" : "vertical"
      
    };
    return fanModes[data.fanSwing] || "off";
  }


  

  async handleOnOff(value, splitsData) {
    const splitId = this.getData().id;
    const split = splitsData.find(s => s.id === splitId);
    const iduTemperature = split.iduTemperature
    const mode = split.mode
    const fan_swing = split.fanSwing

    let power;
    if(value == true ){
       power = 'ON'
       
    }else 
       power = 'OFF'
       

    const fan_speed = split.fanSpeed

    let command = {
      'power': power,
      "iduTemperature": iduTemperature,
      "mode": mode,
      "fanSpeed": fan_speed,
      "fanSwing": fan_swing,
    }
   let token = this.driver.token;
   let familyId = this.driver.familyId;

   try{
   let put = fetch(HOST_API + URN_CONTROL + '/' + split.id + '?familyId=' + familyId ,
      { method: 'PUT', headers: { 'content-type' : 'application/json',  'Authorization': `Bearer ${token}` }, body: JSON.stringify(command) })
           
   }catch(error){
    console.error("Error when trying to update ON OFF value : ", error);
    throw error;
   }

    this.log(`ON/OFF updated ${value}`);
  }

  async handleTargetTemperature(value) {
    this.log(`Target temperature updated${value}°C`);
  }

  async handleMeasureTemperature(value) {
    this.log(`Measure temp updatetd ${value}°C`);
  }

  async handleThermostatMode(value) {
    this.log(`thermostat mode updated : ${value}`);
  }

  async handleFanSpeed(value) {
    this.log(`Fan speed updated : ${value}`);
  }

  async handleFanMode(value) {
    this.log(`Fan mode updated : ${value}`);
  }




  /**
   * onDeleted is called when the user deletes the device.
   */
  async onDeleted() {
    this.log(`Device ${this.getName()} deleted`);
    if (this.temperatureInterval) clearInterval(this.temperatureInterval);
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }


};


