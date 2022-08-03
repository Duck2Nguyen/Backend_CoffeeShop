const { conn, sql } = require('../config/database');
const { MAX } = require('mssql/msnodesqlv8');

function route(app) {
  app.get('/', (req, res) => {
    res.render('home');
  });
  app.post('/api/login', async (req, res) => {
    // SELECT * FROM Category
    // --> get all information in Category table

    return res.status(200).json({
      errCode: 0,
      message: 'OK',
      users: {}
    })
  });

  app.get('/collections', async (req, res) => {
    // http://localhost:3000/
    // console.log('sdaghjk')
    var pool = await conn;
    var sqlString = "EXEC getAllProducts";
    return await pool.request().query(sqlString, function (err, data) {
      console.log(err)
      if (data.recordset !== undefined) {
        return res.status(200).json({
          errCode: 0,
          message: 'OK',
          users: data.recordset
        })
      }
    });
  });

  app.get('/collections/:id', async (req, res) => {
    // eg: http://localhost:3000/COFT01P01
    var id = req.params.id;
    // console.log(id)
    var pool = await conn;
    var sqlString = "EXEC getProductByID  '" + id + "'";
    return await pool.request().query(sqlString, function (err, data) {
      // res.send(data.recordset);
      return res.status(200).json({
        errCode: 0,
        message: 'OK',
        data: data.recordset
      })
    });
  });


  app.get('/:id', async (req, res) => {
    // eg: http://localhost:3000/COFT01P01
    var id = req.params.id;
    var pool = await conn;
    var sqlString = "EXEC getProductByID '" + id + "'";
    return await pool.request().query(sqlString, function (err, data) {
      if (data.recordset[0] !== undefined) {
        var rawData = data.recordset[0].image;
        var data = rawData.replace(/^data:image\/png;base64,/, '');
        var img = Buffer.from(data, 'base64');

        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': img.length
        });
        res.end(img);

      } else {
        res.send("No image found");
      }
    });
  });

  app.post('/login', async (req, res) => {
    // http://localhost:3000/login
    var username = req.body.username;
    var password = req.body.password;
    var pool = await conn;
    var sqlString = "EXEC getCustomerLoginInfo @username, @password";
    return await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query(sqlString, function (err, data) {
        if (data.recordset.length !== 0) {
          return res.status(200).json({
            errCode: 0,
            message: 'OK',
            data: data.recordset[0]
          })
        }
        else {
          return res.status(200).json({
            errCode: 1,
            message: 'No data',
            data: data.recordset
          })
        }
      });
  });

  app.post('/register', async (req, res) => {
    // http://localhost:3000/register
    var pool = await conn;
    var sqlString = "EXEC insertNewCustomer @username, @password, @fullname, @address, @phone, @email";
    return await pool.request()
      .input("username", sql.VarChar(30), req.body.username)
      .input("password", sql.VarChar(30), req.body.password)
      .input("fullname", sql.NVarChar(100), req.body.fullname)
      .input("address", sql.NVarChar(150), req.body.address)
      .input("phone", sql.Char(10), req.body.phone)
      .input("email", sql.VarChar(100), req.body.email)
      .query(sqlString, function (err, data) {
        return res.status(200).json({
          errCode: data.recordset[0].errCode,
          message: data.recordset[0].message
        })
      });
  });

  // app.post('/register', async (req, res) => {
  //   // http://localhost:3000/register
  //   var pool = await conn;
  //   var sqlString = "EXEC insertNewCustomer @username, @password, @fullname, @address, @phone, @email";
  //   return await pool.request()
  //     .input("username", sql.VarChar(30), req.body.username)
  //     .input("password", sql.VarChar(30), req.body.password)
  //     .input("fullname", sql.NVarChar(100), req.body.fullname)
  //     .input("address", sql.NVarChar(150), req.body.address)
  //     .input("phone", sql.Char(10), req.body.phone)
  //     .input("email", sql.VarChar(100), req.body.email)
  //     .query(sqlString, function (err, data) {
  //       console.log(err, data)
  //       return res.status(200).json({
  //         errCode: 0,
  //         message: 'OK',
  //         data: req.body
  //       })
  //       // res.json(req.body);
  //     });
  // })

  app.post('/addProduct', async (req, res) => {
    var pool = await conn;
    var sqlString = "EXEC insertNewProduct @categoryID, @name, @description, @image, @quantity, @price";
    return await pool.request()
      .input('categoryID', sql.Char(6), req.body.categoryID)
      .input('name', sql.NVarChar(50), req.body.name)
      .input('description', sql.NVarChar(MAX), req.body.description)
      .input('image', sql.VarChar(MAX), req.body.image)
      .input('quantity', sql.Int, req.body.quantity)
      .input('price', sql.Decimal(10, 2), req.body.price)
      .query(sqlString, function (err, data) {
        res.json(data.recordset[0]);
      })
    // res.redirect('/');
  });

  app.post('/getProductType', async (req, res) => {
    var pool = await conn;
    console.log(req.body.id)
    var sqlString = "EXEC getTypeByCategory @parentID";
    const request = await pool.request()
      .input('parentID', sql.Char(6), req.body.id)
      .query(sqlString, function (err, data) {
        res.json(data.recordset);
      })
  });

  app.post('/addOrder', async (req, res) => {
    var pool = await conn;
    var sqlMakeOrder = "EXEC insertNewOrder @username, @message, @totalPayment, @fullname, @address, @phone, @email";
    var sqlAddData = "EXEC insertNewOrderItem @orderItemID, @orderID, @productID, @quantity, @totalPrice";

    const insertNewOrder = await pool.request()
      .input('username', sql.VarChar(30), req.body.username)
      .input('message', sql.NVarChar(1000), req.body.message)
      .input('totalPayment', sql.Decimal(10, 2), req.body.totalPayment)
      .input('fullname', sql.NVarChar(100), req.body.fullname)
      .input('address', sql.NVarChar(150), req.body.address)
      .input('phone', sql.Char(10), req.body.phone)
      .input('email', sql.VarChar(100), req.body.email)
      .query(sqlMakeOrder);


    let data = req.body.data;
    console.log(data)
    data.map((Data, index) => {
      console.log((parseFloat(Data.price) * parseInt(Data.num)))
      pool.request()
        .input('orderItemID', sql.Int, parseInt(insertNewOrder.recordset[0].baseOrderItemID) + parseInt(Data.cartID))
        .input('orderID', sql.Int, insertNewOrder.recordset[0].orderID)
        .input('productID', sql.Char(9), Data.id)
        .input('quantity', sql.Int, parseInt(Data.num))
        .input('totalPrice', sql.Decimal(10, 2), parseFloat(Data.price) * (parseInt(Data.num)))
        .query(sqlAddData, function (err, data) {
          console.log(err)
          console.log(data)
        });
    });
    return res.status(200).json({
      errCode: '0',
      message: 'OK'
    })
  });

  app.post('/getAllOrder', async (req, res) => {
    var pool = await conn;
    var sqlUpdateOrderStatus = "SELECT orderID, username, orderDate, totalPayment, orderStatus FROM Orders ORDER BY orderID DESC";

    const updateOrderStatus = await pool.request()
      .query(sqlUpdateOrderStatus, function (err, data) {
        console.log(err)
        console.log(data)
        console.log(data.recordset);
        // res.json(data.recordset);
        return res.status(200).json({
          errCode: '0',
          message: 'OK',
          data: data.recordset
        })
      });
  });

  app.post('/manageOrder', async (req, res) => {
    var pool = await conn;
    var sqlUpdateOrderStatus = "EXEC updateOrderStatus @orderID, @status";

    const updateOrderStatus = await pool.request()
      .input('orderID', sql.Int, req.body.orderID)
      .input('status', sql.VarChar(20), req.body.status)
      .query(sqlUpdateOrderStatus, function (err, data) {
        console.log(data.recordset);
        res.json(data.recordset);
      });
  })

  app.post('/changeStatus', async (req, res) => {
    var pool = await conn;
    var sqlUpdateOrderStatus = "EXEC updateOrderStatus @orderID, @status";

    const updateOrderStatus = await pool.request()
      .input('orderID', sql.Int, req.body.orderID)
      .input('status', sql.VarChar(20), req.body.status)
      .query(sqlUpdateOrderStatus, function (err, data) {
        console.log(data.recordset);
        // res.json(data.recordset);
        return res.status(200).json({
          errCode: data.recordset[0].errCode,
          message: data.recordset[0].message
        })
      });
  });

  app.post('/loadProduct', async (req, res) => {
    var pool = await conn;
    var sqlGetProduct = "SELECT productID, categoryID, name, price, quantity FROM Product";

    const getProduct = await pool.request()
      .query(sqlGetProduct, function (err, data) {
        console.log(data.recordset);
        return res.status(200).json({
          errCode: '0',
          message: 'OK',
          data: data.recordset
        })
      });
  });

  app.post('/changeQuantity', async (req, res) => {
    var pool = await conn;
    var sqlUpdateProductQuantity = "EXEC updateProductQuantity @productID, @quantity";

    const updateProductQuantity = await pool.request()
      .input('productID', sql.Char(9), req.body.productID)
      .input('quantity', sql.Int, req.body.quantity)
      .query(sqlUpdateProductQuantity, function (err, data) {
        console.log(data.recordset);
        res.json(data.recordset[0]);
      });
  });

  app.post('/loadUserOrders', async (req, res) => {
    var pool = await conn;
    var sqlGetOrders = "SELECT orderID, orderFullname, orderDate, totalPayment, orderStatus FROM Orders WHERE username = @username ORDER BY orderID DESC";

    const getOrders = await pool.request()
      .input('username', sql.VarChar(30), req.body.username)
      .query(sqlGetOrders, function (err, data) {
        // console.log(data.recordset);
        // res.json(data.recordset);
        return res.status(200).json({
          errCode: '0',
          message: 'OK',
          data: data.recordset
        })
      });
  });

  app.post('/loadOrderDetail/:orderID', async (req, res) => {
    var pool = await conn;
    let orderID = req.params.orderID;

    var sqlGetOrderDetail = "EXEC getOrderItems @orderID";
    const getOrderDetail = await pool.request()
      .input('orderID', sql.Int, orderID)
      .query(sqlGetOrderDetail, function (err, data) {
        // console.log(data.recordset);
        res.json(data.recordset);
      });
  });

  app.post('/addReview', async (req, res) => {
    var pool = await conn;
    var sqlAddNewReview = "EXEC insertNewReview @orderItemID, @username, @comment, @rating";
    // console.log(req.body.orderItemID)
    // console.log(req.body.username)
    // console.log(req.body.comment)
    // console.log(req.body.rating)
    const addNewReview = await pool.request()
      .input('orderItemID', sql.Int, req.body.orderItemID)
      .input('username', sql.VarChar(30), req.body.username)
      .input('comment', sql.VarChar(1000), req.body.comment)
      .input('rating', sql.TinyInt, req.body.rating)
      .query(sqlAddNewReview, function (err, data) {
        console.log(data.recordset);
        res.json(data.recordset[0]);
      });
  });

  app.post('/getProductReviews', async (req, res) => {
    var pool = await conn;
    var sqlGetProductReviews = "EXEC getProductReviews @productID";
    console.log(req.body.productID)
    const getProductReviews = await pool.request()
      .input('productID', sql.Char(9), req.body.productID)
      .query(sqlGetProductReviews, function (err, data) {
        console.log(err)
        console.log(data.recordset);
        res.json(data.recordset);
      });
  });

  app.post('/getAllSortedProduct', async (req, res) => {
    var pool = await conn;
    var sqlGetProduct = "EXEC getAllSortedProducts @sortBy";

    const getProduct = await pool.request()
      .input('sortBy', sql.VarChar(30), req.body.sortBy)
      .query(sqlGetProduct, function (err, data) {
        console.log(err)
        // console.log(data.recordset);
        res.json(data.recordset);
      });
  });

}



module.exports = route;