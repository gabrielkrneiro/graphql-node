import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { Models } from "sequelize";
import { CommentModel } from "../models/CommentModel";

/**
 *  barrel dos models usados pela aplicacao
 */
export interface ModelsInterface extends Models {

    Comment: CommentModel;
    User: UserModel;
    Post: PostModel;
}