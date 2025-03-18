const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");



const app = express();
const PORT = 3306;
app.use(cors());

// MySQL Connection Setup
const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "u960367310_bvcrtest",
    password: "Bvcr@test1", // Replace with your MySQL password
    database: "u960367310_bvcrtest"

});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
    console.log("✅ Connected to MySQL Database");
});

// Function to get all semester tables dynamically
const getAllSemesterTables = async () => {
    return new Promise((resolve, reject) => {
        db.query("SHOW TABLES LIKE 'results_%'", (err, results) => {
            if (err) reject(err);
            resolve(results.map(row => Object.values(row)[0]));
        });
    });
};

// API Endpoint to fetch results for a specific Htno
app.get("/api/results/:htno", async (req, res) => {
    try {
        const htno = req.params.htno;
        const semesterTables = await getAllSemesterTables();
        let studentResults = {};

        for (let table of semesterTables) {
            const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE Htno = ?`, [htno]);
            if (rows.length > 0) {
                studentResults[table] = rows;
            }
        }

        // console.log(`🔹 Results for Htno ${htno}:`, JSON.stringify(studentResults, null, 4));
        res.json(studentResults);
    } catch (error) {
        console.error("❌ Error fetching results:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
