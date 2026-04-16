/**
 * POSTGRESQL CRUD TUTORIAL (Day 1 - Total Beginners)
 * 
 * This file teaches you how to:
 * 1. Connect to PostgreSQL using the 'pg' library.
 * 2. Create a TABLE (Like a spreadsheet for your data).
 * 3. Use ENVIRONMENT VARIABLES (.env) for security.
 * 4. Perform Create, Read, Update, and Delete (CRUD).
 * 
 * TO RUN THIS STANDALONE:
 * 1. npm install pg dotenv 
 * 2. Create/Update a .env.local file in the project root.
 * 3. Add your URI: POSTGRES_URL=postgres://username:password@host:port/database
 * 4. Run: node src/postgres-basic.js
 */

// 1. IMPORT LIBRARIES
// 'pg' is the most popular library for Node.js to talk to PostgreSQL.
// We use 'Pool' because it allows multiple connections to work at the same time.
// Think of a 'Pool' like a fleet of taxis at a taxi stand—instead of building a car
// every time someone needs a ride, we keep a few cars ready to go!
const { Pool } = require('pg');
const path = require('path');

// Import 'dotenv' to load secrets from '.env.local'
// This is CRITICAL: Never put your database password directly in the code!
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// 2. USE ENVIRONMENT VARIABLES
// Instead of hardcoding, we use 'process.env' to pull from our .env.local file.
const POSTGRES_URL = process.env.POSTGRES_URL;

// Check if the URL is actually there. If it's missing, we provide a helpful error message.
if (!POSTGRES_URL) {
    console.error("ERROR: POSTGRES_URL is missing from .env.local!");
    console.log("Example format: POSTGRES_URL=postgres://postgres:password@localhost:5432/vhc_training");
    process.exit(1); // Exit the script because we can't work without a connection!
}

// 3. INITIALIZE THE CONNECTION POOL
// A "Pool" is like a waiting line for database connections. 
// It reuses connections instead of creating a new one every single time you want to save data.
const pool = new Pool({
    connectionString: POSTGRES_URL,
    ssl: {
        // SSL stands for 'Secure Sockets Layer'. It encrypts the data moving between 
        // your computer and the database so nobody can "eavesdrop".
        // 'rejectUnauthorized: false' is like saying "I trust this connection even if 
        // the security certificate isn't signed by a major authority" (Common in Dev).
        rejectUnauthorized: false
    }
});

