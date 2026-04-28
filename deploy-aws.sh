#!/usr/bin/env bash
# =============================================================
# Yelp Lab 2 — AWS EKS Deployment Script
# Run from repo root:  bash deploy-aws.sh YOUR_DOCKERHUB_USERNAME
# =============================================================

set -euo pipefail

DOCKERHUB_USER="${1:-}"
if [ -z "$DOCKERHUB_USER" ]; then
  echo "Usage: bash deploy-aws.sh YOUR_DOCKERHUB_USERNAME"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
K8S_DIR="$REPO_ROOT/deploy/k8s"
CLUSTER_NAME="yelp-lab2"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
NAMESPACE="yelp-lab2"

echo ""
echo "============================================"
echo " STEP 1 — Build & Push Docker Images"
echo "============================================"

images=(
  "yelp-user-service:deploy/docker/user-service.Dockerfile"
  "yelp-owner-service:deploy/docker/owner-service.Dockerfile"
  "yelp-restaurant-service:deploy/docker/restaurant-service.Dockerfile"
  "yelp-review-service:deploy/docker/review-service.Dockerfile"
  "yelp-api-gateway:deploy/docker/api-gateway.Dockerfile"
  "yelp-kafka-worker:deploy/docker/kafka-worker.Dockerfile"
  "yelp-frontend:deploy/docker/frontend.Dockerfile"
)

cd "$REPO_ROOT"
# Skip rebuild if images already pushed — set SKIP_BUILD=1 to skip
if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "SKIP_BUILD=1 — skipping Docker build & push (images already on Docker Hub)"
else
  for entry in "${images[@]}"; do
    name="${entry%%:*}"
    dockerfile="${entry##*:}"
    echo "Building $name ..."
    docker build -f "$dockerfile" -t "$DOCKERHUB_USER/$name:latest" .
    echo "Pushing $DOCKERHUB_USER/$name:latest ..."
    docker push "$DOCKERHUB_USER/$name:latest"
  done
fi

echo ""
echo "============================================"
echo " STEP 2 — Create EKS Cluster (if needed)"
echo "============================================"

if aws eks describe-cluster --name "$CLUSTER_NAME" --region "$REGION" &>/dev/null; then
  echo "Cluster '$CLUSTER_NAME' already exists — skipping creation."
else
  echo "Creating EKS cluster '$CLUSTER_NAME' in $REGION (takes ~15 min)..."
  eksctl create cluster \
    --name "$CLUSTER_NAME" \
    --region "$REGION" \
    --nodegroup-name standard-workers \
    --node-type t3.small \
    --nodes 2 \
    --nodes-min 2 \
    --nodes-max 2 \
    --managed
fi

echo ""
echo "============================================"
echo " STEP 3 — Point kubectl at the cluster"
echo "============================================"

aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$REGION"
kubectl cluster-info

echo ""
echo "============================================"
echo " STEP 4 — Patch K8s manifests with Docker Hub username"
echo "============================================"

# Create patched copies in /tmp so we don't dirty the repo
TMP_K8S="/tmp/yelp-k8s-patched"
rm -rf "$TMP_K8S" && cp -r "$K8S_DIR" "$TMP_K8S"

for f in "$TMP_K8S"/*.yaml; do
  sed -i "s|your-dockerhub-user|$DOCKERHUB_USER|g" "$f"
  sed -i "s|DOCKERHUB_USER|$DOCKERHUB_USER|g" "$f"
done

echo "Manifests patched for Docker Hub user: $DOCKERHUB_USER"

echo ""
echo "============================================"
echo " STEP 5 — Apply Kubernetes Manifests"
echo "============================================"

kubectl apply -f "$TMP_K8S/namespace.yaml"
kubectl apply -f "$TMP_K8S/mongo.yaml"
kubectl apply -f "$TMP_K8S/kafka.yaml"
kubectl apply -f "$TMP_K8S/services.yaml"
kubectl apply -f "$TMP_K8S/api-gateway.yaml"
kubectl apply -f "$TMP_K8S/workers-and-frontend.yaml"

echo ""
echo "============================================"
echo " STEP 6 — Wait for pods to be Running"
echo "============================================"

echo "Waiting for all pods in namespace '$NAMESPACE'..."
kubectl wait --for=condition=ready pod \
  --all \
  -n "$NAMESPACE" \
  --timeout=300s || true

echo ""
echo "============================================"
echo " STEP 7 — Show cluster status (for report)"
echo "============================================"

echo ""
echo "--- kubectl get pods -n $NAMESPACE ---"
kubectl get pods -n "$NAMESPACE"

echo ""
echo "--- kubectl get services -n $NAMESPACE ---"
kubectl get services -n "$NAMESPACE"

echo ""
EXTERNAL_IP=$(kubectl get svc api-gateway -n "$NAMESPACE" \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending...")

echo "============================================"
echo " DONE!"
echo " API Gateway: http://$EXTERNAL_IP"
echo " Frontend:    check 'kubectl get svc frontend -n $NAMESPACE'"
echo "============================================"
echo ""
echo "Take screenshots of:"
echo "  1. AWS Console > EKS > Clusters > yelp-lab2"
echo "  2. The 'kubectl get pods' output above"
echo "  3. The 'kubectl get services' output above"
echo "  4. http://$EXTERNAL_IP in browser"
