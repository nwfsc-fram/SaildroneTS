# Simple Dockerfile to build SaildroneTS for deployment

#FROM electronuserland/builder:wine-05.18
FROM node:10
MAINTAINER FRAM Data Team <nmfs.nwfsc.fram.data.team@noaa.gov>

# build everything in the root home directory
WORKDIR /root

# Add SaildroneTS source files
ADD SaildroneTS ./SaildroneTS

# Install Node modules
RUN cd SaildroneTS && npm install

# Add keys.ts file for authentication
ADD keys.ts SaildroneTS/keys.ts

# Perform the data pull
RUN ts-node -T SaildroneTS/dataPull.ts

# Package saildrone-data-pull directory
RUN tar czvf saildrone-data-pull.tgz SaildroneTS

# Copy the all_data.zip file to nwcwp2  /var/www/html/app-warehouse/static/saildrone and unzip
# RUN cd SaildroneTS/output && tar czf all_data.zip
