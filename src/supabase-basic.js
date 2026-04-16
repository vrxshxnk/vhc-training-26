/**
 * SUPABASE CLIENT SDK CRUD TUTORIAL
 * 
 * --- DETAILED SUPABASE QUERY SYNTAX ---
 * 
 * Supabase uses a "Chainable" syntax. You start with .from('table') and then add methods.
 * 
 * 1. SELECT (READing Data):
 *    - .select('*') : Gets all columns.
 *    - .select('name, age') : Gets only specific columns.
 *    
 * 2. FILTERS (The "WHERE" clause in SQL):
 *    - .eq('col', 'val') : Equals (Where column is exactly 'val').
 *    - .neq('col', 'val') : Not Equals.
 *    - .gt('col', 10) : Greater Than.
 *    - .lt('col', 10) : Less Than.
 *    - .like('col', '%term%') : Search for text pattern.
 *    - .in('col', ['val1', 'val2']) : Matches any value in the list.
 * 
 * 3. MODIFIERS (Changing how data is returned):
 *    - .order('col', { ascending: false }) : Sorts the result. Default is true (A-Z, 0-9).
 *    - .limit(5) : Only returns the first 5 rows.
 *    - .single() : Returns a single object instead of an array (useful for getting one specific item).
 * 
 * 4. INSERT / UPDATE / DELETE:
 *    - .insert([{ task: 'Clean' }]) : Adds new row(s). Needs an array of objects.
 *    - .update({ task: 'Done' }) : Updates existing row(s). Usually used with .eq().
 *    - .delete() : Deletes row(s). ALWAYS use with .eq() or you might delete everything!
 *    - .select() : Add this at the end of Insert/Update/Delete to get the affected rows back.
 * 
 * TO RUN THIS STANDALONE:
 * 1. npm install @supabase/supabase-js dotenv
 * 2. Update .env.local in the project root with:
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
 * 3. Run: node src/supabase-basic.js
 */

// 1. IMPORT LIBRARIES
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load secrets from '.env.local'
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// 2. USE ENVIRONMENT VARIABLES
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERROR: Supabase URL or Key is missing from .env.local!");
    console.log("Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set.");
    process.exit(1);
}

// 3. INITIALIZE THE SUPABASE CLIENT
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 4. THE MAIN FUNCTION
async function runTutorial() {
    try {
        console.log("--- STARTING SUPABASE SDK TUTORIAL ---");

        // NOTE: We assume 'vhc26_todos' table exists. 
        // In Supabase, you usually create tables via the Dashboard or Migrations.
        const TABLE_NAME = 'vhc26_todos';

        // --- STEP A: READ (The 'R' in CRUD) ---
        console.log("1. READING (Selecting) Todos...");
        const { data: initialData, error: readError } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('id', { ascending: false });

        if (readError) {
            // If table doesn't exist, we'll explain it in the catch block
            throw readError;
        }
        console.log(`Current Todos in ${TABLE_NAME}:`, initialData.length);
        console.log("--------------------------\n");

        // --- STEP B: CREATE (The 'C' in CRUD) ---
        console.log("2. CREATING (Inserting) a new Todo...");
        const { data: insertedData, error: insertError } = await supabase
            .from(TABLE_NAME)
            .insert([{ task: "Learn Supabase Client SDK", is_completed: false }])
            .select();

        if (insertError) throw insertError;
        const newTodo = insertedData[0];
        console.log("Created Todo with ID:", newTodo.id);
        console.log("--------------------------\n");

        // --- STEP C: UPDATE (The 'U' in CRUD) ---
        console.log("3. UPDATING a Todo...");
        const { data: updatedData, error: updateError } = await supabase
            .from(TABLE_NAME)
            .update({ is_completed: true })
            .eq('id', newTodo.id)
            .select();

        if (updateError) throw updateError;
        console.log("Updated Todo status:", updatedData[0].is_completed);
        console.log("--------------------------\n");

        /* 
        // --- STEP D: DELETE (The 'D' in CRUD) ---
        console.log("4. DELETING the demo Todo...");
        const { data: deletedData, error: deleteError } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', newTodo.id)
            .select();

        if (deleteError) throw deleteError;
        console.log("Deleted Todo with ID:", deletedData[0].id);
        console.log("--------------------------\n");
        */

        console.log("--- TUTORIAL FINISHED SUCCESSFULLY ---");
        console.log("You have successfully used the Supabase SDK for CRUD operations!");

    } catch (error) {
        console.error("ERROR DURING TUTORIAL:", error.message);
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
            console.log("\nTIP: Make sure you have created the table 'vhc26_todos' in your Supabase Dashboard!");
            console.log("You can create it by running this SQL in the Supabase SQL Editor:");
            console.log(`
                CREATE TABLE vhc26_todos (
                    id SERIAL PRIMARY KEY,
                    task TEXT NOT NULL,
                    is_completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }
    }
}

runTutorial();
