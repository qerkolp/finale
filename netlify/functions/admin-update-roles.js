const { Client } = require('pg');
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const data = JSON.parse(event.body);

    // data.newRoles je teď pole, např. ['admin', 'web developer']

    if (data.newRoles.length > 2) {
        return { statusCode: 400, body: JSON.stringify({ error: "Maximálně 2 role!" }) };
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        // 1. Ověření admina (musí mít jednu z high-rank rolí)
        const checkAdmin = await client.query("SELECT roles FROM users WHERE username = $1 AND password = $2", [data.adminUsername, data.adminPassword]);
        if (checkAdmin.rows.length === 0) { await client.end(); return { statusCode: 403, body: JSON.stringify({ error: "Nemáš právo." }) }; }

        const adminRoles = checkAdmin.rows[0].roles;
        const allowedRoles = ['founder', 'co-founder', 'head manager', 'manager', 'head dev', 'developer'];
        // Zkontroluje, jestli admin má aspoň jednu povolenou roli
        const hasPermission = adminRoles.some(r => allowedRoles.includes(r));

        if (!hasPermission) { await client.end(); return { statusCode: 403, body: JSON.stringify({ error: "Nízký rank." }) }; }

        // 2. Update rolí (vkládáme pole)
        await client.query("UPDATE users SET roles = $1 WHERE username = $2", [data.newRoles, data.targetUsername]);

        await client.end();
        return { statusCode: 200, body: JSON.stringify({ message: "Role upraveny!" }) };
    } catch (error) { await client.end(); return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};