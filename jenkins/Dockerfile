# Simple Dockerfile to build SaildroneTS for deployment

#FROM electronuserland/builder:wine-05.18
FROM node:10
LABEL maintainer="FRAM Data Team <nmfs.nwfsc.fram.data.team@noaa.gov>"

# build everything in the root home directory
WORKDIR /root

# Add SaildroneTS source files
#ADD SaildroneTS ./SaildroneTS
ADD . .

# Install Node modules
RUN npm install

# Add keys.ts file for authentication
#ADD keys.ts keys.ts
RUN ls -lha

RUN npm list ts-node

# Perform the data pull
RUN ./ts-node -T ./dataPull.ts

# Package saildrone-data-pull directory
RUN tar czvf saildrone-data-pull.tgz SaildroneTS

# Package the all_data.zip file for pushing to 

# Copy the all_data.zip file to nwcwp2  /var/www/html/app-warehouse/static/saildrone and unzip
# RUN cd SaildroneTS/output && tar czf all_data.zip
