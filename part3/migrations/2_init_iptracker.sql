USE iptracker

CREATE TABLE visits (    
    access_time timestamp primary key,
    ip varchar(15)
);

CREATE INDEX ip_index ON visits (ip);