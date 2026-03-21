# 🍽️ Yelp Prototype — Lab 1

A full-stack Yelp-style restaurant discovery and review platform with an AI-powered chatbot assistant.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Axios, TailwindCSS |
| Backend | Python, FastAPI |
| Database | MySQL |
| AI Chatbot | Langchain, Tavily, OpenAI |
| Auth | JWT + bcrypt |

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── main.py        # Entry point
│   ├── routes/        # API route handlers
│   ├── models/        # SQLAlchemy models
│   ├── services/      # Business logic
│   ├── db/            # Database config & migrations
│   └── requirements.txt
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API calls
│   │   └── App.jsx
│   └── package.json
└── PROJECT_BOARD.md   # Task tracker
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Configure your DB credentials & API keys
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables

**Backend (`.env`)**:
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/yelp_db
SECRET_KEY=your-jwt-secret
OPENAI_API_KEY=your-openai-key
TAVILY_API_KEY=your-tavily-key
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Team

- **Prakhar Singh** — Backend, AI Chatbot Service
- **Nikhil Khaneja** — Frontend, Chat UI

## License

Private — Academic use only.
