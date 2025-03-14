
const fetch = require('node-fetch');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Homey = require('homey');
const { HOST_API, URN_CONTROL, URN_WSS, URN_AUTH, URN_WHO } = require('../installations/api-const');

let refreshToken = '';

let socket =  new WebSocket(URN_WSS);


let datas = [];


module.exports = class MyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
    this.getInfo();
    
    let splitsData = [];
    let token = '';
    let familyIds;
    let familyid;

  }

  // Create the request 
  getInfo(){
        try {
          const data = { email : Homey.env.AIRCLOUD_EMAIL, password : Homey.env.AIRCLOUD_PASSWORD };
           fetch(HOST_API + URN_AUTH, { method: 'POST', headers: { 'content-type' : 'application/json' }, body: JSON.stringify(data) })
           .then(res => res.json())
            .then(json => {
              this.token = json.token;
              this.refreshToken = json.refreshToken;
              this.getFamilyIds(this.token);
           
            });
            
          
    } catch (error) {
        console.error("Error : datas not found : ", error);
        throw error;
    }

  }  
  getFamilyIds(token){
    try{
        
       fetch(HOST_API + URN_WHO,
        {method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          }}).then(res => res.json())
          .then(json => {
            this.familyIds = json;
            this.familyid = json[1].familyId;
            this.getData( token, this.familyid)
          });
      
    }catch(error){
      console.error("Error : datas not availaible", error);
          throw error;
    }
  }

 getData( token, familyIds){

      try{
          this.familyId = familyIds;
        let ws = socket;
          const connectionString = 
              `CONNECT\naccept-version:1.1,1.2\nheart-beat:10000,10000\n` +
              `Authorization:Bearer ${token}\n\n\0\n` +
              `SUBSCRIBE\nid:${uuidv4()}\ndestination:/notification/${familyIds}/${familyIds}\nack:auto\n\n\0`;
           ws.send(connectionString);
           ws.on('message', async (data) => {
            try {
              const jsonString = data.toString(); // Converts buffer into string
                ws.close();

                  //Find the start of the JSON (ignore the header)
                  const jsonStartIndex = jsonString.indexOf('{'); 
                  const jsonEndIndex = jsonString.lastIndexOf('}'); 
                  const jsonOnly = jsonString.substring(jsonStartIndex, jsonEndIndex + 1).trim()
                  if (jsonOnly.trim().startsWith('{') && jsonOnly.trim().endsWith('}')) {
                  
                  const jsonData = JSON.parse(jsonOnly); 
                  if (jsonData.notificationType === "ON_CONNECT" && jsonData.data) {
                    await this.splitsData
                    this.splitsData = jsonData.data; 
                    this.log('Updated datas ', this.splitsData);
                }
          
                  this.datas = jsonData;
                 

                  }
          } catch (error) {
              console.error('Error when trying to parse JSON:', error);
          }
          ws.onerror = (error) => {
            console.warn("WebSocket error:", error);
            reject(null);
        };

        ws.onclose = () => {
            if (!datas ) {
                console.warn(`Unable to find '{' symbol after multiples attempts`);
                reject(null);
            }
        };

        
        setTimeout(() => {
            if (!data ) {
                console.warn("WebSocket connection timed out while receiving data");
                ws.close();
                reject(null);
            }
        }, 10000);
    })
  
 } 
 
    catch(error){
    console.error("Error when collecting datas: ", error);
      throw error;
    }   
      
  }
 
 

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {

    let devices = [];
    for( let d of this.datas.data){
      let capabilities = [
        "measure_current",
        "target_temperature",
        "measure_temperature",
        "thermostat_mode",
        "onoff",
        "fan_mode.speed",
        "fan_mode.mode"
      ];
      devices.push({
        data: {
            id: d.id, 
            roomTemperature: d.roomTemperature
        },
        capabilities: capabilities,
        name : d.name
        
    });
    }
    
    return devices;

  }

};
