#!/usr/bin/env bash

# This tags and uploads an image to Docker Hub

# Step 1:
# This is your Docker ID/path
dockerpath=rayhan/machine-learning-microservice

# Step 2
# Run the Docker Hub container with kubernetes

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-prediction
  labels:
    app: ml-prediction
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-prediction
  template:
    metadata:
      labels:
        app: ml-prediction
    spec:
      containers:
      - name: ml-prediction
        image: \$dockerpath
        ports:
        - containerPort: 80
EOF

# Step 3:
# List kubernetes pods
kubectl get pods


# Step 4:
# Forward the container port to a host
kubectl port-forward deployment/ml-prediction 8000:80
