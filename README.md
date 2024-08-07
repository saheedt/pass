# pass
A ticketing sale/purchase application built with a microservices architecture

## Overview
Pass is a demo application for listing and purchase of tickets.
It is an event-based application built with a microservices architecture to be run in a Kubernetes cluster.
The application is split into 6 micro-services:
- Auth: handles authentication
- Tickets: handles ticket creation, update, listing and delete
- Orders: handles order creation, cancellation, and listing
- Expiration: handles automatic cancellation of Orders not paid for within the application set time frame
- Payments: handles order payment
- Client: the presentational layer of the application

## Implementation
1. Every service maintains its database.
2. To ensure services remain loosely coupled, and the scope of dependency minimized, data is replicated across services.
3. Services communicate (essentially share data) using an event-driven messaging system (NATS streaming server).
4. Each service is built into a docker image and pushed to Docker hub.
5. Docker images of each service from Docker hub are then used to spin up pods within a k8s cluster
6. Each service is exposed for communication within the cluster with a cluster-ip service
7. Ingress Nginx is used for routing traffic to appropriate services and load-balancing.
8. Re-usable code for Authorization, Events publishing/subscribing e.t.c are shared between services via a npm module [pass-common](https://github.com/saheedt/pass-common)
9. Github actions are used to run tests and can also be used to handle automatic deployments.

## Tools used
- [Kubernetes](https://kubernetes.io/)
- [Docker](https://www.docker.com/)
- [Ingress Nginx](https://kubernetes.github.io/ingress-nginx/deploy/)
- [NATS streaming server](https://docs.nats.io/nats-streaming-concepts/intro)
- [Skaffold](https://skaffold.dev/)
- JavaScript
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Next](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Redis](https://redis.io/)
- [Stripe](https://stripe.com/)
- GitHub Actions
