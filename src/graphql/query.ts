import { postQueries } from './resources/post/post.schema';
import { userQueries } from './resources/user/user.schema';
import { commentQuerys } from './resources/comment/comment.schema';

const Query = `
    type Query {
        ${postQueries}
        ${userQueries}
        ${commentQuerys}
    }
`;

export {
    Query
};