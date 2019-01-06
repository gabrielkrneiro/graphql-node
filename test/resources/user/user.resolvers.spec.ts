import { db, chai, expect, handleError, app } from '../../test-utils';

// const userTest: UserAttributes = {
//     name: "gabriel",
//     email: "gabrielcarneirocef@gmail.com",
//     password: "senha123"
// }

describe('User', () => {

    beforeEach(() => {

        return db.Comment.destroy({ where: {} })
            .then(() => db.Post.destroy({ where: {} }))
            .then(() => db.User.destroy({ where: {} }))
            .then(() => db.User.create({
                name: "gabriel",
                email: "gabrielcarneirocef@gmail.com",
                password: "senha123"
            }))
    })

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
                                const userList = res.body.data.users;
                                expect(res.body.data).to.be.an('object'); // testing if response is an object
                                expect(userList).to.be.an('array').of.length(1);
                                expect(userList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']);
                                expect(userList[0]).to.have.keys(['name', 'email']);
                            }
                        )
                        .catch(handleError);
                });
            });
        });
    });

});