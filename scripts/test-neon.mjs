import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
}

try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 AS connected`;
    console.log('Neon connection successful:', result[0].connected === 1);
} catch (error) {
    console.error('Neon connection failed. Check your database configuration.');
    console.error(error.message);
    process.exit(1);
}
