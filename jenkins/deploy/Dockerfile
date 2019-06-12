# Simple Dockerfile to build SaildroneTS for deployment

#FROM electronuserland/builder:wine-05.18
FROM node:10
LABEL maintainer="FRAM Data Team <nmfs.nwfsc.fram.data.team@noaa.gov>"

# build everything in the root home directory
WORKDIR /root

# Add SaildroneTS source files
#ADD SaildroneTS ./SaildroneTS
ADD . .

RUN npm install -g typescript

RUN npm install -g ts-node

# Install Node modules
RUN npm install

# Add keys.ts file for authentication
#ADD keys.ts keys.ts

# Perform the data pull
RUN ts-node -T ./dataPull.ts

RUN ls -lha

# Copy all_data.zip to the root folder
RUN cp ./SaildroneTS/output/all_data.zip .


# Copy the all_data.zip file to nwcwp2  /var/www/html/app-warehouse/static/saildrone and unzip
RUN cd SaildroneTS/output && tar czf all_data.zip
