import { postMutations } from "./resources/post/post.schema";
import { userMutations } from "./resources/user/user.schema";
import { commentMutations } from "./resources/comment/comment.schema";

const Mutation = `
    type Mutation {
        ${postMutations}
        ${userMutations}
        ${commentMutations}
    }
`;

export {
    Mutation
}