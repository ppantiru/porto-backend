/*
    This is for demo purposes only and is not actually secure,
    I got bored half way through because the app doesn't actually need a login system
    TODO maybe: validate user token when changing password or deleting users
    not a TODO: a rights system of some kind
    possible TODO: modularize this a more?
*/
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')
const { SECRET_KEY } = require('../../config')
const User = require('../../models/User')

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    },
    SECRET_KEY,
    { expiresIn: '1h'})
}

module.exports = {
    Query: {
        async getUsers(){
            try {
                const users =  await User.find()
                return users
            } catch (err) {
                throw new Error(err)
            }
        },
        async getUser(_, { username }){
            try{
                const user = await User.findOne({username})

                if(!user){
                    throw new UserInputError('User not found')
                }

                return user
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation:{
        async register(_,
            {
                registerInput : { username, email, password, confirmPassword }
            }
        ){
            //  Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)
            if(!valid){
                throw new UserInputError('Errors', { errors })
            }
            //  Make sure user doesn't already exist
            const user =  await User.findOne({ username })
            if(user){
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }

            // hash password and creat an auth token
            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                username,
                email,
                password,
                createdAt: new Date().toISOString()
            })

            const res = await newUser.save()
            
            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },
        async login(_, { username, password }){
            const { errors, valid } = validateLoginInput(username, password)
            const user = await User.findOne({username})

            if(!valid){
                throw new UserInputError('Errors', { errors })
            }

            if(!user){
                errors.genral = 'User not found'
                throw new UserInputError('User not found', { errors })
            }

            const match = await bcrypt.compare(password, user.password)
            if(!match){
                errors.genral = 'Wrong credentials'
                throw new UserInputError('Pasword incorrect', { errors })
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },

        async changePassword(_, 
            {
                changePasswordInput : { username, newpassword }
            })
            {
            const { errors, valid } = validateLoginInput(username, newpassword)
            const user = await User.findOne({ username })

            if(!user){
                errors.genral = 'User not found'
                throw new UserInputError('User not found', { errors })
            }
 
            if(!valid){
                throw new UserInputError('Errors', { errors })
            }
            
            const password = await bcrypt.hash(newpassword, 12)

            const updatedUser = await User.updateOne({ username },{
                password: password
            });

            return {
                id: updatedUser._id,
                username
            }
        },

        async deleteUser(_, { username }){
            const user = await User.findOne({ username })

            if(!user){
                errors.genral = 'User not found'
                throw new UserInputError('User not found', { errors })
            }

            await User.deleteOne({ username })

            return {
                ...user.doc,
                id: user._id,
                username
            }
        }

    }
}