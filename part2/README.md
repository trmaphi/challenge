# System Design for chotot

## Requirements

- Traffic statistics of chotot.com?
    - Total < 14 million visits per day [1]
    - Peak traffic with CCU 

        `Concurrent Visitors = Hourly visitors * Time Spent on Site / 3600`
        `37000 ~= ~590000 * 225 / 3600`

## System components:

### By feature:

#### Authentication and authorization component:

- This service requires strongly consistent write/read with minium changes in schema, so PostgreSQL is good call for storing information.
- Other than that each user will login with 3rd party client like FaceBook, Google, Payoo. So, we must store a unique identity of those inside PostgreSQL
- Most of users will be provided OAuth2 token as format as Bearer Authentication

#### Search component

- On chotot, the most important feature is searching with keywords. I think ElasticSearch fix very well in here.
- However should only provide minium item data for ElasticSearch unique id and text like description, keyword, etc...
- The other fields of item should be stored in PostgreSQL read replication.
- Using PostgreSQL read replication serve better performance in case we scale the read-only instances of Search Component onto different geo location
- Redis Memory Cache Replication works very well in this case, too. About the Redis Write will connect to PostgreSQL Write Master
- Item statics Assets will going to be stored on third party

#### Item Mangement component

- Ad and item uploading requires write data to be filter and image processing, so storing it índie a message quêu like AWS SQS and process them later with a cluster of docker on a region is enough.
- The problem is you have to write the data again though Nginx Load Balancer when you want PostgreSQL write permissions
- The async write-only docker must handle the checking size of assets too, before generate a secured URL to third party static hosting

## Technologies/Tools

- Load Balancer: Nginx
- RDMS: PostgreSQL
- Authentication && Authorization: OpenID Connect Server
- Search Engine: Elastic Search
- Message Queue: AWS SQS
- Third party Hosting and CDN can be: ViettelIDC CDN
- Load test: k6

## Load test design

For load test, two components should be handle is Search component and Item Management component 
https://k6.io/docs/

Search components:
- search with a different set of key words, and check cache hit
- the keyword must is 60~70% match with the list of pre-seed data inside ElasticSearch and PostgreSQL

Item Mangement component:
- schedule 5 instances of k6 on each of North, Middle, South of vietnam region, trying to upload the list of static through API. 

## Threshold discussion:

The problem of this system is the consistent write in write-only docker instance, the bottle neck of consistent write (ACID) can cause the upload slow. However, when I check the usage case of chotot, the frequency of item being uploads are not hight. So this bottleneck can be ignored.

Using the static hosting from thirty, we might occur some terrible threshold about the size limit of item.

## Ref

[1] https://www.similarweb.com/website/chotot.com/#overview