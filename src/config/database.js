const sql = require('mssql/msnodesqlv8');

const config = {
    server: "localhost\\DUCK2NGUYEN",
    user: "sa",
    password: "123456",
    database: "coffeeshop",
    driver: "msnodesqlv8"
};

const conn = new sql.ConnectionPool(config).connect().then(pool => {
    return pool;
});

module.exports = {
    conn: conn,
    sql: sql
}