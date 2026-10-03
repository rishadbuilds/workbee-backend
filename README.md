# WorkBee 🤍

The project is designed as a **production-style microservices application**, focusing on clean architecture, scalable system design, asynchronous communication, and SOLID principles.

```

### Microservices

| Service                   | Responsibility                                  |
| ------------------------- | ----------------------------------------------- |
| **API Gateway**           | Central entry point, routing and authorization  |
| **Auth Service**          | Authentication, authorization, users and tokens |
| **Work Service**          | Tasks, bidding and work lifecycle               |
| **Communication Service** | Real-time messaging and conversations           |
| **Notification Service**  | User notifications and event consumers          |
| **Payment Service**       | Payments and payment-related operations         |

## 🧩 Clean Architecture

This separation makes the system easier to:

* Test
* Maintain
* Extend
* Replace infrastructure components
* Develop independently

## 🐇 Event-Driven Architecture

WorkBee uses **RabbitMQ** as an event broker for asynchronous inter-service communication.

Instead of tightly coupling services through direct requests, services can publish domain events that other services consume.

This approach helps reduce service-to-service coupling and allows additional consumers to be introduced without significantly changing the publishing service.

## 📈 Scalability

WorkBee is designed with scalability in mind.

The microservice architecture allows individual services to be scaled independently based on their workload.

```

The event-driven architecture also allows background operations to be processed asynchronously rather than blocking user-facing requests.

## 🛠️ Tech Stack

### Backend

* Node.js
* TypeScript
* Express.js
* Clean Architecture
* Dependency Injection
* tsyringe

### Microservices & Communication

* RabbitMQ
* Socket.IO
* REST APIs
* Event-driven architecture

### Databases & Infrastructure

* MongoDB
* PostgreSQL
* Prisma
* Redis

### Payments & Storage

* Razorpay
* Cloudinary

### DevOps

* Docker
* Kubernetes
* k3s
* AWS EC2
* Traefik
* GitHub


**Microservices + Clean Architecture + SOLID + Event-Driven Communication + Distributed Systems + Cloud Deployment**

---

## 🤍 Why WorkBee?

WorkBee demonstrates how a real-world marketplace application can be broken down into independent services while maintaining clean boundaries between business logic and infrastructure.