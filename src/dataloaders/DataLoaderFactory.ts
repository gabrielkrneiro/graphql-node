import * as DataLoader from 'dataloader';

import { DbConnection } from "../interfaces/DBConnectionInterface";
import { DataLoaders } from "../interfaces/DataLoadersInterface";
import { UserInstance } from '../models/UserModel';
import { UserLoader } from './UserLoader';
import { PostInstance } from '../models/PostModel';
import { PostLoader } from './PostLoader';

export class DataLoaderFactory {

    constructor(
        private db: DbConnection
    ) { }

    getLoaders(): DataLoaders {

        return {
            userLoader: new DataLoader<number, UserInstance>(

                // it will spread IDs array and fetch in batch all registers that match with each id in array
                (ids: number[]) => UserLoader.batchUsers(this.db.User, ids) // userLoader implementing itself
            ),
            postLoader: new DataLoader<number, PostInstance>(
                (ids: number[]) => PostLoader.batchPosts(this.db.Post, ids) // userLoader implementing itself
            )
        }
    }
}