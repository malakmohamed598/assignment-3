// Assignment 3
// Malak Mohamed Othman ✨




// part 1 --------------------------------------------------------------------------------------------------------

// question 1 ----------------------------------------------------------------------------------------------------

// the event loop helps Node.js handle asynchronous operations without waiting for every operation to finish


// question 2 ----------------------------------------------------------------------------------------------------

// Libuv is a library used by Node.js to handle asynchronous tasks like file operations, timers, and networking


// question 3 ----------------------------------------------------------------------------------------------------


// Node.js starts the operation, continues executing other code, and runs the callback when the operation is finished


// question 4 ----------------------------------------------------------------------------------------------------


// Call Stack: Executes the current JavaScript functions
// Event Queue: Stores callbacks that are ready to run
// Event Loop: Moves callbacks from the queue to the call stack when it becomes empty



// question 5 ----------------------------------------------------------------------------------------------------

// the Thread Pool is a group of threads used for some heavy asynchronous operations, such as file-system operations

// to set the size:
// process.env.UV_THREADPOOL_SIZE = 8;


// question 6 ----------------------------------------------------------------------------------------------------

// Blocking code stops the program until it finishes
// Non-blocking code starts the operation and allows Node.js to execute other code while waiting


// part 2   ----------------------------------------------------------------------------------------------------


const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

const usersFile = path.join(__dirname, 'users.json');


app.use(express.json());


async function readUsers() {
    const data = await fs.readFile(usersFile, 'utf-8');

    return JSON.parse(data);
}


async function writeUsers(users) {
    await fs.writeFile(
        usersFile,
        JSON.stringify(users, null, 2),
        'utf-8'
    );
}

// 1) Add a new user

app.post('/user', async (req, res) => {
    try {
        const { name, age, email } = req.body;

        if (!name || age === undefined || !email) {
            return res.status(400).json({
                message: 'Name, age and email are required.'
            });
        }

        const users = await readUsers();


        const emailExists = users.some((user) => {
            return user.email.toLowerCase() === email.toLowerCase();
        });

        if (emailExists) {
            return res.status(409).json({
                message: 'Email already exists.'
            });
        }


        const newId = users.length === 0
            ? 1
            : Math.max(...users.map((user) => user.id)) + 1;

        const newUser = {
            id: newId,
            name,
            age,
            email
        };

        users.push(newUser);

        await writeUsers(users);

        return res.status(201).json({
            message: 'User added successfully.',
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});


// 2) Update a user by ID

app.patch('/user/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, age, email } = req.body;

        const users = await readUsers();

        const userIndex = users.findIndex((user) => {
            return user.id === id;
        });

        if (userIndex === -1) {
            return res.status(404).json({
                message: 'User ID not found.'
            });
        }


        if (email) {
            const emailExists = users.some((user, index) => {
                return index !== userIndex &&
                    user.email.toLowerCase() === email.toLowerCase();
            });

            if (emailExists) {
                return res.status(409).json({
                    message: 'Email already exists.'
                });
            }
        }

        if (name !== undefined) {
            users[userIndex].name = name;
        }

        if (age !== undefined) {
            users[userIndex].age = age;
        }

        if (email !== undefined) {
            users[userIndex].email = email;
        }

        await writeUsers(users);

        return res.json({
            message: 'User updated successfully.',
            user: users[userIndex]
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});


// 3) Delete a user by ID

app.delete(['/user/:id', '/user'], async (req, res) => {
    try {
        const id = Number(req.params.id || req.body.id);

        if (!id) {
            return res.status(400).json({
                message: 'User ID is required.'
            });
        }

        const users = await readUsers();

        const userIndex = users.findIndex((user) => {
            return user.id === id;
        });

        if (userIndex === -1) {
            return res.status(404).json({
                message: 'User ID not found.'
            });
        }

        users.splice(userIndex, 1);

        await writeUsers(users);

        return res.json({
            message: 'User deleted successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});


// 4) Get user by name

app.get('/user/getByName', async (req, res) => {
    try {
        const name = req.query.name;
        const users = await readUsers();

        const user = users.find((user) => {
            return user.name.toLowerCase() === String(name).toLowerCase();
        });

        if (!user) {
            return res.status(404).json({
                message: 'User name not found.'
            });
        }

        return res.json(user);
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});


// 5) Get all users

app.get('/user', async (req, res) => {
    try {
        const users = await readUsers();

        return res.json(users);
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});


// 6) Filter users by minimum age

app.get('/user/filter', async (req, res) => {
    try {
        const minAge = Number(req.query.minAge);
        const users = await readUsers();

        if (Number.isNaN(minAge)) {
            return res.status(400).json({
                message: 'minAge must be a number.'
            });
        }

        const filteredUsers = users.filter((user) => {
            return user.age >= minAge;
        });

        if (filteredUsers.length === 0) {
            return res.status(404).json({
                message: 'No users found.'
            });
        }

        return res.json(filteredUsers);
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});


// 7) Get user by ID

app.get('/user/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const users = await readUsers();

        const user = users.find((user) => {
            return user.id === id;
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        return res.json(user);
    } catch (error) {
        return res.status(500).json({
            message: 'Server error.'
        });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

