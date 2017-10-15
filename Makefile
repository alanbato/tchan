.PHONY: build update upgrade setup start stop restart status

all:
	@echo "Control the docker compose server"
	@echo "Usage: make [build/update/upgrade/setup/start/stop/restart/status]"
	@exit 0

build:
	sudo docker-compose build

update:
	sudo docker-compose up -d --build

upgrade:
	sudo docker-compose up -d --build
	sudo docker-compose run app upgrade

setup: start
	@# TODO: clean this up
	sudo chown 1001 -R ./data/log ./data/media
	sudo docker-compose down
	sudo docker-compose up -d
	sudo docker-compose run app setup

start:
	sudo docker-compose up -d

stop:
	sudo docker-compose down

restart: stop start

status:
	sudo docker-compose ps
