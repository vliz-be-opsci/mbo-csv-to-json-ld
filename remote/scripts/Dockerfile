FROM python:3.13-alpine

RUN apk add bash

RUN pip install poetry

RUN mkdir -p /scripts

COPY ./ /scripts

WORKDIR /scripts

RUN pip install .