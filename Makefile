# Nothing to see here
# This makefile is used to publish the applications

.PHONY: docker-dev docker-publish
IMAGE ?= romanzy313/fpps

docker-dev:
	docker build --progress plain -t fpps-dev .
	docker run -e PORT=6173 -p 6173:6173 fpps-dev

docker-publish:
	@if [ -z "$(TAGNAME)" ]; then \
		echo "ERROR: TAGNAME is required. e.g. make TAGNAME=1.2.3 docker-publish"; \
		exit 1; \
	fi
	docker build -t $(IMAGE):$(TAGNAME) .
	docker push $(IMAGE):$(TAGNAME)
