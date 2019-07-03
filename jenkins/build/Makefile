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
    # make room for build
	-docker container prune --force
	# -docker rm -f `docker ps -a -q` # delete old/stopped containers
	# build container
	docker build -t ${docker_image} .
	# remove old build
	# -docker rmi --force `docker images -f 'dangling=true' -q`

extract:

	make build

	# List out what docker images exist (but not the intermediate ones)
	docker images
	# docker system df -v

	# Clean up everything
	# docker system prune --all --volumes --force

	## make container + extract tarball
	# docker rm -f ${docker_image}
	docker create --name ${docker_image} ${docker_image}

	# TODO: Copy versioning files
	docker cp ${docker_image}:/root/saildrone-data-pull.tgz .

	# clean up
	docker rm -f ${docker_image}

clean:
	# WS- Run sparingly, kills builds in process
	-docker rm -f ${docker_image}
	-docker rmi -f ${docker_image}
	-docker rmi -f `docker images -f 'dangling=true' -q`
	-docker rm `docker ps -a -q`
