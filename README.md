# SaildroneTS
Software for querying the [Saildrone](https://www.saildrone.com/) API.  Saildrone provides a [Swagger interface](https://developer-mission.saildrone.com/api-docs) for testing their API.

## Installation Instructions
1. Install Node.js - download [here](https://nodejs.org/en/)

2. (OPTIONAL) Install Visual Studio Code - download [here](https://code.visualstudio.com/) (We use and recommend this IDE for development)

3. Clone the repository: `git clone git@github.com:nwfsc-fram/SaildroneTS.git`

4. In a command window, navigate to the cloned folder and install the required node modules:  `npm install`

5. Copy the `keys-sample.ts` file to a `keys.ts` file and insert your key and secret values provided by Saildrone.

6. Run the software:  `ts-node -T ./dataPull.ts`
