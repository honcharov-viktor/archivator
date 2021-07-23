# archivator

test project for demonstration of technology

- micro services

- S3

- RabbitMQ

- NodeJs Stream API

## How to install

1. docker-compose run archivator-worker npm i
2. docker-compose run workers-api npm i
3. docker-compose run user-api npm i
4. copy .env.example to .env
5. docker-compose up -d minio rabbit
6. go to http://localhost:8001 login: minio pass: minio123 (defined in docker-compose.yaml)
7. create backets 'user-files', 'user-archives'
8. docker-compose up archivator-worker user-api workers-api
