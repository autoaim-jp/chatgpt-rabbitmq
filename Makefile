SHELL=/bin/bash
PHONY=default run help 

.PHONY: $(PHONY)

default: run

run: docker-compose-up

help:
	@echo "Usage: make run"
	@echo "Usage: make help"

docker-compose-up:
	docker compose -p docker-rabbitmq up


