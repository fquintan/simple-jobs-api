FROM python:3.8-slim

RUN apt-get update && \
	apt-get install -y gcc uwsgi uwsgi-plugin-python3 \
	default-libmysqlclient-dev


COPY ./requirements.txt /requirements.txt 

RUN pip3 install -r /requirements.txt
RUN pip3 install uwsgi
COPY ./jobs-api /jobs-api

WORKDIR /jobs-api

CMD ["uwsgi", "--socket", "0.0.0.0:8080", "--module", "jobs-api", "--callable", "app", "--chdir", "/jobs-api"]