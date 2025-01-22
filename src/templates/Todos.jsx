import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Todos() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editInputValue, setEditInputValue] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:8000/api/todos/");
      setTasks(response.data);
    } catch (error) {
      setError("Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") {
      setError("Task cannot be empty.");
      return;
    }
    setError("");
    try {
      const response = await axios.post("http://localhost:8000/api/todos/add", {
        title: trimmedValue,
        completed: false,
      });
      setTasks([...tasks, response.data]);
      setInputValue("");
    } catch (error) {
      setError("Error adding task. Please try again.");
    }
  };

  const toggleCompleted = async (taskId) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (taskToUpdate) {
        await axios.put(`http://localhost:8000/api/todos/${taskId}/update`, {
          completed: !taskToUpdate.completed,
        });
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
      }
    } catch (error) {
      setError("Error updating task. Please try again.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/api/todos/${taskId}/delete`);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      setError("Error deleting task. Please try again.");
    }
  };

  const editTask = async (taskId) => {
    const trimmedValue = editInputValue.trim();
    if (trimmedValue === "") {
      setError("Task cannot be empty.");
      return;
    }
    setError("");
    try {
      await axios.put(`http://localhost:8000/api/todos/${taskId}/update`, {
        title: trimmedValue,
      });
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, title: trimmedValue } : task
      );
      setTasks(updatedTasks);
      setEditTaskId(null);
      setEditInputValue("");
    } catch (error) {
      setError("Error editing task. Please try again.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">My To-Do List</h1>
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="What needs to be done?"
            className="flex-grow px-4 py-2 text-gray-700 focus:outline-none placeholder-gray-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-6 py-2 font-medium rounded-full hover:scale-105 transition-transform focus:outline-none"
            onClick={addTask}
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {loading && <p className="text-gray-500 mt-2">Loading...</p>}
        <div className="flex justify-around mt-4">
          <button onClick={() => setFilter("all")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300">
            All
          </button>
          <button onClick={() => setFilter("completed")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300">
            Completed
          </button>
          <button onClick={() => setFilter("pending")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300">
            Pending
          </button>
        </div>
        <ul className="mt-6 space-y-3">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg shadow hover:shadow-md transition-shadow ${
                task.completed
                  ? "bg-gradient-to-r from-green-100 to-green-200"
                  : "bg-gradient-to-r from-gray-100 to-gray-200"
              }`}
            >
              {editTaskId === task.id ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-2 py-1"
                    value={editInputValue}
                    onChange={(e) => setEditInputValue(e.target.value)}
                  />
                  <button
                    onClick={() => editTask(task.id)}
                    className="text-green-500 hover:text-green-600 focus:outline-none"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => toggleCompleted(task.id)}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      task.completed ? "bg-blue-500 border-blue-500" : "border-gray-400"
                    }`}
                  ></div>
                  <span
                    className={`${
                      task.completed ? "line-through text-gray-500" : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  className="text-blue-500 hover:text-blue-600 focus:outline-none"
                  onClick={() => {
                    setEditTaskId(task.id);
                    setEditInputValue(task.title);
                  }}
                >
                  ✎
                </button>
                <button
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                  onClick={() => deleteTask(task.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
