# 📝 CoEdit - Collaborative Writing Platform

A full-stack real-time collaborative document editor with AI-powered writing assistance, built with Next.js 14, Express.js, MongoDB, and Google Gemini AI.

## ✨ Features

- 🚀 **Real-time Collaboration** - Multiple users can edit documents simultaneously
- 🤖 **AI Writing Assistant** - Grammar checking, writing enhancement, summarization, and more
- 💾 **Auto-save** - Never lose your work with automatic saving
- 🔐 **Secure Authentication** - JWT-based authentication with HTTP-only cookies
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 👥 **User Management** - Share documents with specific users
- 🎨 **Rich Text Editor** - Full formatting capabilities with React Quill
- ⚡ **WebSocket Communication** - Real-time updates using Socket.io

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **Chakra UI** - Modern component library
- **React Quill** - Rich text editor
- **Socket.io Client** - Real-time communication
- **Axios** - API requests

### Backend

- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database
- **Socket.io** - WebSocket server
- **Google Gemini AI** - AI writing assistance
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
collabwrite-ai/
├── server/                 # Backend code
│   ├── config/            # Database & AI configuration
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, rate limiting, error handling
│   ├── services/          # Business logic
│   ├── websockets/        # Socket.io handlers
│   ├── utils/             # Helper functions
│   └── server.js          # Main server file
│
└── client/                # Frontend code
    ├── app/               # Next.js app directory
    │   ├── src/auth/      # Authentication pages
    │   ├── dashboard/     # Dashboard page
    │   ├── editor/        # Editor page
    │   ├── components/    # React components
    │   ├── services/      # API & Socket services
    │   ├── hooks/         # Custom React hooks
    │   └── utils/         # Helper functions
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd collabwrite-ai
```

2. **Setup Backend**

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabwrite
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

3. **Setup Frontend**

```bash
cd ../client
npm install
```

Create `.env.local` file in `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. **Start MongoDB**

```bash
# If using local MongoDB
mongod
```

5. **Start Backend Server**

```bash
cd server
npm run dev
```

6. **Start Frontend**

```bash
cd client
npm run dev
```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Creating an Account

1. Click "Start Writing Free" on the landing page
2. Fill in your name, email, and password
3. Click "Create Account"

### Creating a Document

1. After login, you'll see the dashboard
2. Click "New Document" button
3. Start writing!

### Using AI Assistant

1. Write some text in the editor
2. Click on any AI feature in the right sidebar:
   - **Grammar Check** - Fix grammar and spelling
   - **Enhance Writing** - Improve clarity and style
   - **Summarize** - Get a concise summary
   - **Auto-Complete** - Continue your writing
   - **Suggestions** - Get improvement tips
3. Review the AI result
4. Click "Apply to Document" to use it

### Collaborating

1. Open a document
2. Click the share button
3. Enter collaborator's email
4. Choose their role (viewer/editor)
5. They can now access the document in real-time!

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Documents

- `POST /api/documents` - Create document
- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get single document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document
- `POST /api/documents/:id/share-link` - Generate share link

### AI Features

- `POST /api/ai/grammar-check` - Check grammar
- `POST /api/ai/enhance` - Enhance writing
- `POST /api/ai/summarize` - Summarize text
- `POST /api/ai/complete` - Auto-complete text
- `POST /api/ai/suggestions` - Get suggestions

## 🧪 Testing

```bash
cd server
npm test
```

## 🔐 Security Features

- JWT token authentication with HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Protected routes and authorization checks

## 🎨 UI Features

- Modern, clean design inspired by Notion and Google Docs
- Smooth animations and transitions
- Responsive layout for mobile, tablet, and desktop
- Dark mode support (via Chakra UI)
- Real-time user presence indicators
- Toast notifications for user feedback

## 🚧 Future Enhancements

- [ ] Version history and document recovery
- [ ] Export to PDF, Word, Markdown
- [ ] Comments and annotations
- [ ] Advanced sharing permissions
- [ ] Team workspaces
- [ ] Document templates
- [ ] Offline mode with sync
- [ ] Voice typing
- [ ] Mobile apps (React Native)

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Chakra UI for the beautiful components
- Google for the Gemini AI API
- Socket.io for real-time functionality
- MongoDB for the database

---

**Happy Writing! ✨**
