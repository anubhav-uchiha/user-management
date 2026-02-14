# User Management API

A RESTful API built using Node.js, Express, and MongoDB for managing users.

## API

- Create User
- Get All Users
- Get User By ID
- Update User
- Delete User By ID
- Delete All Users

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- CORS

---

## Installation

1. Clone the repository

```
git clone https://github.com/anubhav-uchiha/user-management

```

2. Navigate into project folder

```
cd your-repo-name
```

3. Install dependencies

```
npm install
```

4. Create `.env` file in root directory

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/management
```

5. Start the server

```
npm run dev
```

or

```
node server.js
```

---

## API Endpoints

### Base URL

```
http://localhost:4000/api/users
```

---

### Create User

**POST** `http://localhost:4000/api/createUser`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "company": "Tech Corp",
  "address": {
    "city": "Delhi",
    "zipcode": "110001",
    "geo": {
      "lat": "28.6139",
      "lng": "77.2090"
    }
  }
}
```

---

### Get All Users

**GET** `http://localhost:4000/api/getAllUser`

---

### Get User By ID

**GET** `http://localhost:4000/api/getUserById/:user_id`

---

### Update User

**PUT** `http://localhost:4000/api/updateUser/:user_id`

Body (any fields you want to update):

```json
{
  "name": "Updated Name"
}

{
  "address.city": "Updated Name"
}

{
  "address.geo.lat": "Updated Name"
}

```

---

### Delete User By ID

**DELETE** `http://localhost:4000/api/deleteUserById/:user_id`

---

### Delete All Users

**DELETE** `http://localhost:4000/api/deleteAllUser/`

---

## Validation Rules

- Valid MongoDB ObjectId required
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Proper error responses with status codes

---

## Author

Anubhav Kumar

---
