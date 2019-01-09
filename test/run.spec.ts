import { db } from "./test-utils";

// sync sequelize with mysql
db.sequelize.sync({
    force: true // swipe every table
}).then(() => run())