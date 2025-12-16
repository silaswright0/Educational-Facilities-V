# EFL

## EFL for Educational Facilities Landscape
This project provides visualizations for information about Canadian educational facilities.

## How to run locally
- Make sure you have docker desktop installed and running
- Install requirments
- docker compose build
- docker compose up -d
- check out the project at localhost:3000
- take down with docker compose down -v

## Developing with Docker

The project is set up as 3 separate docker containers (front end, back end, database).  You will need to [have docker installed](https://www.docker.com/products/docker-desktop/) and set up your development environment so that you can attach to a docker container and develop without having to constantly restart the container.

The Docker project provides a [list of IDEs that have docker extensions](https://www.docker.com/products/ide/)

## Build Tools

Gradle is the build tool used for the spring boot portions of this project.  You can use gradle on the command line to perform build and testing tasks.  You can also use it from within your IDE.    Windows users, you will need to make sure that line endings are set to be LF rather than the windows standard of CRLF.   You can set this in most editors.

Your team must choose a build tool to use with typescript.   ESBuild is one of the recommended ones but you may choose a different one as long as the whole team uses the same tool.
