import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
})

console.log('Testing direct PG connection...')

pool.connect()
    .then(client => {
        console.log('✅ Connected successfully to PostgreSQL!')
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('✅ Query result:', res.rows[0])
                client.release()
                pool.end()
            })
            .catch(err => {
                console.error('❌ Query failed:', err)
                client.release()
                pool.end()
            })
    })
    .catch(err => {
        console.error('❌ Connection failed:', err)
        pool.end()
    })
