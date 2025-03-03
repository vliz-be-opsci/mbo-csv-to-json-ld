FROM python:3.13-alpine

# Install bash, jq and jsonld-cli to support more general build functionality in the top-level Makefile.
RUN apk update && apk add bash jq npm
RUN npm install -g jsonld-cli

RUN mkdir -p /scripts

COPY ./ /scripts

WORKDIR /scripts

RUN pip install .