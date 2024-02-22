import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export async function connect() {
	// Client connection
	const connection = await mysql.createConnection({
		host: `127.0.0.1`,
		user: 'root', 
		password: 'BlaBlaWord147', 
		database: 'test_chat_01' 
	});
	
	const db = drizzle(connection);

	return db
}

 
// import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";

// const connection = await mysql.createConnection({
//   host: "host",
//   user: "user",
//   database: "database",
//   ...
// });

// const db = drizzle(connection);


// import { drizzle } from 'drizzle-orm/node-postgres'
// import { Pool } from 'pg'
// import * as dotenv from 'dotenv'
// dotenv.config()

// export async function connect() {
//   const DB_URL = process.env.DATABASE_URL
//   try {
//     if (!DB_URL) throw new Error('database connection data missing')

//     const pool = new Pool({
//       connectionString: DB_URL,
//       ssl: true,
//     })

//     const dbs = drizzle(pool, { logger: true })

//     return dbs
//   } catch (error) {
//     console.log('drizzle-orm connect error \n', error)
//     throw error
//   }
// }
// export default connect