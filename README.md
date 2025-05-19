# Fitness Tracker – Cloud-Native Application (SIT737 Task 10.2HD)

This project is a fitness tracking web application built using **Node.js microservices**, containerized with **Docker**, deployed to **Google Kubernetes Engine (GKE)**, and integrated with **MongoDB Atlas**. It supports features like user management, workout tracking, move goals, analytics, and notifications.

---

## Microservices

- `auth-service` – User registration, login, profile updates
- `workout-service` – Daily workout data handling
- `movegoals-service` – Move goal tracking
- `analytical-service` – Reporting and insights
- `notification-service` – Email/push notification service
- `gateway-service` – React frontend + API routing via express

---

## How to Deploy to GCP (GKE)

## How to Deploy to GCP (GKE)
-`gcloud auth login
-`gcloud config set project <your-project-id>

### 1. Authenticate and Set Project
```bash
gcloud auth login
gcloud config set project <your-project-id>
---

