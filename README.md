# 🧠 Memora – Smart Notes & Flashcards Hub

<div align="center">
<!--   <img src="docs/banner.png" alt="Memora banner" width="100%"/>
  <br/>
  <a href="https://github.com/ArcheeJaiswal/Memora/actions"><img src="https://img.shields.io/github/actions/workflow/status/ArcheeJaiswal/Memora/ci.yml?branch=main" alt="Build"/></a>
  <a href="https://github.com/ArcheeJaiswal/Memora/stargazers"><img src="https://img.shields.io/github/stars/ArcheeJaiswal/Memora?style=social" alt="GitHub stars"/></a>
  <a href="https://github.com/ArcheeJaiswal/Memora/issues"><img src="https://img.shields.io/github/issues/ArcheeJaiswal/Memora" alt="Issues"/></a>
  <a href="https://github.com/ArcheeJaiswal/Memora/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ArcheeJaiswal/Memora" alt="License"/></a>
  <a href="https://twitter.com/yourhandle"><img src="https://img.shields.io/twitter/follow/yourhandle?style=social" alt="Follow on Twitter"/></a>
</div> -->

> **Your ultimate companion for capturing knowledge, creating flashcards, and mastering subjects with AI-driven spaced repetition.**

---

![Memora dashboard](docs/screenshot-dashboard.png)
<p align="center">
  <img src="docs/screenshot-flashcards.png" alt="Flashcards View" width="45%"/>
  <img src="docs/screenshot-notes.png" alt="Notes Editor" width="45%"/>
</p>
<p align="center">
  <em>Distraction‑free interface · Full‑stack TypeScript · Next.js Powered</em>
</p>

---

## ✨ Features

| Category            | Highlights                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Knowledge Base**  | 📝 Rich‑text **markdown editor**  ·  🗂️ **Nested folders & tags** · 📑 **Auto-save** functionality                                       |
| **Active Recall**   | 🧠 **Flashcard generator** instantly creates cards from notes · ⚡ **Spaced repetition** algorithm to optimize memory retention         |
| **Insights**        | 📊 **Learning analytics** – track your study streaks, retention rates, and upcoming review loads                                          |
| **Smart Assistant** | 🤖 **AI summaries** for long documents · 🔍 Semantic **global search** across all your content                                            |
| **User Experience** | 🌓 **Dark mode by default** · ⌨️ **Keyboard shortcuts** for power users                                                                   |
| **Security & Sync** | 🔑 Secure **OAuth & JWT auth** · ☁️ Real-time cloud sync across all your devices                                                          |

---

## 🏗️ Tech Stack

| Layer        | Tech                                                   | Why?                               |
| ------------ | ------------------------------------------------------ | ---------------------------------- |
| **Frontend** | Next.js 14 · React · TypeScript · TailwindCSS · shadcn | SEO-friendly, fast, beautiful UI   |
| **Backend**  | Node.js · Express · tRPC                               | End-to-end type safety             |
| **Database** | PostgreSQL + Prisma ORM                                | Relational data integrity          |
| **Auth**     | NextAuth.js                                            | Seamless social & email logins     |
| **DevOps**   | GitHub Actions · Docker · Vercel                       | Automated deployments & CI         |

---

## 🛠️ Local Setup

```bash
# Clone the repo
$ git clone https://github.com/ArcheeJaiswal/Memora.git
$ cd Memora

# Install dependencies
$ npm install

# Run the development server
$ npm run dev                # http://localhost:3000
```

### Environment Variables

Create `.env.local`:

```dotenv
DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/memora
NEXTAUTH_SECRET=superSecretKey
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

> Tip: Copy `.env.example` and fill in your secrets.

---

## 📂 Project Structure

```
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utility functions & helpers
│   └── server/        # tRPC routers & API logic
├── prisma/            # Database schema & migrations
└── docs/              # Screenshots / assets
```

---

## 🛣️ Roadmap

* [ ] Offline support via PWA
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

> Made with ❤️  – because your brain deserves the best.
