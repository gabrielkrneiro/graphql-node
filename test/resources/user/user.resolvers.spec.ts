import * as jwt from 'jsonwebtoken';

import { db, chai, expect, handleError, app } from '../../test-utils';
import { UserInstance, UserAttributes } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils';

const ENDPOINT = '/graphql';

interface MockInterface {
    name: string;
    email: string;
    password: string;
    photo?: string;
}

const MOCKS: MockInterface[] = [
    {
        name: "gabriel",
        email: "gabriel@gmail.com",
        password: "senha123"
    },
    {
        name: "keila",
        email: "keila@gmail.com",
        password: "senha123"
    }
];


describe('User', () => {

    let token: string;
    let userId: number;

    beforeEach(() => {

        return db.Comment.destroy({ where: {} })
            .then(() => db.Post.destroy({ where: {} }))
            .then(() => db.User.destroy({ where: {} }))
            .then(() => db.User.bulkCreate(MOCKS))
            .then((users: UserInstance[]) => {
                
                userId = users[0].get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, JWT_SECRET);
            });
    });

    describe('Queries', () => {

        describe('application/json', () => {

            describe('users', () => {

                it('should return a list of users', () => {

                    let body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    }

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                const usersList = res.body.data.users;
                                expect(res.body.data).to.be.an('object'); // testing if response is an object
                                expect(usersList).to.be.an('array');
                                expect(usersList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']);
                                expect(usersList[0]).to.have.keys(['name', 'email']);
                        }).catch(handleError);
                });

                it('should paginate a list of users', () => {

                    let body = {
                        query: `
                            query getUsersList($first: Int, $offset: Int){
                                users(first: $first, offset: $offset){
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            first: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                const usersList = res.body.data.users;
                                expect(res.body.data).to.be.an('object');
                                expect(usersList).to.be.an('array');
                                expect(usersList[0]).to.not.have.keys(['id', 'photo', 'updatedAt', 'posts']);
                                expect(usersList[0]).to.have.keys(['name', 'email', 'createdAt']); 
                            }
                        ).catch(handleError);

                });
            });

            describe('user', () => {

                it('should return a single User', () => {
                    
                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys(['name', 'email']);
                            expect(singleUser).not.to.have.keys(['id', 'createdAt', 'updatedAt', 'posts'])
                            expect(singleUser.name).to.equal(MOCKS[0].name);
                            expect(singleUser.email).to.equal(MOCKS[0].email);
                        }).catch(handleError);

                });

                it('should return only \'name\' attribute', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                const singleUser: UserAttributes = res.body.data.user;
                                expect(res.body.data).to.be.an('object');
                                expect(singleUser).to.be.an('object');
                                expect(singleUser).to.have.key('name');
                                expect(singleUser.name).to.equal(MOCKS[0].name);
                                expect(singleUser.email).to.be.undefined;
                            }
                        )

                });

                it('should return an error if user do not exists', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            id: -1
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                expect(res.body.data.user).to.be.null;
                                expect(res.body.errors).to.be.an('array');
                                expect(res.body).to.have.keys(['data', 'errors']);
                                expect(res.body.errors[0].message).to.equal('Error: User with id -1 not found');
                            }
                        ).catch(handleError);
                });
            });
        });
    });


    describe('Mutations', () => {

        describe('application/json', () => {

            describe('createUser', () => {

                it('should create a new user', () => {

                    const input: MockInterface = {
                        name: "leonardo",
                        email: "leonardo@gmail.com",
                        password: "senha123"
                    }; // first occurrence in MOCKS array

                    let body = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: "leonardo",
                                email: "leonardo@gmail.com",
                                password:"senha123"
                            }
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                const createdUser = res.body.data.createUser;

                                expect(res.body.data).to.be.an('object');
                                expect(createdUser).to.be.an('object');
                                expect(parseInt(createdUser.id)).to.be.an('number');
                                expect(createdUser.name).to.equal(input.name);
                                expect(createdUser.email).to.equal(input.email);
                            }
                        )
                });

                it('should update and existing user', () => {

                    let body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'gabriel carneiro',
                                email: 'gabriel@gmail.com',
                                photo: 'some_photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .set('Authorization', `Bearer ${ token }`)
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                const updatedUser: MockInterface = res.body.data.updateUser;

                                expect(updatedUser).to.be.an('object');
                                expect(updatedUser.name).to.equal('gabriel carneiro');
                                expect(updatedUser.email).to.equal('gabriel@gmail.com');
                                expect(updatedUser.photo).to.not.be.null;
                            }
                        ).catch(handleError);
                });

                it('should block if token is invalid', () => {

                    let body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'gabriel carneiro',
                                email: 'gabriel@gmail.com',
                                photo: 'some_photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .set('Authorization', `Bearer INVALID TOKEN`)
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                expect(res.body.data.updateUser).to.be.null;
                                expect(res.body).to.have.keys(['data', 'errors']);
                                expect(res.body).to.be.an('object');
                                expect(res.body.errors[0].message).to.equal('JsonWebTokenError: jwt malformed');
                            }
                        ).catch(handleError);
                });

            });

            describe('updateUserPassword', () => {

                it('should update password', () => {

                    let body = {
                        query: `
                            mutation updateUserPassword($input: UserUpdatePasswordInput!) {
                                updateUserPassword(input: $input)
                            }
                        `,
                        variables: {
                            input: {
                                password: "123123"
                            }
                        }
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .set('Authorization', `Bearer ${ token }`)
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                expect(res.body.data.updateUserPassword).to.be.true;                             
                            }
                        ).catch(handleError);

                });
            });

            describe('deleteUser', () => {

                it('should delete existing user', () => {

                    let body = {
                        query: `
                            mutation {
                                deleteUser
                            }
                        `
                    };

                    return chai.request(app)
                        .post(ENDPOINT)
                        .set('content-type', 'application/json')
                        .set('Authorization', `Bearer ${ token }`)
                        .send(JSON.stringify(body))
                        .then(
                            res => {

                                expect(res.body.data.deleteUser).to.be.true;                             
                            }
                        ).catch(handleError);

                });
            });
        });
    });

});