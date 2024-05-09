const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'data.json');

// Function to read data from file
// Function to read data from file
function readDataFromFile() {
    try {
        const data = fs.readFileSync(dataFilePath);
        let parsedData = JSON.parse(data);
        console.log('Data read from file:', parsedData); // Log the parsed data
        if (!parsedData.todos || !Array.isArray(parsedData.todos)) {
            parsedData.todos = []; // Initialize todos array if it doesn't exist or is not an array
        }
        return parsedData;
    } catch (error) {
        console.error('Error reading data from file:', error);
        return { todos: [] }; // Return empty array if file doesn't exist or there's an error
    }
}


// Function to save data to file
function saveDataToFile(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
        console.log('Data saved to file:', data);
    } catch (error) {
        console.error('Error saving data to file:', error);
    }
}

// Initialize data
let data = readDataFromFile();
console.log('Initial data:', data); // Log the initial data

// GET route to retrieve all todos
app.get('/todos', (req, res) => {
    try {
        res.json(data.todos);
    } catch (error) {
        console.error('Error sending response:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST route to add a new todo
app.post('/todos', (req, res) => {
    try {
        const { title, description, status } = req.body;
        const newTodo = {
            id: generateId(),
            title,
            description,
            status
        };
        data.todos.push(newTodo);
        saveDataToFile(data);
        res.json({ message: 'Todo added successfully', todo: newTodo });
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT route to update an existing todo
app.put('/todos/:id', (req, res) => {
    try {
        const todoId = req.params.id;
        const { title, description, status } = req.body;
        const index = data.todos.findIndex(todo => todo.id === todoId);
        if (index === -1) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        data.todos[index] = {
            ...data.todos[index],
            title: title || data.todos[index].title,
            description: description || data.todos[index].description,
            status: status || data.todos[index].status
        };
        saveDataToFile(data);
        res.json({ message: 'Todo updated successfully', todo: data.todos[index] });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE route to delete a todo
app.delete('/todos/:id', (req, res) => {
    try {
        const todoId = req.params.id;
        const index = data.todos.findIndex(todo => todo.id === todoId);
        if (index === -1) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        data.todos.splice(index, 1);
        saveDataToFile(data);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Generate unique id for todo
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

const PORT = 4000; // Define the port number

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
