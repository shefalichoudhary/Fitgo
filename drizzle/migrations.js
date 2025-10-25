import journal from './_journal.json'; // this will track applied migrations
import m0000 from './0000_unique_mercury.sql'; // the generated SQL

export default {
  journal,
  migrations: { m0000 },
};