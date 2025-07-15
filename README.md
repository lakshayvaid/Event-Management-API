# 🎟️ Event Management API

A RESTful Event Management System built using **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**.  
Supports creating events, registering users, capacity tracking, and upcoming event listing.

---

Live Link : https://event-management-api-ta0y.onrender.com/

## 🚀 Features

- Create events with title, date, location, and capacity
- Register users for events
- Prevent duplicate, full, or past registrations
- Cancel user registrations
- Get full event details with registered users
- Show event stats (registrations, remaining, % filled)
- List upcoming events (custom sorting)
- Rate-limited and input-validated API
- Clean Prisma schema with many-to-many relationship

---

## 🧑‍💻 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Rate Limiting:** express-rate-limit

---

## ⚙️ Setup Instructions

 Clone the repo

```bash
git clone https://github.com/your-username/event-management-api.git
cd event-management-api
npm install
