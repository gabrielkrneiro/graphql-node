import * as DataLoader from 'dataloader';
import { UserInstance } from '../models/UserModel';
import { PostInstance } from '../models/PostModel';
import { DataLoaderParam } from './DataLoarderParamInterface';

/**
 *  Data loader are used to optimize data fetching in 1-N relationships
 */
export interface DataLoaders {

    userLoader: DataLoader<DataLoaderParam<number>, UserInstance>;
    postLoader: DataLoader<DataLoaderParam<number>, PostInstance>;

    // userLoader: DataLoader<number, UserInstance>; // <requested data -> id: number, return data -> user: UserInstance>
    // postLoader: DataLoader<number, PostInstance>; // <requested data -> id: number, return data -> post: PostInstance>
}