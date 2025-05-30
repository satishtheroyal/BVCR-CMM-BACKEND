// const express = require("express");
// const mysql = require("mysql2");
// const cors = require("cors");



// const app = express();
// const PORT = 3306;
// app.use(cors());

// // MySQL Connection Setup
// const db = mysql.createConnection({
//    host: "bgm7jxnphln37k59nkm6-mysql.services.clever-cloud.com",
//    user: "upkjig35c7ilk769",
//    password: "n4LYA8dlrGjZ6DxtrNnZ",  // Replace with your MySQL password
//    database: "bgm7jxnphln37k59nkm6"
// });

// db.connect(err => {
//     if (err) {
//         console.error("❌ Database connection failed:", err);
//         process.exit(1);
//     }
//     console.log("✅ Connected to MySQL Database");
// });

// // Function to get all semester tables dynamically
// const getAllSemesterTables = async () => {
//     return new Promise((resolve, reject) => {
//         db.query("SHOW TABLES LIKE 'results_%'", (err, results) => {
//             if (err) reject(err);
//             resolve(results.map(row => Object.values(row)[0]));
//         });
//     });
// };

// // API Endpoint to fetch results for a specific Htno
// app.get("/api/results/:htno", async (req, res) => {
//     try {
//         const htno = req.params.htno;
//         const semesterTables = await getAllSemesterTables();
//         let studentResults = {};

//         for (let table of semesterTables) {
//             const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE Htno = ?`, [htno]);
//             if (rows.length > 0) {
//                 studentResults[table] = rows;
//             }
//         }

//         // console.log(`🔹 Results for Htno ${htno}:`, JSON.stringify(studentResults, null, 4));
//         res.json(studentResults);
//     } catch (error) {
//         console.error("❌ Error fetching results:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on bgm7jxnphln37k59nkm6-mysql.services.clever-cloud.com:${PORT}`);
// });


const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = 4200;
app.use(cors());

// MongoDB Atlas Connection Setup
const uri = "mongodb+srv://msnmcabvcr:voCQoEdZMLtgoUBE@bvcr.10u2nzc.mongodb.net/?retryWrites=true&w=majority&appName=BVCR"; // Replace with your MongoDB Atlas connection string
const client = new MongoClient(uri, {});

const dbName = "Results";

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
}
connectDB();

// Function to get all semester collections dynamically
// const getAllSemesterCollections = async () => {
//     const db = client.db(dbName);
//     const collections = await db.listCollections().toArray();
//     console.log(collections);
    
//     return collections.map(col => col.name).filter(name => name.startsWith("results_"));
// };
const getAllSemesterCollections = async () => {
    try {
        const db = client.db(dbName);
        const collections = await db.listCollections({ name: /^results_\d+_\d+$/ }).toArray();

        return collections
            .map(col => col.name)
            .sort((a, b) => {
                // Extract numbers from "results_X_Y"
                const [_, a1, a2] = a.match(/results_(\d+)_(\d+)/).map(Number);
                const [__, b1, b2] = b.match(/results_(\d+)_(\d+)/).map(Number);

                // First sort by the first number (semester), then by the second number (part)
                return a1 - b1 || a2 - b2;
            });
    } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
    }
};

//API Endpoint to fetch results for a specific Htno
// app.get("/api/results/:htno", async (req, res) => {
//     try {
//         const htno = req.params.htno;
//         const db = client.db(dbName);
//         const semesterCollections = await getAllSemesterCollections();
//         let studentResults = {};

//         for (let collection of semesterCollections) {
//             const results = await db.collection(collection).find({ Htno: htno }).toArray();
//             if (results.length > 0) {
//                 studentResults[collection] = results;
//             }
//         }
// console.log(studentResults);

//         res.json(studentResults);
//     } catch (error) {
//         console.error("❌ Error fetching results:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

app.get("/api/results/:htno", async (req, res) => {
      
    try {
        const htno = req.params.htno;
        const db = client.db(dbName);
        const semesterCollections = await getAllSemesterCollections();
        let studentResults = {}; 
console.log(semesterCollections);

        for (let collection of semesterCollections) {
            const results = await db.collection(collection).find({ Htno: htno }).toArray();
            //console.log(results);
            
            if (results.length > 0) {
                // Extracting semester and year from collection name (e.g., "results_1_1" -> Semester 1, Year 1)
                const parts = collection.split("_"); 
                const year = parts[1]; 
                const semester = parts[2];

                const semesterKey = `Year ${year} - Semester ${semester}`;
                
                if (!studentResults[semesterKey]) {
                    studentResults[semesterKey] = [];
                }
                studentResults[semesterKey].push(...results);
            }
        }

//console.log(studentResults);

        res.json(studentResults);
    } catch (error) {
        console.error("❌ Error fetching results:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Start the server

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
