import { GraphQLResolveInfo } from "graphql";
import * as graphqlFields from 'graphql-fields';
import { union, difference } from 'lodash';

/**
 *  build AST (Abstract Syntax Tree) to be passed to SELECT fields in sequelize.
 *  Avoid make SELECT to all fields and filter just the ones is required. This way,
 *  just the fields are actually required will being in SELECT sequelize fields.
 */
export class RequestedFields {

    getFields(info: GraphQLResolveInfo, options?: { keep?: string[], exclude?: string[] }): string[] {

        let fields: string[] =  Object.keys(graphqlFields(info));

        if (!options) return fields;

        fields = (options.keep) ? union<string>(fields, options.keep) : fields;

        return (options.exclude) ? difference<string>(fields, options.exclude) : fields;
        
    }
}