const server = require('./server.js');

const PORT = process.env.PORT || 4000;

const accountRoutes = require('./routers/accountRoutes.js');

server.use('/api/accounts', accountRoutes);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
