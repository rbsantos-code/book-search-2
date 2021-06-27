const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })

                return userData;
            }

            throw new AuthenticationError('not logged in!');
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { user, token }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(user);

            return { user, token };
        },
        saveBook: async (parent, { bookInfo }, context) => {
            if (context.user) {
                const updatedBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBook: bookInfo } },
                    { new: true }
                );

                return updatedBook;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBook: { bookId } } },
                    { new: true }
                );

                return updatedBook;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};


module.exports = resolvers;