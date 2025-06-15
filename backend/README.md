# MindConnect Backend API

A Node.js/Express backend API for the MindConnect appointment booking system.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Session Management**: CRUD operations for therapy sessions
- **Appointment Booking**: Create, view, and manage appointments
- **Therapist Management**: Manage therapist profiles and availability
- **Guest Booking**: Allow non-registered users to book appointments
- **Email Notifications**: Welcome emails and password reset functionality

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email functionality
- **Multer** - File uploads

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password-request` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/validate-session` - Validate JWT token

### Sessions
- `GET /api/sessions` - Get all active sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create new session (admin only)
- `PUT /api/sessions/:id` - Update session (admin only)
- `DELETE /api/sessions/:id` - Delete session (admin only)

### Appointments
- `POST /api/appointments` - Create appointment (public)
- `GET /api/appointments/user` - Get user's appointments
- `GET /api/appointments/therapist` - Get therapist's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments` - Get all appointments (admin only)

### Therapists
- `GET /api/therapists` - Get all active therapists
- `GET /api/therapists/:id` - Get therapist by ID
- `GET /api/therapists/:id/availability` - Get therapist availability
- `POST /api/therapists` - Create therapist (admin only)
- `PUT /api/therapists/:id` - Update therapist
- `DELETE /api/therapists/:id` - Delete therapist (admin only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   CLIENT_URL=http://localhost:5173
   ```

3. **Database Setup**:
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Database Models

### User
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `phone` - Phone number
- `dateOfBirth` - Date of birth
- `address` - Address
- `role` - User role (client, therapist, admin)
- `photo` - Profile photo URL
- `specialization` - Therapist specialization
- `experience` - Years of experience
- `rating` - Average rating
- `reviews` - Number of reviews
- `bio` - Therapist bio
- `availability` - Available days
- `isActive` - Account status

### Session
- `name` - Session name
- `description` - Session description
- `duration` - Session duration
- `price` - Session price
- `icon` - Session icon/emoji
- `features` - Array of features
- `isActive` - Session status

### Appointment
- `client` - Reference to client user
- `therapist` - Reference to therapist user
- `session` - Reference to session
- `date` - Appointment date
- `time` - Appointment time
- `duration` - Session duration
- `status` - Appointment status
- `price` - Appointment price
- `location` - Appointment location
- `paymentMethod` - Payment method used
- `paymentStatus` - Payment status
- `guestInfo` - Guest information (for non-registered users)
- `notes` - Additional notes
- `isActive` - Appointment status

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control

- **Client**: Can book appointments, view their appointments, update profile
- **Therapist**: Can view their appointments, update appointment status, manage profile
- **Admin**: Full access to all endpoints

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Optional data
  "error": "Error details" // Only on errors
}
```

## Development

- **Hot Reload**: Uses nodemon for automatic server restart
- **CORS**: Configured for frontend integration
- **File Uploads**: Supports image uploads for user profiles
- **Email**: Configured for transactional emails

## Production Considerations

- Use environment variables for sensitive data
- Implement rate limiting
- Add request validation
- Set up proper logging
- Configure HTTPS
- Implement proper error handling
- Set up monitoring and alerts 