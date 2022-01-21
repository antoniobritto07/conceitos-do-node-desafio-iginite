const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: 'Mensagem do erro' })
  }
  request.user = user
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userNameAlreadyInUse = users.some((user) => user.username === username);

  if (userNameAlreadyInUse) {
    return response.status(400).json({ error: 'Mensagem do erro' })
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const hasTodoWithReferencedId = user.todos.some((todo) => todo.id === id);

  if (!hasTodoWithReferencedId) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }

  const todoToBeUpdated = user.todos.find(todo => todo.id === id);

  todoToBeUpdated.title = title;
  todoToBeUpdated.deadline = deadline;

  return response.status(200).json(todoToBeUpdated);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const hasTodoWithReferencedId = user.todos.some((todo) => todo.id === id);

  if (!hasTodoWithReferencedId) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }

  const todoToBeUpdated = user.todos.find(todo => todo.id === id);

  todoToBeUpdated.done = true;

  return response.status(200).json(todoToBeUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const hasTodoWithReferencedId = user.todos.some((todo) => todo.id === id);

  if (!hasTodoWithReferencedId) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const todoToBeDeletedIndex = user.todos.findIndex(todo => todo.id === id);

  user.todos.splice(todoToBeDeletedIndex, 1)

  return response.status(204).json();
});

module.exports = app;