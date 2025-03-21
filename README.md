# Quizzy Cupcake

Quizzy Cupcake is a dynamic quiz creation and management platform that allows users to build engaging multiple-choice questionnaires (QCM) enriched with optional images. Perfect for educators, trainers, and anyone looking to create interactive assessments, the platform offers:

- 📝 Easy quiz creation with multiple-choice questions
- 🖼️ Support for image integration in questions
- 📊 Real-time scoring and feedback
- 🎨 Clean, intuitive user interface
- 📱 Responsive design for all devices
- 🔗 Share quizzes easily via links or QR codes


## 🚀 Tech Stack

### Backend
- Go
- Gin (Web Framework)
- Google Cloud Platform

### Database
- Firebase

### Frontend
- TypeScript
- React
- Tailwind CSS
- Vite

## 📁 Project Structure

```
quizzy-cupcake/
├── api/         # Backend API endpoints
├── app/         # Frontend React application
├── db/          # Database configurations and models
├── models/      # Data models
├── resources/   # Static resources
└── dist/        # Built frontend files
```

## 🛠️ Setup and Installation

### Prerequisites
- Go 1.x
- Node.js and npm/yarn
- Google Cloud SDK (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quizzy-cupcake.git
cd quizzy-cupcake
```

2. Install backend dependencies:
```bash
go mod download
```

3. Install frontend dependencies:
```bash
cd app
npm install
```

4. Start the development server:

Backend:
```bash
go run main.go
```

Frontend:
```bash
cd app
npm run dev
```

## 🚀 Deployment

The application is configured for Google Cloud Platform deployment using `app.yaml`. To deploy:

```bash
./deploy.sh
```

## 🔧 Configuration

- Backend configuration can be modified in `app.yaml`
- Frontend environment variables can be set in `app/.env.development`

## 📝 API Documentation

The API is versioned and accessible at `/api/v1/`. Current endpoints include:

- `POST /api/v1/users` - Create a new user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.