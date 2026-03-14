# User Management API

A Node.js + Express + MongoDB REST API for managing users with authentication, authorization, soft delete, and admin management features.

This API supports:

- User registration and login
- JWT authentication
- Profile management
- Password change
- Soft delete for users
- Admin management APIs
- Pagination
- Input validation
- Secure password hashing

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Joi Validation
- Validator.js

---

## Project Structure

```
user-management/
│
├── config/
│ └── db.js
│
├── controller/
│ ├── adminController.js
│ ├── authController.js
│ └── userController.js
│
├── middlewares/
│ ├── admin.middleware.js
│ ├── auth.middleware.js
│ ├── error.middleware.js
│ └── validation.middleware.js
│
├── models/
│ └── userModel.js
│
├── router/
│ ├── adminRouter.js
│ ├── authRouter.js
│ └── userRouter.js
│
├── utils/
│ ├── generateToken.js
│ └── password.bcrypt.js
│
├── validations/
│ └── user.validation.js
│
├── server.js
└── package.json
```

---

## Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/anubhav-uchiha/user-management.git
cd assignment
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Create .env file

```
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

**Example:**

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/user_management
JWT_SECRET=supersecretkey
```

---

## Run the Project

### Development Mode

```
npm run dev
```

### Production Mode

```
npm start
```

**Server will run at:**

```
http://localhost:4000
```

---

## Authentication

This API uses JWT Token Authentication.

**Include the token in headers:**

```
Authorization: Bearer <token>
```

---

## API Endpoints

## Auth APIs

### Create User

**POST**

```
/api/auth/createUser
```

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "9876543210",
  "address": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "zipcode": "400001",
    "geo": {
      "lat": 19.076,
      "lng": 72.8777
    }
  }
}
```

---

### Login User

**POST**

```
/api/auth/loginUser
```

**Request Body**

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

Response returns JWT token.

---

## User APIs

(Requires Authentication)

### Get My Profile

**GET**

```
/api/user/getProfile
```

---

### Update User

**PUT**

```
/api/user/updateUser
```

**Example Body:**

```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

---

### Change Password

**PUT**

```
/api/user/changePassword
```

**Request Body**

```json
{
  "oldPassword": "Password@123",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

---

### Soft Delete User

**Users can delete their own account.**

**DELETE**

```
/api/user/softDeleteUser/:id
```

**This sets:**

```
is_deleted = true
```

**User data remains in database.**

---

### Logout

**POST**

```
/api/user/logout
```

---

## Admin APIs

Requires Admin Authentication

### Get All Users

**GET**

```
/api/admin/getAllUser?page_no=1&page_size=10
```

- Supports pagination.

**Response:**

```
page_no
page_size
total_users
total_pages
```

---

### Get User By ID

**GET**

```
/api/admin/getUserById/:id
```

---

### Delete User Permanently

**DELETE**

```
/api/admin/deleteUserById/:id
```

- This performs hard delete from database.

---

### Delete All Users

**DELETE**

```
/api/admin/deleteAllUser
```

Deletes all non-admin users permanently.

---

## Database Schema

### User Schema

Fields:

- first_name
- last_name
- email
- password
- phone
- address
- is_deleted
- isAdmin
- createdAt
- updatedAt

---

### Address Structure:

```
address
├── city
├── state
├── country
├── zipcode
└── geo
     ├── lat
     └── lng
```

---

## Security Features

- Password hashing using bcrypt
- JWT authentication
- Admin authorization middleware
- Input validation using Joi
- Soft delete protection
- Duplicate email/phone protection
- Strong password validation

---

## Middlewares

### Authentication Middleware

- Validates JWT token.

## Admin Middleware

- Allows access only to admin users.

## Validation Middleware

- Validates request body using Joi schemas.

## Error Middleware

- Handles application errors centrally.

Error Response Format

```json
{
  "success": false,
  "message": "Error message"
}
```

Success Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Dependencies

### Main packages used:

- express
- mongoose
- jsonwebtoken
- bcrypt
- joi
- validator
- cors
- dotenv

## Development:

nodemon

## Author

Anubhav Kumar
