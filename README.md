

---

## 🚀 Current Implementation (Frontend-Only with Simulation)

Since this is a **React + Vite** project, there is no actual backend server.
Instead, backend behavior is **simulated within the frontend**.

---

## 🧩 Simulated Components

| Simulated Component  | Actual Implementation           | Purpose                                |
| -------------------- | ------------------------------- | -------------------------------------- |
| PostgreSQL Database  | localStorage                    | Stores prompts persistently in browser |
| Redis Counter        | localStorage + INCR simulation  | Tracks view counts                     |
| Django API Endpoints | Mock functions with console.log | Demonstrates API structure             |
| Docker Containers    | Single browser app              | Simplified deployment                  |

---

## ⚙️ How the Simulation Works

### 📦 Simulates PostgreSQL (Data Persistence)

```javascript
const STORAGE_KEY = 'ai_prompts_db';
const prompts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
```

---

### 🔢 Simulates Redis INCR Command

```javascript
function incrementViewCount(id) {
  const key = `prompt:${id}:views`;
  const current = parseInt(localStorage.getItem(key) || '0');
  const newValue = current + 1;
  localStorage.setItem(key, newValue);

  console.log(`[Redis] INCR prompt:${id}:views = ${newValue}`);
  return newValue;
}
```

---

### 🌐 Simulates Django API Endpoints

```javascript
console.log(`[Django API] GET /prompts/ - Returning ${prompts.length} prompts`);
console.log(`[Django API] GET /prompts/${id}/ - View count incremented`);
```

---

## 📊 Original Requirements vs Current Implementation

| Requirement        | Original Spec       | Current Implementation |
| ------------------ | ------------------- | ---------------------- |
| Backend Framework  | Django              | N/A (simulated)        |
| Frontend Framework | Angular             | React 18 + Vite        |
| Database           | PostgreSQL          | localStorage           |
| Cache / Counter    | Redis               | localStorage           |
| Containerization   | Docker Compose      | Single static build    |
| API Style          | Django views + JSON | Mock function          |

---
