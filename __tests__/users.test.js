const { createApolloServer } = require('../server');
const bcrypt = require('bcryptjs')
const request = require('supertest');

jest.setTimeout(20000)

  // START QUERIES 

  const registerQuery = {
    query: `mutation Register($registerInput: registerInput) {
              register(registerInput: $registerInput) {
                id
                username
                email
                createdAt
                token
              }
            }`,
    variables: { "registerInput": {
                    "username": "testuser",
                    "password": "testuserpass",
                    "confirmPassword": "testuserpass",
                    "email": "fake@email.com",
                  }
                },
  };

  const correcttLoginQuery = {
    query: `mutation Login($username: String!, $password: String!) {
              login(username: $username, password: $password) {
                id
                email
                token
                username
                createdAt
              }
            }`,
    variables: { username: 'testuser', password: 'testuserpass' },
  };

  const incorrectLoginQuery = {
    query: `mutation Login($username: String!, $password: String!) {
              login(username: $username, password: $password) {
                id
                email
                token
                username
                createdAt
              }
            }`,
    variables: { username: 'testuser', password: 'testuserpasswrong' },
  };

  const queryExistingUser = {
    query: `query getExistingUser($username: String!) {
                getUser(username: $username) {
                  username
                  email
                  createdAt
                }
            }`,
    variables: { username: 'testuser' },
  };

  const removeUserQuery = {
    query: `mutation DeleteUser($username: String!) {
              deleteUser(username: $username) {
                username
              }
            }`,
    variables: { username: 'testuser' },
  };

  const queryNonExisitngUsers = {
    query: `query getExistingUser($username: String!) {
                getUser(username: $username) {
                  username
                  email
                  createdAt
                }
            }`,
    variables: { username: 'testuser' },
  };


  // END QUERIES 

  describe('users', () => {
    let server
    let url = "http://localhost:5000/graphql"
  
    // before the tests we will spin up a new Apollo Server
    beforeAll(async () => {
      // We pass in the port as 0 to let the server pick its own ephemeral port for testing
      server = await createApolloServer({ port: 0 });
    });
  
    // after the tests we will stop our server
    afterAll(async () => {
      await server?.close();
    });
  

    it('can register', async () => {
      const response = await request(url).post('/').send(registerQuery);

      expect(response.body.errors).toBeUndefined();

      expect(response.body?.data?.register?.id).toBeDefined();

      expect(response.body?.data?.register?.username).toBe('testuser');

      expect(response.body?.data?.register?.email).toBe('fake@email.com');
      
      expect(response.body?.data?.register?.createdAt).toBeDefined();

      expect(response.body?.data?.register?.token).toBeDefined();

    });

    it('can get existing users', async () => {
      // send request to the url of the test server
      const response = await request(url).post('/').send(queryExistingUser);
  
      expect(response.body.errors).toBeUndefined();
  
      expect(response.body?.data?.getUser?.username).toBe('testuser');

      expect(response.body?.data?.getUser?.email).toBe('fake@email.com');

      expect(response.body?.data?.getUser?.createdAt).toBeDefined();
    });

    it('correct login users', async () => {
      const response = await request(url).post('/').send(correcttLoginQuery);

      expect(response.body.errors).toBeUndefined();
      
      expect(response.body?.data?.login?.username).toBe('testuser');

      expect(response.body?.data?.login?.email).toBe('fake@email.com');

      expect(response.body?.data?.login?.token).toBeDefined();

      expect(response.body?.data?.login?.createdAt).toBeDefined();
    });

    it('wrong credentials on login', async () => {
      const response = await request(url).post('/').send(incorrectLoginQuery);

      expect(response.body?.data?.login?.username).toBeUndefined();

      expect(response.body.errors[0].message).toBe('Pasword incorrect');

    });


    it('can delete user', async () => {
      const response = await request(url).post('/').send(removeUserQuery);

      expect(response.body.errors).toBeUndefined();

      expect(response.body?.data?.deleteUser?.username).toBe('testuser');
    });

    it('can handle non-existing users', async () => {
      // send request to the url of the test server
      const response = await request(url).post('/').send(queryNonExisitngUsers);
  
      expect(response.body?.data?.getUser?.username).toBeUndefined();

      expect(response.body?.errors[0]?.message).toBe('User not found')
    });

  });