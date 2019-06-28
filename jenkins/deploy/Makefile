# -*- indent-tabs-mode:t; -*-
# Makefile to build SaildroneTS
#
# Author: Todd Hay <todd.hay@noaa.gov>,

# for below targets, don't check any file modification times
.PHONY: build

# include developer/workstation specific settings
include Makefile.properties.mk

docker_image = node-${docker_image_suffix}

# default target; build application for local testing/evaluation
build: Dockerfile

	-docker container prune --force
    # make room for build
	#-docker rm `docker ps -a -q` # delete old/stopped containers
	# build container
	docker build --no-cache=true -t ${docker_image} .
	# remove old build
	# -docker rmi `docker images -a --filter=dangling=true -q`

extract:
	make build

	##### make container + extract tarball #####
	-docker rm -f ${docker_image}
	docker create --name ${docker_image} ${docker_image}

	##### copy results #####
	# docker cp ${docker_image}:/root/all_data.tar .
	# docker cp ${docker_image}:/root/lastUpdatedDateTime.js .
	# docker cp ${docker_image}:/root/SaildroneTS/output .
	docker cp ${docker_image}:/root/all_data.tar .

	##### clean up #####
	docker rm -f ${docker_image}

debug:
	make build
	# create a container
	-docker rm -f ${docker_image}
	docker run -d --name ${docker_image} ${docker_image} /bin/sh -c "while true; do sleep 99; done"
	docker exec -it ${docker_image} bash && docker kill ${docker_image} && docker rm ${docker_image}

clean:
	-docker rm -f ${docker_image}
	-docker rmi -f ${docker_image}
	-docker rmi -f `docker images -f 'dangling=true' -q`
	-docker rm `docker ps -a -q`
