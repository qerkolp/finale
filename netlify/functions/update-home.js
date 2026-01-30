const { Client } = require('pg');
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const data = JSON.parse(event.body);
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        // 1. Ověření WEB Developera
        const checkUser = await client.query("SELECT roles FROM users WHERE username = $1 AND password = $2", [data.username, data.password]);
        if (checkUser.rows.length === 0 || !checkUser.rows[0].roles.includes('web developer')) {
            await client.end(); return { statusCode: 403, body: JSON.stringify({ error: "Nejsi WEB Developer." }) };
        }
        // 2. Update obsahu
        await client.query(
            "UPDATE homepage_content SET headline=$1, subtext=$2, body_content=$3, server_status=$4 WHERE id=1",
            [data.headline, data.subtext, data.bodyContent, data.status]
        );
        await client.end();
        return { statusCode: 200, body: JSON.stringify({ message: "Web aktualizován!" }) };
    } catch (error) { await client.end(); return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};