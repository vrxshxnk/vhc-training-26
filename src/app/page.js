'use client'; // Tell Next.js this is a Client Component so we can use state and interactivity

import { useState, useEffect } from 'react'; // Import state and effect hooks from React
import Link from 'next/link'; // Import Link for internal routing

export default function TodoPage() { // Our main functional component for the page
  const [todos, setTodos] = useState([]); // Create state to store our list of todos
  const [input, setInput] = useState(''); // Create state to manage the text in our input field
  const [loading, setLoading] = useState(true); // Create a loading state to show while fetching data

  useEffect(() => { // Hook that runs once when the component finishes mounting
    fetchTodos(); // Call our custom fetch function
  }, []); // Empty dependency array ensures this only runs once

  const fetchTodos = async () => { // Function to grab all todos from our API
    try {
      const res = await fetch('/api/todos'); // Send a GET request to our API endpoint
      const json = await res.json(); // Convert the raw response into a JSON object
      if (json.success) setTodos(json.data); // If it was successful, save the data to our state
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false); // Turn off the loading indicator
    }
  };

  const addTodo = async (e) => { // Function to handle form submission for new todos
    e.preventDefault(); // Prevent the default browser behavior of refreshing the page
    if (!input) return; // Exit early if the input is empty text

    try {
      const res = await fetch('/api/todos', { // Send a POST request to add the new task
        method: 'POST', // HTTP method POST for creation
        headers: { 'Content-Type': 'application/json' }, // Tell the server we are sending JSON data
        body: JSON.stringify({ task: input }), // Convert our input state into a JSON string
      });

      const json = await res.json(); // Wait for the response JSON
      if (json.success) { // If adding was successful...
        setTodos([json.data, ...todos]); // ...add the new todo to the beginning of our current list
        setInput(''); // ...clear the input field for the next task
      }
    } catch (error) {
      console.error('Failed to add:', error);
    }
  };

  const deleteTodo = async (id) => { // Function to remove a task
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' }); // Call our dynamic API route with the ID
      if (res.ok) { // If deletion worked...
        setTodos(todos.filter((t) => t._id !== id)); // ...remove that item from our local UI state
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const toggleTodo = async (id, completed) => { // Function to check/uncheck a task
    try {
      const res = await fetch(`/api/todos/${id}`, { // PATCH request to the specific ID
        method: 'PATCH', // Update method
        headers: { 'Content-Type': 'application/json' }, // Specify JSON format
        body: JSON.stringify({ completed: !completed }), // Send the opposite of its current status
      });
      const json = await res.json(); // Parse result
      if (json.success) { // If toggle worked...
        setTodos(todos.map((t) => (t._id === id ? json.data : t))); // ...update only that one item in our list
      }
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  return ( // UI Layout
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4"> {/* Page wrapper */}
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl border border-slate-100 overflow-hidden"> {/* Content card */}
        <div className="bg-blue-600 p-8 text-white text-center"> {/* Card header with gradient-like blue */}
          <h1 className="text-3xl font-bold tracking-tight">Focus Tasks</h1> {/* App Title */}
          <p className="mt-2 text-pink-100 font-medium italic">Simple, smooth, and styled.</p> {/* Subtitle */}
        </div>

        <div className="p-8"> {/* Body padding */}
          <form onSubmit={addTodo} className="flex gap-3 mb-8"> {/* Input form */}
            <input
              type="text"
              className="flex-1 rounded-xl border-slate-200 border-2 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="What's your next move?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all">
              Add
            </button>
          </form>

          {loading ? (<div className="text-center py-10 text-slate-400 animate-pulse">Loading your tasks...</div>) : ( // Status check
            <div className="space-y-3"> {/* Task list spacing */}
              {todos.length === 0 ? (<p className="text-center text-slate-400 italic">No tasks today. Enjoy!</p>) : ( // Empty check
                todos.map((todo) => ( // Loop tasks
                  <div key={todo._id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-blue-100 transition-all shadow-sm"> {/* Task item */}
                    <div className="flex items-center gap-4"> {/* Inner content */}
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo._id, todo.completed)}
                        className="w-6 h-6 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`${todo.completed ? 'line-through text-slate-300' : 'text-slate-700 font-medium'}`}>
                        {todo.task}
                      </span>
                    </div>
                    <button onClick={() => deleteTodo(todo._id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-sm font-bold">
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Link href="/about" className="mt-10 text-slate-400 font-medium hover:text-blue-500 transition-colors">
        About this project →
      </Link>
      <Link href="/company" className="mt-10 text-slate-400 font-medium hover:text-blue-500 transition-colors">
        Company →
      </Link>
    </div>
  );
}

// pm2 start npm --name "my-app" -- start -- -p 3031