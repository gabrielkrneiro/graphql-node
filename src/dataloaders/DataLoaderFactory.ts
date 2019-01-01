import * as DataLoader from 'dataloader';

import { DbConnection } from "../interfaces/DBConnectionInterface";
import { DataLoaders } from "../interfaces/DataLoadersInterface";
import { UserInstance } from '../models/UserModel';
import { UserLoader } from './UserLoader';
import { PostInstance } from '../models/PostModel';
import { PostLoader } from './PostLoader';
import { RequestedFields } from '../graphql/ast/RequestedFields';
import { DataLoaderParam } from '../interfaces/DataLoarderParamInterface';

export class DataLoaderFactory {

    constructor(
        private db: DbConnection,
        private requestedFields: RequestedFields
    ) { }

    getLoaders(): DataLoaders {

        return {
            userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(

                // it will spread IDs array and fetch in batch all registers that match with each id in array
                (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),  // userLoader implementing itself
                {
                    cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key
                }
            ),
            postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
                (params: DataLoaderParam<number>[]) => PostLoader.batchPosts(this.db.Post, params, this.requestedFields), // userLoader implementing itself
                {
                    cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key
                }
            )
        }
    }
}