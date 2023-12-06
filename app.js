const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const cors=require("cors")

const app = express();
app.use(express.json());
app.use(cors({origin:true,credentials:true}));
module.exports = app;

const dbPath = path.join(__dirname, "details.db");

let db = null;

const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Server Running Successfully at http://localhost:4000");
    });
  } catch (e) {
    console.log(`Error ${e}`);
    process.exit(1);
  }
};

initializeServer();

//API 1
app.get("/transactions/", async (request, response) => {
  const { name= "", pages = 1, month= 3 } = request.query;

  console.log(month);

  const limit = 10;
  const offset = parseInt(pages) * 10 - 10;

  const transactionRequest = `
        SELECT * 
        FROM transactions 
        WHERE (CAST(strftime("%m", dateofsale) as INT)=${month}) AND (price LIKE '${name}%'
        OR descriptions LIKE '%${name}%' OR title LIKE '%${name}%')
        LIMIT ${limit}
        OFFSET ${offset}
        `;

  const allTransaction = await db.all(transactionRequest);
  console.log(allTransaction);
  response.send({ allTransaction });
});

//API 2
app.get("/transactions/sales/", async (request, response) => {
  const { month=3 } = request.query;

  const salesRequest = `
  SELECT SUM(price) as total_price
  FROM transactions 
  WHERE CAST(strftime("%m", dateofsale) as INT)='${month}'`;
  const totalSales = await db.get(salesRequest);

  const soldRequest = `
  SELECT COUNT() as total_sold_items
  FROM transactions 
  WHERE sold = true AND 
  CAST(strftime("%m", dateofsale) as INT)='${month}'`;
  const totalSold = await db.get(soldRequest);

  const notSoldRequest = `
  SELECT COUNT() as total_not_sold_items
  FROM transactions 
  WHERE sold = false AND 
  CAST(strftime("%m", dateofsale) as INT)='${month}'`;
  const totalNotSold = await db.get(notSoldRequest);

  console.log(totalNotSold);
  console.log(totalSold);
  console.log(totalSales);
  response.send({ totalSales, totalSold, totalNotSold });
});

//API 3
app.get("/transactions/barChart/", async (request, response) => {
  const { month=3 } = request.query;
  const barChartRequest = `
        SELECT
            COUNT() as total_items,
            CASE
                WHEN price >= 0
                AND price < 100 THEN '0-100'
                WHEN price >= 101
                AND price < 200 THEN '101-200'
                WHEN price >= 201
                AND price < 300 THEN '201-300'
                WHEN price >= 301
                AND price < 400 THEN '301-400'
                WHEN price >= 401
                AND price < 500 THEN '401-500'
                WHEN price >= 501
                AND price < 600 THEN '501-600'
                WHEN price >= 601
                AND price < 700 THEN '601-700'
                WHEN price >= 701
                AND price < 800 THEN '701-800'
                WHEN price >= 801
                AND price < 900 THEN '801-900'
                Else '900 and above'
            END AS price_range
        FROM transactions
        WHERE CAST(strftime("%m", dateofsale) as INT)='${month}'
        GROUP BY price_range;`;
  const barChartData = await db.all(barChartRequest);
  response.send({ barChartData });
});

//API 4
app.get("/transactions/pieChart/", async (request, response) => {
  const { month=3 } = request.query;
  const pieChartRequest = `
  SELECT DISTINCT category,
  COUNT() as total_items
  FROM transactions 
  WHERE CAST(strftime("%m", dateofsale) as INT)='${month}'
  GROUP BY category;`;
  const pieChartData = await db.all(pieChartRequest);
  response.send({ pieChartData });
});

//API 5
app.get("/transactions/total/", async (request, response) => {
  const { month=3 } = request.query;

  const limit = 10;
  const offset = 0;

  const transactionRequest = `
        SELECT * 
        FROM transactions 
        WHERE CAST(strftime("%m", dateofsale) as INT)=${month}
        
        LIMIT ${limit}
        OFFSET ${offset}
        `;

  const allTransaction = await db.all(transactionRequest);

  const salesRequest = `
  SELECT SUM(price) as total_price
  FROM transactions 
  WHERE CAST(strftime("%m", dateofsale) as INT)='${month}'`;
  const totalSales = await db.get(salesRequest);

  const soldRequest = `
  SELECT COUNT() as total_sold_items
  FROM transactions 
  WHERE sold = true AND 
  CAST(strftime("%m", dateofsale) as INT)='${month}'`;
  const totalSold = await db.get(soldRequest);

  const notSoldRequest = `
  SELECT COUNT() as total_not_sold_items
  FROM transactions 
  WHERE sold = false AND 
  CAST(strftime("%m", dateofsale) as INT)='${month}'`;
  const totalNotSold = await db.get(notSoldRequest);

  const barChartRequest = `
        SELECT
            COUNT() as total_items,
            CASE
                WHEN price >= 0
                AND price < 100 THEN '0-100'
                WHEN price >= 101
                AND price < 200 THEN '101-200'
                WHEN price >= 201
                AND price < 300 THEN '201-300'
                WHEN price >= 301
                AND price < 400 THEN '301-400'
                WHEN price >= 401
                AND price < 500 THEN '401-500'
                WHEN price >= 501
                AND price < 600 THEN '501-600'
                WHEN price >= 601
                AND price < 700 THEN '601-700'
                WHEN price >= 701
                AND price < 800 THEN '701-800'
                WHEN price >= 801
                AND price < 900 THEN '801-900'
                Else '900 and above'
            END AS price_range
        FROM transactions
        WHERE CAST(strftime("%m", dateofsale) as INT)='${month}'
        GROUP BY price_range;`;
  const barChartData = await db.all(barChartRequest);

  const pieChartRequest = `
  SELECT DISTINCT category,
  COUNT() as total_items
  FROM transactions 
  WHERE CAST(strftime("%m", dateofsale) as INT)='${month}'
  GROUP BY category;`;
  const pieChartData = await db.all(pieChartRequest);
  response.send({
    allTransaction,
    totalNotSold,
    totalSold,
    totalSales,
    pieChartData,
    barChartData,
  });
  console.log(
    pieChartData,
    barChartData,
    totalNotSold,
    totalSold,
    totalSales,
    allTransaction
  );
});


