const axios = require("axios").default;
require("dotenv").config();
const fs = require("fs");


// pulling in JSON file that contains most recent refresh code

const jsonString = fs.readFileSync(
  "/Users/frederickgodsell/codefiles/mokapot/refresh.json"
);
const fileData = JSON.parse(jsonString);
const refTok = fileData.refresh_token;

// 

const oathOptions = {
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(process.env.ID + ":" + process.env.SECRET).toString("base64"),
  },
  params: {
    grant_type: "refresh_token",
    refresh_token: refTok,
  },
};

// function to make post request to Oauth. Contains writeFile method to update a JSON file with most recent refresh token

makeOauthRequest = async () => {
  try {
    const oauthPostRequest = await axios.post(
      "https://zoom.us/oauth/token",
      {},
      oathOptions
    );
    let accessPlusRefresh = JSON.stringify(
      await oauthPostRequest.data,
      null,
      2
    );
    fs.writeFile(
      "/Users/frederickgodsell/codefiles/mokapot/refresh.json",
      accessPlusRefresh,
      (error) => {
        if (error) {
          console.log("Error writing file", error);
        } else {
          console.log("JSON file sucessfully updated");
        }
      }
    );
    return oauthPostRequest.data;
  } catch (error) {
    console.log(error);
  }
};

// Post request that books Zoom meeting with topic and start time as parameters

createMeeting = async (topic, startTime) => {
  let meetingBody = {
    topic: topic,
    start_time: startTime,
  };

  let response = await makeOauthRequest();
  let accessToken = await response.access_token;

  const meetingOptions = {
    headers: {
      authorization: `Bearer ${await accessToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    let meetingResponse = await axios.post(
      `${process.env.API_URL}`,
      meetingBody,
      meetingOptions
    );
    console.log(`Meeting booked. UUID : ${meetingResponse.data.uuid}`);
    return meetingResponse;
  } catch (err) {
    console.log(err.response.data);
  }
};

createMeeting("Example Meeting Name", "2021-04-26T19:20:00Z");

module.exports.createMeeting = createMeeting;
module.exports.makeOauthRequest = makeOauthRequest;
module.exports.oathOptions = oathOptions;
module.exports.refTok = refTok;
