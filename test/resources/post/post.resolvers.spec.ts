import * as jwt from 'jsonwebtoken';

import { chai, db, app, expect, handleError } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { PostInstance } from '../../../src/models/PostModel';
import { JWT_SECRET } from '../../../src/utils';

const ENDPOINT = '/graphql';

describe('Post', () => {

    let token: string;
    let userId: number;
    let postId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.create(
                {
                    name: 'Rocket',
                    email: 'rocket@guardians.com',
                    password: '1234'
                }
            )).then((user: UserInstance) => {

                userId = user.get('id');
                const payload = { sub: userId };
                token = jwt.sign(payload, JWT_SECRET);

                return db.Post.bulkCreate([
                    {
                        title: 'First post',
                        content: 'First post',
                        author: userId,
                        photo: "some_photo"
                    },
                    {
                        title: 'Second post',
                        content: 'Second post',
                        author: userId,
                        photo: 'some_photo'
                    },
                    {
                        title: 'Third post',
                        content: 'Third post',
                        author: userId,
                        photo: 'some_photo'
                    }
                ]);
            }).then((posts: PostInstance[]) => {

                console.log(`DEBUG_1: `, );

                postId = posts[0].get('id');

                console.log(`DEBUG_2: `,postId);
                console.log(`DEBUG_3: `,!!chai, !!db, !!app, !!expect, !!handleError);
 

            });
    });

    describe('Queries', () => {

        describe('application/json', () => {

            describe('posts', () => {

                it('should return a list of Posts', () => {


                    console.log(`DEBUG_5: `,postId);

                    let body = {
                        query: `
                            query {
                                posts {
                                    id
                                    title
                                    
                                }
                            }
                        `
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {

                            console.log("DEBUG_", res.body);
                            const postsList = res.body.data.posts;

                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array');
                            expect(postsList[0].title).to.equal('First post');
                        }).catch(handleError);

                });

            });

        }); 

    });

});