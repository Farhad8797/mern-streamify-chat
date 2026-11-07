# Real-Time MERN Chat Application

A full-stack, real-time messaging application built with the **Typescript MERN** stack (**MongoDB**, **Express**, **React**, **Node.js**), **Socket.io**, **Zustand**, and **Tailwind CSS / DaisyUI**.

This application supports instant bidirectional messaging, online user status tracking, persistent authentication with automatic socket re-connections, and rich media message support (text, images, audio, and video).

---

## Features

- **Real-time Messaging:** Powered by Socket.io for instantaneous message delivery and UI updates without page reloads.
- **Persistent Authentication:** Session persistence on page refresh integrated seamlessly with automatic Socket.io handshake and client-side lifecycle management.
- **Online User Tracking:** Live updates showing active users on the platform.
- **Multi-Media Support:** Ability to send text messages, images, audio clips, and video files.
- **Robust State Management:** Managed via **Zustand** for predictable store updates (Auth Store, Chat Store) and clean component rendering.
- **Smart UI Updates:** Dynamic message alignment and conditional real-time message placement based on active chat selection.

---

## Tech Stack

### **Frontend**

- **React** (Vite / CRA)
- **Zustand** (Global State Management)
- **Socket.io-client** (Real-time WebSockets)
- **Axios** (HTTP Requests with interceptors)
- **Tailwind CSS & DaisyUI** (Responsive UI components)
- **lucide-react** (Icons)
- **React-hook-form** (Forms)

### **Backend**

- **Node.js & Express.js** (Server framework)
- **MongoDB & Mongoose** (Database & ODM)
- **Socket.io** (Real-time server engine)
- **Resend API** (Transactional emails / Verification)
- **Redis** (To store temporary tokens for email verification)
- **Imagekit** (Media storage)

---

## Getting started

### Clone the repo:

```bash
git clone https://github.com/Farhad8797/mern-streamify-chat.git
```

### Install required dependencies:

Go to server and client folders using two separate terminals and run the following command to install dependencies:

```bash
npm install
```

### Run

In each terminals run:

```bash
npm run dev
```

---

## Prequisites

Make sure you have nodejs and docker installed in your system. You should also have mongodb connection string, api keys of imagekit and resend.

---

## Env variables

### **Client**:

In client folder, create two .env files : .env.development and .env.production
Inside .env.development write the variables with this values:

```text
VITE_API_BASE_URL="http://localhost:8000/api/v1"
VITE_API_SOCKET_URI="http://localhost:8000"
```

In .env.production, replace them with your live api endpoint urls.

### **Server**:

In server folder, create a .env file with these variables with their correct values:

```text
PORT="8000"
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
MONGODB_URI=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
RESEND_API_KEY=
ARCJET_KEY=
ARCJET_ENV=
REDIS_PASSWORD=
```

You can use the crypto module to generate secret strings for access and refresh tokens.

---

## Acknowledgements

Thanks to [Codesistency](https://www.youtube.com/@codesistency), for this amazing tutorial : [Build and Deploy a Realtime Chat App with React, Node.js, Socket.io](https://youtu.be/bR4b_Io8shE?si=gNDBzSKwM55rwTJk)
