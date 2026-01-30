const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const data = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  // Webhook pro nové žádosti
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1466608052429131877/kENrrrgopN_91XmNk6qyiOjagRnW3t7vz9qOTtQfxuh0hehH5XSEd-QP-36UFze_KuxM";

  try {
    await client.connect();
    
    // 1. Uložit do DB
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

    // 2. Poslat Webhook na Discord (Bez externích knihoven)
    if(WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{
                    title: "📝 Nová Žádost o Whitelist",
                    color: 3066993, // Modrá
                    fields: [
                        { name: "Uživatel", value: data.discord, inline: true },
                        { name: "Věk", value: data.age_ooc, inline: true },
                        { name: "Zkušenosti", value: data.experience, inline: true },
                        { name: "Motivace", value: data.why_us.substring(0, 1000) }
                    ],
                    footer: { text: "Odesláno z Webu City of Prague" },
                    timestamp: new Date().toISOString()
                }]
            })
        }).catch(err => console.error("Webhook error:", err));
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Uloženo!" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
