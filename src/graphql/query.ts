import { postQueries } from './resources/post/post.schema';
import { userQueries } from './resources/user/user.schema';

const Query = `
    type Query {
        ${postQueries}
        ${userQueries}
    }
`;

export {
    Query
};