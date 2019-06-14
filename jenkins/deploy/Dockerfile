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

# Create the zip file
# RUN /usr/bin/zip -r all_data.zip SaildroneTS/output/

# Create the all_data.tar file
RUN tar -cvf all_data.tar -C SaildroneTS/output

RUN ls -lha

# Copy all_data.zip to the root folder
# RUN cp ./SaildroneTS/output/all_data.zip .

# RUN cp ./SaildroneTS/output/lastUpdatedDateTime.js .

# RUN cp ./SaildroneTS/all_data.tar .