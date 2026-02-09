#!/bin/bash

# Configuration
DOCKERHUB_USERNAME="garoweb262"
APPS=("backend" "frontend" "dashboard")

echo "Starting build and push process for Docker Hub: ${DOCKERHUB_USERNAME}"

# Loop through apps and build/push
for APP in "${APPS[@]}"; do
    IMAGE_NAME="${DOCKERHUB_USERNAME}/digibit-${APP}:latest"
    
    echo "-----------------------------------------------"
    echo "Building ${APP} image: ${IMAGE_NAME}..."
    echo "-----------------------------------------------"
    
    docker build --build-arg APP_NAME=${APP} -t ${IMAGE_NAME} .
    
    if [ $? -eq 0 ]; then
        echo "Successfully built ${APP}. Pushing to Docker Hub..."
        docker push ${IMAGE_NAME}
        if [ $? -eq 0 ]; then
            echo "Successfully pushed ${IMAGE_NAME}"
        else
            echo "Failed to push ${IMAGE_NAME}"
            exit 1
        fi
    else
        echo "Failed to build ${APP}"
        exit 1
    fi
done

echo "-----------------------------------------------"
echo "All images have been built and pushed successfully!"
echo "-----------------------------------------------"
