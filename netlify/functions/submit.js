const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const data = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    const query = `
      INSERT INTO applications 
      (discord, age_ooc, experience, why_us, rp_plans, def_mg, def_rp, def_failrp, def_ck, def_pk, pk_ticket) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    const values = [
      data.discord, data.age_ooc, data.experience,
      data.why_us, data.rp_plans, data.def_mg,
      data.def_rp, data.def_failrp, data.def_ck,
      data.def_pk, data.pk_ticket
    ];

    await client.query(query, values);
    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Uloženo!" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};