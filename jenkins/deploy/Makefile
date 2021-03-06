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

	# No Cache
	# docker build -t ${docker_image} .

	# remove old build
	# -docker rmi `docker images -a --filter=dangling=true -q`

extract:
	# Before pruning
	# docker system df -v

	# Clean up everything
	# docker system prune --all --volumes --force

	# After pruning
	# docker system df -v

	# Remove all untagged images
	# docker images | grep "^<none>" | awk '{ print $"3"; }' | xargs docker rmi
	# docker rmi $(docker images | grep "^<none>" | awk '{print $3}')

	make build

	##### make container + extract tarball #####
	# -docker rm -f ${docker_image}
	docker create --name ${docker_image} ${docker_image}

	##### copy results #####
	# docker cp ${docker_image}:/root/all_data.tar .
	# docker cp ${docker_image}:/root/lastUpdatedDateTime.js .
	# docker cp ${docker_image}:/root/SaildroneTS/output .
	docker cp ${docker_image}:/root/all_data.tar .

	##### clean up #####
	docker rm -f ${docker_image}

	# Show docker images before removing dangling images
	# docker images

	# Clean up dangling images (i.e. the non-intermediate none:none images)
	# docker rmi $(docker images -f "dangling=true" -q --no-trunc) 2>/dev/null
	# docker image prune --force

	-docker container prune --force

	# Show docker images after removing dangling images
	docker images

clean:
	#-docker rm -f ${docker_image}
	#-docker rmi -f ${docker_image}
	#-docker rmi -f `docker images -f 'dangling=true' -q`
	#-docker rm `docker ps -a -q`
	docker container prune -f
