# SaildroneTS
Software for querying the Saildrone API

## Installation Instructions
1. Install Node.js - download [here](https://nodejs.org/en/)

2. (OPTIONAL) Install Visual Studio Code - download [here](https://code.visualstudio.com/) (We use and recommend this IDE for development)

3. Clone the repository: `git clone git@github.com:nwfsc-fram/SaildroneTS.git`

4. In a command window, navigate to the clone folder and install the required node modules:  `npm install`

5. Copy the `keys-sample.ts` file to a `keys.ts` file and insert your key and secret values received from Saildrone.

6. Edit the `parameters.ts` file to enter your specific Saildrone missions (`missions` parameter) and datasets of interest (`datasets` parameter)

7. Run the software:  `ts-node -T .\dataPull.ts`
