# The More I Know, The Better

> Learn anything through AI-generated visual dependency graphs.

🌐 **Live Demo:** https://themoreiknowthebetter.ai.studio/

---

## Overview

**The More I Know, The Better** is an AI-powered learning platform that transforms any topic into a structured visual roadmap.

Instead of overwhelming users with long articles or AI chats, the application builds a dependency graph showing exactly **what to learn first, what comes next, and why**.

Each concept includes:

- 📖 AI-generated study guide
- 🔗 Curated learning resources
- ⏱ Estimated study time
- 🎯 Difficulty level
- 📌 Prerequisites

Whether you're learning **Machine Learning, Psychology, Astrophysics, Java, Philosophy, Cybersecurity, Photography**, or almost any other subject, the application generates a personalized learning path within minutes.

---

## Features

- 🧠 AI-generated learning roadmaps
- 🌳 Interactive dependency graph visualization
- 📚 Detailed study guide for every concept
- 🔗 Curated learning resources
- 🎯 Four learning depths
  - Curious
  - Learn
  - Master
  - Rabbit Hole
- 💾 In-memory roadmap caching
- ✍️ Hand-drawn notebook-inspired UI
- 📱 Responsive design
- ⏳ Animated loading progress
- ❌ Cancel roadmap generation while loading

---

## Screenshots

### Landing Page

> <img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/f40f8230-584e-4eff-9f7c-ba4e34ef178a" />


### Generated Roadmap

> *(Add screenshot)*

### Concept Details

> *(Add screenshot)*

---

## Learning Modes

| Mode | Description |
|------|-------------|
| 🔎 Curious | Get a quick overview of a topic in around 30 minutes. |
| 📘 Learn | Build practical understanding with structured learning. |
| 🎓 Master | Comprehensive roadmap covering advanced concepts. |
| 🕳 Rabbit Hole | Deep dependency graph exploring every prerequisite and specialization. |

---

## How It Works

1. Enter any topic.
2. Choose your preferred learning depth.
3. Gemini analyzes the topic.
4. A structured dependency graph is generated.
5. Explore concepts in the correct order.
6. Open any node to view:
   - Study guide
   - Learning resources
   - Difficulty
   - Estimated study time
   - Prerequisites

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Flow
- Dagre

### Backend

- Express
- Node.js

### AI

- Google Gemini 3.6 Flash
- Google AI Studio
- Structured JSON Schema Generation

---

## Project Structure

```
api/
server/
src/
 ├── components/
 ├── lib/
 ├── App.tsx
 ├── main.tsx
 └── types.ts
assets/
```

---

## Local Setup

Clone the repository

```bash
git clone https://github.com/adityarghh/themoreiknowthebetter.git
```

Move into the project

```bash
cd themoreiknowthebetter
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run locally

```bash
npm run dev
```

---

## Why This Exists

Most AI tools answer questions.

Most learning platforms provide information.

**The More I Know, The Better** focuses on something different:

> **Showing learners the correct order to learn things.**

Instead of asking users to figure out prerequisites themselves, the application automatically builds a visual dependency graph, making complex subjects much easier to approach.

---

## Roadmap

- [ ] User accounts
- [ ] Persistent roadmap storage
- [ ] Export roadmaps as PDF
- [ ] Interactive quizzes
- [ ] Flashcards
- [ ] Progress synchronization
- [ ] Notes and annotations
- [ ] Community-generated roadmaps
- [ ] Resource ranking
- [ ] Search within roadmaps

---

## Contributing

Contributions are welcome!

If you'd like to improve the project, feel free to:

- Open an issue
- Submit a pull request
- Suggest new features

---

## License

This project is licensed under the MIT License.

---

## Author

**Aditya Raj**

GitHub: https://github.com/adityarghh

If you enjoyed the project, consider leaving a ⭐ on the repository!
