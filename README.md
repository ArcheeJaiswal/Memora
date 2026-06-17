# 🧠 Memora – Smart Notes & Flashcards Hub



> **Your ultimate MERN-stack companion for capturing knowledge, creating flashcards, and mastering subjects with AI-driven spaced repetition.**

---

![Memora dashboard - Top](docs/4Dashboard_top.png)
![Memora dashboard - Bottom](docs/5Dashboard_bottom.png)

<p align="center">
  <em>Distraction‑free interface · Full‑stack TypeScript · Vite + React Powered</em>
</p>

---

## ✨ Features

| Category            | Highlights                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Knowledge Base**  | 📝 Rich‑text **note editor**  ·  🗂️ **Folder / tag** organisation · 📑 **PDF import** & viewer                                       |
| **Active Recall**   | 🧠 **Flashcard generator** instantly creates cards from notes · ⚡ **Spaced repetition** queue for optimal memory retention         |
| **Insights**        | 📊 **Advanced dashboard** – dynamic charts (day / month / year, category‑wise) to visualize your study streaks                      |
| **Smart Assistant** | 🤖 **AI summaries** for long documents · 🔍 Semantic **global search** across all your content                                            |
| **User Experience** | 🌓 **Light / Dark mode** support · ⌨️ Blazing-fast **search & filters**                                                                 |
| **Security & Sync** | 🔑 Secure **JWT auth** + refresh tokens · ☁️ Real-time cloud sync with MongoDB                                                          |

---

## 🏗️ Tech Stack

| Layer        | Tech                                                   | Why?                               |
| ------------ | ------------------------------------------------------ | ---------------------------------- |
| **Frontend** | React 18 · TypeScript · Vite · TailwindCSS · shadcn/ui | Fast, type‑safe, beautiful UI      |
| **Backend**  | Node.js · Express                                      | Lightweight, scalable REST API     |
| **Database** | MongoDB + Mongoose                                     | Flexible, JSON‑friendly data model |
| **Auth**     | JWT + bcryptjs                                         | Proven, stateless security         |
| **DevOps**   | GitHub Actions · Vercel / Render                       | Automated deployments & CI         |

---

## 🛠️ Local Setup

```bash
# 1. Clone the repo
$ git clone https://github.com/ArcheeJaiswal/Memora.git
$ cd Memora

# 2. Install client deps & run frontend
$ npm install
$ npm run dev                # http://localhost:5173

# 3. Install server deps & run API
$ cd server
$ npm install
$ npm start                  # http://localhost:5000
```

### Environment Variables

Create `server/.env`:

```dotenv
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/memora
JWT_SECRET=superSecretKey
EMAIL_USER=example@gmail.com
EMAIL_PASS=app_password
PORT=5000
```

> Tip: Copy `.env.example` and fill in your secrets.

---

## 📂 Project Structure

```
├── src/               # React + TS frontend (Vite)
│   ├── components/    # Reusable UI components (shadcn/ui)
│   ├── pages/         # Application views & routes
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions
├── server/            # Express backend
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express API routes
│   └── utils/         # Backend helpers (auth, email, etc.)
└── docs/              # Screenshots / assets
```

---

## 🛣️ Roadmap

* [ ] Offline support via Progressive Web App (PWA)
* [ ] Audio note transcription
* [ ] Chrome extension for quick web clipping
* [ ] Collaborative workspaces

Got an idea? [Open an issue](https://github.com/ArcheeJaiswal/Memora/issues) or vote on an existing one!

---

## 🤝 Contributing

1. **Fork** the project and create your branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'feat: add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request 🙌

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) first.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more info.

---

## 📫 Contact

* GitHub: [@ArcheeJaiswal](https://github.com/ArcheeJaiswal)
* Project Link: [https://github.com/ArcheeJaiswal/Memora](https://github.com/ArcheeJaiswal/Memora)

---

> Made with ❤️ – because your second brain deserves the best.
