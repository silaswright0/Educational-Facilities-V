# Use the mariadb image
FROM mariadb

# Install MySQL client
RUN apt-get update && \
    apt-get install -y mariadb-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy all the files in the docker-entrypoint-initdb.d inside the container 
# which will run automatically when the sql server will start
COPY ./scripts/setup.sql /docker-entrypoint-initdb.d/
COPY ./scripts/00-create-app-user.sh /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/00-create-app-user.sh
