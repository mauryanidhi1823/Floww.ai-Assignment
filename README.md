# Floww.ai-Assignment
Assignment
# Financial Records API

## Setup and Run Instructions

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `node app.js` to start the server.
4. Use Postman to test the API.

## API Documentation
### Add a new category
- **URL**: POST/categories
-**Content-Type**: application/json
-**Body**: {
    "name": "Food",
    "type": "expense"
}
-**Response**: 201: Returns the ID of the created category
400: Invalid Category data

### Get all categories
-**URL**: GET/categories
-**Response**: 200: Returns a list of all categories

### Add a new trsnsaction
-**URL**: POST/transaction
-**Content-Type**: application/json
- **Request Body**: `{ "type": "income", "category": "salary", "amount": 1000, "date": "2024-10-22", "description": "Monthly Salary" }`
- **Response**: 201: Returns the ID of the created transaction
400: Invalid transacton data
500: Server error

### Retrieve all transactions
-**URL**: GET/transactions
- **Response**: 200:Returns a list of all transactions.

### Get a transaction by ID
-**URL**: Get/transactions/:id
-**Response**: 200: Returns the transaction with the specified ID
404: Transaction not found

### Update a transaction by ID
-**URL**: PUT/transactions/:id
-**Content-Type**: application/json
-**Body**: {
    "type": "expense",
    "category": 1,
    "amount": 75,
    "date": "2024-10-22",
    "description": "Updated grocery shopping"
}
-**Response**: 200: Transaction updated successfully
404: Transaction not found

### Delete a transaction by ID
-**URL**: DELETE/transactions/:id
-**Responses**: 200: Transaction deleted successfully
404: Transaction not found

### Get summary
-**URL**: GET/summary
-**Response**: 200: Returns the total income, total expense, and balance

