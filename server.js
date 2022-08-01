const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const express = require('express')
const bodyParser = require('body-parser');  


module.exports.startApolloServer = async (options = { port: process.env.PORT || 5000 }) => {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  server.applyMiddleware({ app });

  app.use(bodyParser.urlencoded({ extended: true }));

  const MONGODB = process.env.MONGODB_URI 
  const urlApollo = `http://localhost:${options.port}${server.graphqlPath}`
  
  await new Promise(resolve => app.listen(options, resolve));
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `🚀 Query endpoint ready at ${urlApollo}`,
    );
  }
  
  mongoose
  .connect(MONGODB, { useNewUrlParser: true})
  .then(() => {
      return { server, app };
  })

}
