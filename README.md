# WorkBee 🤍

**WorkBee** is a local-work marketplace platform inspired by applications like **TaskRabbit**, where users can post tasks, workers can discover and bid on them, and completed work can be paid for and reviewed.

The project is designed as a **production-style microservices application**, focusing on clean architecture, scalable system design, asynchronous communication, and SOLID principles.

## 🚀 Key Features

* 👤 User authentication and authorization
* 🛠️ Post and manage tasks
* 💼 Workers can browse and bid on tasks
* 💬 Real-time communication between users and workers
* 💳 Online payments with Razorpay
* ⭐ Ratings and reviews
* 🔔 Notifications
* ⚡ Real-time updates using Socket.IO
* 🛡️ Admin management and dispute handling
* 🔄 Asynchronous event-driven communication
* 📦 Redis-based caching and background jobs

## 🏗️ Architecture

WorkBee follows a **microservices architecture**, where each service has a clearly defined responsibility.

```text
                         ┌─────────────────┐
                         │    Frontend     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  API Gateway    │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
      │ Auth Service│      │ Work Service│      │ Communication│
      └─────────────┘      └─────────────┘      └─────────────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  ▼
                         ┌─────────────────┐
                         │    RabbitMQ     │
                         │ Event Bus       │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
             Notification      Payment       Other
               Service         Service       Consumers
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

Each service follows **Clean Architecture** principles to keep business logic independent from frameworks and infrastructure.

```text
Presentation
     ↓
Application
     ↓
Domain
     ↓
Infrastructure
```

This separation makes the system easier to:

* Test
* Maintain
* Extend
* Replace infrastructure components
* Develop independently

## 🐇 Event-Driven Architecture

WorkBee uses **RabbitMQ** as an event broker for asynchronous inter-service communication.

Instead of tightly coupling services through direct requests, services can publish domain events that other services consume.

Example:

```text
Work Service
     │
     │  Bid Accepted
     ▼
 RabbitMQ
     │
     ├──────────────► Notification Service
     │
     ├──────────────► Payment Service
     │
     └──────────────► Other Consumers
```

This approach helps reduce service-to-service coupling and allows additional consumers to be introduced without significantly changing the publishing service.

## 🧱 SOLID Principles

The codebase is designed around **SOLID principles**, including:

* **Single Responsibility Principle**
* **Open/Closed Principle**
* **Liskov Substitution Principle**
* **Interface Segregation Principle**
* **Dependency Inversion Principle**

Dependency injection is used to keep business logic independent from concrete infrastructure implementations.

## 📈 Scalability

WorkBee is designed with scalability in mind.

The microservice architecture allows individual services to be scaled independently based on their workload.

For example:

```text
                 API Gateway
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Auth ×2       Work ×5       Payment ×2
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
* BullMQ

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

## 🎯 Project Goal

WorkBee is primarily a **learning and portfolio project** built to understand how modern backend systems are designed and deployed.

The main focus is not simply building a marketplace, but learning how to design a system using:

**Microservices + Clean Architecture + SOLID + Event-Driven Communication + Distributed Systems + Cloud Deployment**

---

## 🤍 Why WorkBee?

WorkBee demonstrates how a real-world marketplace application can be broken down into independent services while maintaining clean boundaries between business logic and infrastructure.

It is an ongoing project focused on continuously improving **architecture, scalability, reliability, and software engineering practices**.
