import { db, chai, expect, handleError, app } from '../../test-utils';
import * as gql from 'graphql-tools';
import { UserInstance, UserAttributes } from '../../../src/models/UserModel';

// const userTest: UserAttributes = {
//     name: "gabriel",
//     email: "gabrielcarneirocef@gmail.com",
//     password: "senha123"
// }

describe('User', () => {

    let userId: number;

    beforeEach(() => {

        return db.Comment.destroy({ where: {} })
            .then(() => db.Post.destroy({ where: {} }))
            .then(() => db.User.destroy({ where: {} }))
            .then(() => db.User.bulkCreate([
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
            ]))
            .then((users: UserInstance[]) => {
                
                userId = users[0].get('id');
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
                        .post('/graphql')
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
                        .post('/graphql')
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
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys(['name', 'email']);
                            expect(singleUser).not.to.have.keys(['id', 'createdAt', 'updatedAt', 'posts'])
                            expect(singleUser.name).to.equal('gabriel');
                            expect(singleUser.email).to.equal('gabriel@gmail.com');
                        }).catch(handleError);

                });
            });
        });
    });

});