// 4. THE MAIN FUNCTION
// We use 'async' because database calls take time (they have to travel over the internet).
// Using 'await' makes our code wait for the database to reply before moving to the next line.
async function runTutorial() {
    try {
        console.log("--- STARTING POSTGRES TUTORIAL ---");

        // --- STEP A: CONNECT & CREATE TABLE ---
        console.log("Connecting to PostgreSQL...");

        // In PostgreSQL (SQL), you must define exactly what your "spreadsheet" columns look like.
        // We use a "CREATE TABLE" command for this.

        // Let's break down the syntax below:
        // 1. 'SERIAL': An auto-counting number (1, 2, 3...) so every row has a unique ID.
        // 2. 'PRIMARY KEY': Tells the database "This ID is the unique fingerprint for this row."
        // 3. 'TEXT NOT NULL': This column stores text and CANNOT be left empty.
        // 4. 'BOOLEAN': Stores either TRUE or FALSE.
        // 5. 'TIMESTAMP': Stores the exact date and time.
        // 6. 'DEFAULT CURRENT_TIMESTAMP': If you don't provide a date, the DB uses "Right Now".
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS vhc26_todos (
                id SERIAL PRIMARY KEY,
                task TEXT NOT NULL,
                is_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableQuery);
        console.log("Table 'vhc26_todos' is ready!\n");

        // --- STEP B: CREATE (The 'C' in CRUD) ---
        console.log("1. CREATING (Inserting) a new Todo...");
        // In SQL, we use 'INSERT INTO' to add data.

        // WHAT ARE PARAMETERIZED QUERIES?
        // instead of putting "Learn PostgreSQL" directly in the string, we use $1 and $2.
        // Think of $1 and $2 like "empty boxes" or "placeholders".
        // The database first looks at the Query (the code), and THEN safely puts the data 
        // into those boxes. This prevents "SQL Injection" where a hacker might try 
        // to put code (like "'; DROP TABLE users; --") into your input box.

        // 'RETURNING *' tells PostgreSQL: "After you save this, please send the FULL row back to me 
        // including the auto-generated ID!"
        const insertQuery = 'INSERT INTO vhc26_todos (task, is_completed) VALUES ($1, $2) RETURNING *';
        const values = ["Learn PostgreSQL Day 1", false];

        // We pass the 'values' array separately. The 'pg' library makes sure they stay as DATA, 
        // and never get treated as executable code by the database.
        const resInsert = await pool.query(insertQuery, values);
        const newTodo = resInsert.rows[0]; // Rows are always returned in an ARRAY.
        console.log("Created Todo with ID:", newTodo.id);
        console.log("--------------------------\n");

        // --- STEP C: READ (The 'R' in CRUD) ---
        console.log("2. READING (Selecting) Todos...");

        // 'SELECT *' means "Get all columns from this table."
        // 'ORDER BY id DESC' means "Get the newest ones first (counting backwards from the highest ID)."
        const resAll = await pool.query('SELECT * FROM vhc26_todos ORDER BY id DESC');
        console.log("Current Todos in DB:", resAll.rows);

        // Find a specific one using its task name.
        const resSingle = await pool.query('SELECT * FROM vhc26_todos WHERE task = $1', ["Learn PostgreSQL Day 1"]);
        if (resSingle.rows.length > 0) {
            console.log("Found specific Todo:", resSingle.rows[0].task);
        }
        console.log("--------------------------\n");

        // --- STEP D: UPDATE (The 'U' in CRUD) ---
        console.log("3. UPDATING a Todo...");
        // 'UPDATE' changes existing data. 
        // We use 'SET' to tell the DB which column to change and what the new value is.
        const updateQuery = 'UPDATE vhc26_todos SET is_completed = $1 WHERE task = $2 RETURNING *';
        const updateValues = [true, "Learn PostgreSQL Day 1"];

        const resUpdate = await pool.query(updateQuery, updateValues);
        if (resUpdate.rows.length > 0) {
            console.log("Updated Todo status:", resUpdate.rows[0].is_completed);
        }
        console.log("--------------------------\n");

        // --- STEP E: DELETE (The 'D' in CRUD) ---
        // Uncomment the lines below to try deleting!
        // console.log("4. DELETING a Todo...");
        // const deleteQuery = 'DELETE FROM vhc26_todos WHERE id = $1 RETURNING *';
        // const resDelete = await pool.query(deleteQuery, [newTodo.id]);
        // console.log("Deleted Todo with ID:", resDelete.rows[0].id);
        // console.log("--------------------------\n");

        // --- BONUS: SQL Concepts ---
        console.log("5. BONUS: Useful SQL Techniques...");

        // A. FILTERING & COUNTING: How many tasks are done?
        // 'COUNT(*)' is an "Aggregate function"—it counts the rows that match our rule.
        const resCount = await pool.query('SELECT COUNT(*) FROM vhc26_todos WHERE is_completed = true');
        console.log("Total completed tasks:", resCount.rows[0].count);

        // B. ILIKE: Search for text, ignoring if it's UPPERcase or lowerCASE.
        // The % signs are called "Wildcards". They mean "match any characters here".
        // Example: "%Postgre%" matches "PostgreSQL", "postgre", or "Learning Postgres".
        const resSearch = await pool.query("SELECT * FROM vhc26_todos WHERE task ILIKE $1", ["%Postgre%"]);
        console.log("Search results for 'Postgre':", resSearch.rows.length);

        console.log("--------------------------\n");
        console.log("--- TUTORIAL FINISHED SUCCESSFULLY ---");
        console.log("PRO TIP: SQL is powerful because it uses very strict rules to keep data clean.");

    } catch (error) {
        // ALWAYS catch errors! If the database is down, this will tell you why.
        console.error("ERROR DURING TUTORIAL:", error.message);
    } finally {
        // IMPORTANT: We must close the pool, otherwise the script will keep running forever
        // because it's still waiting for more database work to do!
        await pool.end();
        console.log("Database connection pool closed.");
    }
}

runTutorial();

/**
 * --- SQL Assignment ---
 * 
 * 1. ALTER TABLE: Add a 'priority' column to the table.
 *    Hint: pool.query('ALTER TABLE vhc26_todos ADD COLUMN priority TEXT;')
 * 
 * 2. AGGREGATION: Write a query to find the earliest created todo.
 *    Hint: SELECT * FROM vhc26_todos ORDER BY created_at ASC LIMIT 1;
 * 
 * 3. BATCH INSERT: Look up how to insert multiple rows in one INSERT command.
 * 
 * 4. Safety First: Why do we use $1, $2 instead of putting variables directly in the string?
 *    Answer: To prevent SQL Injection attacks!
 * 
 */
