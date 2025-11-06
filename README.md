🚀 Features

Real-time Collaboration - Multiple users can edit documents simultaneously with instant synchronization
AI-Assisted Editing - Intelligent content suggestions powered by AI
Secure Authentication - JWT-based authentication and authorization system
Document Management - Create, edit, delete, and organize documents effortlessly
Responsive Design - Works seamlessly across desktop, tablet, and mobile devices
Auto-Save - Never lose your work with automatic saving functionality
Production Ready - Dockerized deployment with Nginx reverse proxy


🛠 Tech Stack
Frontend

Next.js 14 - React framework with server-side rendering
React - Component-based UI library
Socket.IO Client - Real-time bidirectional communication
Axios - Promise-based HTTP client
TailwindCSS - Utility-first CSS framework

Backend

Node.js - JavaScript runtime environment
Express.js - Fast, minimalist web framework
Socket.IO - Real-time engine for WebSocket communication
MongoDB - NoSQL database for document storage
JWT - JSON Web Tokens for secure authentication
Mongoose - MongoDB object modeling

DevOps & Infrastructure

Docker - Containerization platform
Docker Compose - Multi-container orchestration
Nginx - High-performance reverse proxy server
AWS EC2 - Cloud compute instance
GitHub Actions - CI/CD automation


📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18 or higher)
npm or yarn
MongoDB (local or Atlas)
Git
Docker & Docker Compose (for deployment)


🎯 Getting Started
1. Clone the Repository
bashgit clone https://github.com/sandeep-001488/CoEditDocuments.git
cd CoEditDocuments
2. Backend Setup
bashcd backend
npm install
Create a .env file in the backend directory:
env# Database
MONGODB_URI=Your database URL

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=time

# Server
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
3. Frontend Setup
bashcd ../client
npm install
Create a .env.local file in the client directory:
envNEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
4. Run the Application
Start Backend:
bashcd backend
npm run dev
# Backend runs on http://localhost:4000
Start Frontend (in a new terminal):
bashcd client
npm run dev
# Frontend runs on http://localhost:3000
Visit http://localhost:3000 to see your application running! 🎉

🐳 Docker Deployment
Local Docker Setup
bash# Build and run all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
Production Deployment on AWS EC2
Prerequisites

AWS EC2 instance (Ubuntu 24.04 LTS)
Security groups configured (ports 80, 443, 22)
Domain name (optional but recommended)

Deployment Steps

SSH into your EC2 instance:

bashssh -i your-key.pem ubuntu@your-ec2-ip

Install Docker and Docker Compose:

bash# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

Clone and deploy:

bash# Clone repository
git clone https://github.com/sandeep-001488/CoEditDocuments.git
cd CoEditDocuments

# Create production environment files
nano backend/.env.production
nano client/.env.production

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build

Configure Nginx (optional for custom domain):

bashsudo apt install nginx -y
sudo nano /etc/nginx/sites-available/coedit

# Add Nginx configuration (see docs/nginx.conf)
sudo ln -s /etc/nginx/sites-available/coedit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

🔄 CI/CD with GitHub Actions
This project uses GitHub Actions for automated deployment. On every push to main:

Code is checked out
SSH connection established to EC2
Latest changes pulled from GitHub
Docker containers rebuilt and restarted

Setup GitHub Secrets:

EC2_HOST - Your EC2 instance IP
EC2_USER - SSH username (usually ubuntu)
EC2_KEY - Your EC2 private key (.pem file content)


📁 Project Structure
CoEditDocuments/
├── backend/              # Express.js backend
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   └── server.js        # Entry point
├── client/              # Next.js frontend
│   ├── app/            # Next.js 14 app directory
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   └── public/        # Static assets
├── .github/
│   └── workflows/     # GitHub Actions CI/CD
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md

🔐 Environment Variables
Backend Variables
VariableDescriptionRequiredMONGODB_URIMongoDB connection string✅JWT_SECRETSecret key for JWT signing✅JWT_EXPIREJWT expiration time✅PORTServer port (default: 4000)❌FRONTEND_URLFrontend URL for CORS✅
Frontend Variables
VariableDescriptionRequiredNEXT_PUBLIC_API_URLBackend API URL✅NEXT_PUBLIC_SOCKET_URLSocket.IO server URL✅

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request


📝 License
Distributed under the MIT License. See LICENSE for more information.

👥 Authors
Sandeep Kumar

GitHub:https://github.com/sandeep-001488
LinkedIn:https://www.linkedin.com/in/sandeep-kumar-934237260/


🙏 Acknowledgments

Next.js Documentation
Socket.IO
MongoDB
Docker

