const { gql } = require('apollo-server');

module.exports =  gql`
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }
    input registerInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    input changePasswordInput{
        username: String!
        newpassword: String!
    }
    #Mutations
    type Mutation{
        register(registerInput: registerInput): User!
        changePassword(changePasswordInput: changePasswordInput): User!
        login(username: String!, password: String!): User!
        deleteUser(username: String!): User!
    }

    #Queries
    type Query {
        getUsers: [User]
        getUser(username: String!): User!
    }
`