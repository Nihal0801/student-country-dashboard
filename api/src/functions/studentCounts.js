const { app } = require("@azure/functions");
const sql = require("mssql");

app.http("studentCounts", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "student-counts",

  handler: async (request, context) => {
    let pool;

    try {
      const config = {
        server: process.env.SQL_SERVER,
        database: process.env.SQL_DATABASE,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,

        options: {
          encrypt: true,
          trustServerCertificate: false
        }
      };

      pool = await sql.connect(config);

      const result = await pool.request().query(`
        SELECT Country, StudentCount
        FROM dbo.StudentCountByCountry
        ORDER BY StudentCount DESC, Country ASC;
      `);

      return {
        status: 200,
        jsonBody: result.recordset
      };

    } catch (error) {
      context.error("Database error:", error);

      return {
        status: 500,
        jsonBody: {
          error: "Unable to retrieve student data."
        }
      };

    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }
});
