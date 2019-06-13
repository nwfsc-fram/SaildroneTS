# makefile defining workstation/developer-specific variables
#
#
# Instructions:
# Make your local changes to this file, then run:
#   git update-index --assume-unchanged Makefile.properties.mk
# (if you later want to modify the version controlled, base template you can
# revert, resume tracking, & make your edits to commit, via:
#   git checkout -- Makefile.properties.mk
#   git update-index --no-assume-unchanged Makefile.properties.mk
#   (edit the template file)
#   git commit Makefile.properties.mk
#   git update-index --assume-unchanged Makefile.properties.mk

docker_image_suffix = saildrone-data-pull-build