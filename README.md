# Homey AirCloudGo

Homey AirCloudGo is a Homey app that allows you to seamlessly integrate and control your Hitachi AirCloud Go air conditioning units via Homey. With this app, you can monitor temperature, adjust fan speed, change operation modes, and automate your climate control directly from your Homey ecosystem.

## Features

- **Real-time Data Sync**: Retrieve live temperature and humidity data.
- **Full Control**: Turn devices on/off, set target temperature, change fan speed, and modify operation modes.
- **Homey Capabilities**: Utilize Homey flows, automation, and voice commands.
- **WebSocket Integration**: Ensures fast and efficient data exchange.

## Installation

1. Clone this repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Deploy the app to Homey:
   ```sh
   homey app install
   ```

## Configuration

- Configure your **Hitachi AirCloud Go** credentials in Homey settings : Go to / Create the file env.json and place your AirCloud Go credentials
- Pair your AirCloud Go devices within the Homey app.

## Usage

- Use the Homey app to control your AirCloud Go devices.
- Integrate with Homey Flows to automate climate control based on time, temperature, or motion detection.

## Troubleshooting

- If devices do not update, verify WebSocket connectivity.
- Check API authentication settings.
- Restart the Homey app if needed.

## Credits 

This repo is inspired by @svmironov's work and his AirCloud Home Assistant Integration 
(https://github.com/svmironov/aircloud_ha)

## License

This project is licensed under the MIT License.
