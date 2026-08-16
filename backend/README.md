# Portfolio Contact API Backend

A lightweight Node.js + Express backend to handle contact form submissions via the Resend API.

## Requirements
- [Node.js](https://nodejs.org/) (v18.11.0+ recommended for built-in code watch support)

## Local Setup

1. **Install Dependencies**
   Navigate to the backend directory and run:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and configure the settings:
   - `RESEND_API_KEY`: Set this to your Resend API secret key (e.g. `re_xxxxxxxxxxxxxxxx`).
   - `CONTACT_EMAIL_1`: Set this to the first recipient email address where you want to receive submissions.
   - `CONTACT_EMAIL_2`: Set this to the second recipient email address where you want to receive submissions.
   - `RESEND_FROM_EMAIL`: Set this to the verified domain sender address in Resend. While testing, you can use the default example `onboarding@resend.dev` to send messages to your own registered account email.
   - `FRONTEND_URL`: Set this to your frontend origin (default is `http://localhost:5500` for VS Code Live Server).

3. **Run Locally**
   To start the development server with file watching:
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```
   The server will start on port `5000` (configurable in `.env`).

## Testing the API

- **Health Check**:
  Open your browser or run a tool like Postman to query the GET endpoint:
  ```
  GET http://localhost:5000/api/health
  ```
  Expected output:
  ```json
  {
    "success": true,
    "message": "Contact API is running."
  }
  ```

- **Contact Route**:
  Make a POST request to:
  ```
  POST http://localhost:5000/api/contact
  ```
  Headers:
  `Content-Type: application/json`
  Body (JSON):
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Hello Sajan",
    "message": "This is a test message."
  }
  ```

## Frontend Configuration

To make your static frontend talk to this backend:
1. Open [script.js](../script.js).
2. Set the `API_BASE_URL` to match your backend address (defaults to `http://localhost:5000` for local development).
3. When you deploy the backend in production (e.g. on Render, Heroku, or Fly.io), update the `API_BASE_URL` value to your backend's public url (e.g. `https://your-backend-api.onrender.com`).
4. Update the `FRONTEND_URL` variable in your backend's `.env` to match your deployed frontend url (e.g., `https://yourdomain.com`).
