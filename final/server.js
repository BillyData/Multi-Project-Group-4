const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
var IotApi = require('@arduino/arduino-iot-client');
var rp = require('request-promise');

app.use(cors());

async function getToken() {
    var options = {
        method: 'POST',
        url: 'https://api2.arduino.cc/iot/v1/clients/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        timeout: 300000,
        json: true,
        form: {
            grant_type: 'client_credentials',
            client_id: 'qd0E6GA9O9ygvxRg4vE5Kom3k0bzPxRU',
            client_secret: 'HVIcE6E4XBaaea9ZDoa4KoubbIyr9c3eAa4lZN9SgRL6AGo47UrDHr7ZLqD3hQ4x',
            audience: 'https://api2.arduino.cc/iot'
        }
    };

    try {
        const response = await rp(options);
        return response['access_token'];
    }
    catch (error) {
        console.error("Failed getting an access token: " + error)
    }
}

async function listProperties() {
    var client = IotApi.ApiClient.instance;
    // Configure OAuth2 access token for authorization: oauth2
    var oauth2 = client.authentications['oauth2'];
    oauth2.accessToken = await getToken();

    var api = new IotApi.PropertiesV2Api(client)
    var id = "8194898f-88eb-4793-babf-9768e877bc86"; // {String} The id of the thing

    var opts = {
        'showDeleted': true // {Boolean} If true, shows the soft deleted properties
    };

    try {
        const data = await api.propertiesV2List(id, opts);
        return data;
    } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
    }
}

app.get('/arduino-data', async (req, res) => {
    try {
        const data = await listProperties();
        res.json(data); // Sending JSON response to the client
    } catch (error) {
        res.status(500).send("Error fetching Arduino data"); // Sending error response if something goes wrong
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
