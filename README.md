# Fitness Tracker – Cloud-Native Application (SIT737 Task 10.2HD)

This project is a microservices-based Fitness Tracker application built using **Node.js**, **Express**, **MongoDB Atlas**, and **React**, deployed on **Google Kubernetes Engine (GKE)**. It supports features such as user authentication, workout logging, goal tracking, activity reports, and notification services.

## Project Structure

```
.
├── auth-service/          # Handles user registration, login, and profile updates
├── workout-service/       # Manages daily workout data
├── movegoals-service/     # Tracks user move goals
├── analytical-service/    # Generates activity and calorie reports
├── notification-service/  # Sends email/push notifications
├── gateway-service/       # Serves frontend & API gateway
└── README.md              # You're here
```

## Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js (Express)
- **Database:** MongoDB Atlas (cloud-hosted)
- **Containerization:** Docker
- **Orchestration:** Kubernetes (GKE)
- **Monitoring & Logs:** Google Cloud Monitoring & Logging
- **HTTPS Tunneling (Mobile):** Ngrok

##  Deployment to Google Kubernetes Engine (GKE)

> Before starting, ensure you have `gcloud`, `kubectl`, and `Docker` installed and authenticated.

### 1. Authenticate and Set Project
```bash
gcloud auth login
gcloud config set project <your-project-id>
```

### 2. Create Kubernetes Cluster
```bash
gcloud container clusters create fitness-cluster --region=australia-southeast1
gcloud container clusters get-credentials fitness-cluster --region=australia-southeast1
```

### 3. Create Secrets (Used by All Microservices)
```bash
kubectl create secret generic app-secret   --from-literal=db-user=<mongo-username>   --from-literal=db-password=<mongo-password>   --from-literal=db-name=fitnessTracker   --from-literal=jwt-key=supersecret_dont_share   --from-literal=email-user=<gmail-user>   --from-literal=email-pass=<app-password>
```

### 4. Build and Push Docker Images to Docker Hub
```bash
docker build -t yourdockerhub/fitness-auth-api ./auth-service
docker push yourdockerhub/fitness-auth-api

# Repeat for each of the 6 services
```

### 5. Apply Kubernetes Files
```bash
kubectl apply -f auth-service/deployment.yaml
kubectl apply -f auth-service/service.yaml

# Repeat for all services: workout, movegoals, notification, analytical, gateway
```

### 6. Get External IP Address of Gateway
```bash
kubectl get services
```

Use the `EXTERNAL-IP` of the `fitness-gateway-service` to access the app.

## Enable HTTPS with Ngrok (For Mobile Tracking Feature)
```bash
ngrok config add-authtoken <your-token>
ngrok http http://<gateway-external-ip>
```
## Monitoring and Logging (GCP)
- Logs collected via **Logs Explorer**
- Metrics visible in **Cloud Monitoring**
- Enabled by default in GKE

## Security Measures
- Kubernetes Secrets for credentials
- RBAC and access control
- HTTPS via ngrok for secure mobile interaction
