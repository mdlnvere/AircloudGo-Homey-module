const Homey = require('homey');

module.exports = {

    HOST_API : 'https://api-global-prod.aircloudhome.com/',

    URN_AUTH : 'iam/auth/sign-in',

    URN_REFRESH_TOKEN : "iam/auth/refresh-token",

    URN_WHO : "rac/location-controls/status",

    URN_CONTROL : "rac/basic-idu-control/general-control-command",

    URN_WSS : "wss://notification-global-prod.aircloudhome.com/rac-notifications/websocket",

    EMAIL : Homey.env.AIRCLOUD_EMAIL,

    PASSWORD : Homey.env.AIRCLOUD_PASSWORD


}






