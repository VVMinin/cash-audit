const express = require('express');
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const categoryRoutes = require('./routes/category.routes');
const transactionRoutes = require('./routes/transaction.routes');
const userRoutes = require('./routes/user.routes');
const adminUsersRoutes = require('./routes/admin.users.routes');
const userPasswordRoutes = require('./routes/user.password.routes');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userPasswordRoutes);
app.use('/api/admin/users', adminUsersRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

module.exports = app;


