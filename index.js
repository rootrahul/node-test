const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express()
const port = 3000;

const db = mysql.createConnection({
  host: 'nodejs-technical-test.cm30rlobuoic.ap-southeast-1.rds.amazonaws.com',
  user: 'admin',
  password: 'NoTeDeSt^C10.6?SxwY882}',
  database: 'conqtvms_dev',
  port: 3306
})

db.connect((error) => {
  if (error) {
    throw error;
  }
  console.log("connected to mysql db.")
})

app.use(bodyParser.json());

app.get('/api/products', (req, res) => {
  console.log("query", req.body)

  const { currentPage, pageSize, orderBy, orderDir, searchBy, searchFields } = req.body

  const offset = (currentPage - 1) * pageSize

  let sql = `SELECT * FROM ProductV2`

  if (searchBy && searchFields.length > 0) {
    const searchCondtions = searchFields.map((item) => `${item} LIKE '%${searchBy}%`).join(' OR ')
    sql += ` WHERE ${searchCondtions}`;
  }

  
  sql += ` ORDER BY ${orderBy} ${orderDir} LIMIT ${pageSize} OFFSET ${offset}`
  
  console.log("sql", sql)

  db.query(sql, (error, results) => {

    console.log("inside first query", error)
    console.log("inside first query results", results)

    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
      return
    }

    db.query(`SELECT COUNT(*) AS totalCount FROM ProductV2`, (error, totalCountResult) => {
      console.log("inside second query")

      if (error) {
        res.status(500).json({ error: "Internal Server Error" });
        return 
      }

      console.log("totalCountResult", totalCountResult)

      const totalCount = totalCountResult[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);

      console.log("results", results)

      res.json({
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        data: results
      })
    })
  })

  res.send("hello")

})

app.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})