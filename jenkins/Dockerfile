# Simple Dockerfile to build SaildroneTS for deployment

#FROM electronuserland/builder:wine-05.18
FROM node:10
LABEL maintainer="FRAM Data Team <nmfs.nwfsc.fram.data.team@noaa.gov>"

# build everything in the root home directory
WORKDIR /root

# Add SaildroneTS source files to the docker instance
ADD ./SaildroneTS SaildroneTS

RUN cd SaildroneTS

RUN npm install -g typescript

RUN npm install -g ts-node

# Install Node modules
RUN npm install

# See what is in the directory at this point
RUN ls -lha

RUN cd ..

# Package saildrone-data-pull directory
RUN tar -cvzf saildrone-data-pull.tgz SaildroneTS --warning=no-file-changed \
    --exclude='./.npm' --exclude='./logs' --exclude='./.git' \
    --exclude='./.config' --exclude='./.gnupg' --exclude='./output'


# Move to deploy script

# Perform the data pull
RUN ts-node -T ./dataPull.ts
