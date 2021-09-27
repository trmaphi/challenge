
```bash
docker run -d \
    --name ip-tracker \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    -p 5432:5432 \
    -v ${PWD}/.data:/var/lib/postgresql/data \
    postgres:13-alpine
```