# Simple Dockerfile to build SaildroneTS for deployment

#FROM electronuserland/builder:wine-05.18
FROM node:10
LABEL maintainer="FRAM Data Team <nmfs.nwfsc.fram.data.team@noaa.gov>"

# build everything in the root home directory
WORKDIR /root

# Add SaildroneTS source files to the docker instance
ADD ./SaildroneTS SaildroneTS

RUN npm install -g typescript

RUN npm install -g ts-node

# Add keys.ts file for authentication
#ADD keys.ts keys.ts

# Perform the data pull
RUN cd SaildroneTS && ts-node -T ./dataPull.ts

# RUN cd SaildroneTS/output && /usr/bin/zip all_data.zip *.csv *.json

RUN cd SaildroneTS/output && ls -lha

# Copy all_data.zip to the root folder
RUN cp ./SaildroneTS/output/all_data.zip .

RUN cp ./SaildroneTS/output/lastUpdatedDateTime.js .