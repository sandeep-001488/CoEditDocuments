Project Overview

CoEditDocuments is a full-stack real-time collaborative document editor. It allows multiple users to edit documents simultaneously, with AI-assisted features for content suggestions. The platform includes user authentication, document management, and a responsive frontend built with Next.js.

Tech Stack

Frontend: Next.js, React, Axios, Socket.IO

Backend: Node.js, Express, MongoDB, Socket.IO

Database: MongoDB Atlas

Deployment: Docker, AWS EC2, Nginx (reverse proxy)

Setup Steps (Local)

Clone the repository:

git clone https://github.com/sandeep-001488/CoEditDocuments.git
cd CoEditDocuments


Backend setup:

cd backend
npm install
nano .env       # Add environment variables (MongoDB URI, JWT, etc.)


Frontend setup:

cd ../client
npm install
nano .env       # Add frontend API URLs (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL)


Run locally:

cd ../backend
npm run dev     # Runs backend on port 4000
cd ../client
npm run dev     # Runs frontend on port 3000

Deployment Approach (AWS EC2)

Server Setup:

Ubuntu EC2 instance

Installed Docker & Docker Compose

Nginx reverse proxy for serving frontend on port 80 and backend on /api

Docker Deployment:

Separate containers for backend, frontend, and MongoDB

docker-compose.prod.yml used to build and run containers in production

Automatic Deployment:

GitHub Actions workflow (deploy.yml) connects to EC2 via SSH deploy key

On git push, it pulls latest code and rebuilds containers automatically

Security:

EC2 security group allows only HTTP (80), HTTPS (443), and SSH

Secrets stored in GitHub Actions for safe SSH deployment

Key Features

Real-time collaborative editing with Socket.IO

JWT-based authentication & authorization

AI-assisted content suggestions

Production-ready Docker deployment with Nginx reverse proxy

Notes

Frontend is served on port 80 (via Nginx) for public access

Backend is accessible via /api path only

Deployment can be automated through GitHub Actions
