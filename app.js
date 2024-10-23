const express = require('express');
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3")
const cors = require('cors');

let db;
const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "expense.db");

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT CHECK(type IN ('income', 'expense')) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
                category INTEGER NOT NULL,
                amount REAL NOT NULL,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                FOREIGN KEY (category) REFERENCES categories (id)
            );
        `);


        app.listen(3000, () => {
            console.log("Server is running at https://localhost:3000/");
        })

    } catch (error) {
        console.log(`Database error is ${error.message}`);
        process.exit(1);
    }
};

initializeDbAndServer();


// Endpoint to add a new transaction
app.post('/transactions', async (req, res) => {
    const { type, category, amount, description } = req.body;

    if (!type || !category || !amount || (type !== 'income' && type !== 'expense')) {
        return res.status(400).json({ error: 'Invalid transaction data' });
    }

    const categoryExists = await db.get('SELECT 1 FROM categories WHERE id = ?', [category]);
    if (!categoryExists) {
        return res.status(400).json({ error: 'Category does not exist' });
    }

    try {
        const query = `
            INSERT INTO transactions (type, category, amount, date, description)
            VALUES (?, ?, ?, datetime('now'), ?)
        `;
        const result = await db.run(query, [type, category, amount, description || '']);
        res.status(201).json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to retrieve all transactions
app.get('/transactions', async (req, res) => {
    try {
        const query = 'SELECT * FROM transactions';
        const transactions = await db.all(query);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get a transaction by ID
app.get('/transactions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM transactions WHERE id = ?';
        const transaction = await db.get(query, [id]);

        if (transaction) {
            res.status(200).json(transaction);
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to update a transaction by ID
app.put('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { type, category, amount, description } = req.body;

    if (!type || !category || !amount || (type !== 'income' && type !== 'expense')) {
        return res.status(400).json({ error: 'Invalid transaction data' });
    }

    try {
        const query = `
            UPDATE transactions
            SET type = ?, category = ?, amount = ?, description = ?
            WHERE id = ?
        `;
        const result = await db.run(query, [type, category, amount, description, id]);

        if (result.changes !== 0) {
            res.status(200).json({ message: 'Transaction updated successfully' });
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to delete a transaction by ID
app.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM transactions WHERE id = ?';
        const result = await db.run(query, [id]);

        if (result.changes !== 0) {
            res.status(200).json({ message: 'Transaction deleted successfully' });
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to get a summary of transactions (total income, total expense, balance)
app.get('/summary', async (req, res) => {
    try {
        const incomeQuery = `SELECT SUM(amount) as totalIncome FROM transactions WHERE type = 'income'`;
        const expenseQuery = `SELECT SUM(amount) as totalExpense FROM transactions WHERE type = 'expense'`;

        const incomeResult = await db.get(incomeQuery);
        const expenseResult = await db.get(expenseQuery);

        const totalIncome = incomeResult.totalIncome || 0;
        const totalExpense = expenseResult.totalExpense || 0;
        const balance = totalIncome - totalExpense;

        res.status(200).json({
            totalIncome,
            totalExpense,
            balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to add a new category
app.post('/categories', async (req, res) => {
    const { name, type } = req.body;

    if (!name || (type !== 'income' && type !== 'expense')) {
        return res.status(400).json({ error: 'Invalid category data' });
    }

    try {
        const query = `INSERT INTO categories (name, type) VALUES (?, ?)`;
        const result = await db.run(query, [name, type]);
        res.status(201).json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get all categories
app.get('/categories', async (req, res) => {
    try {
        const query = 'SELECT * FROM categories';
        const categories = await db.all(query);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
