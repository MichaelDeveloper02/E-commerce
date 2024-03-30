const express = require('express');
const path = require('path');
const mysql = require("mysql");
const app = express();

// Middlewares

//This middleware processes the JSON data, allowing reception and processing of JSON data here.
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')));


// global variables

  //routes variables

var getProducts = "/getproducts";
var getProduct = "/getProduct";

var addProduct = "/addproduct";
var addCategory = "/addCategory";
var addUser = "/addUser";
var login = "/login"  

var updateProduct = "/updateProduct"
var updateUser = "/updateUser"

var deleteProduct = "/deleteProduct"
var deleteUser = "/deleteUser"

//setting connection to database

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'ecommerce'
})

// connect to database

connection.connect((error)=>{
  if(error){
    console.error("error al conectar",error)
    return;
  }
  console.log("conexion establecida")
})

// GET ROUTES

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(getProducts,(req,res)=>{
  const getProductsQuery = `SELECT * FROM products`

  connection.query(getProductsQuery, (error,results,fields)=>{
    if(!error){
      console.error("error analyzing the query:", error)
    }
    console.log(results)
    res.json(results)

  })

})

// GET ITEM BY ID

//Change the way that receive the data, become from url to json
app.get("/getProduct/:id",(req,res)=>{
  const productId = req.params.id 
  const queryGetProductByID = 'SELECT * FROM products WHERE id_product = ?';
  connection.query(queryGetProductByID, [productId], (err,results)=>{
      if(err){
        console.error("error analyzing the query", err)
        return res.status(500).send('error analyzing the query');
      }
      if(results.length === 0){
        return res.status(404).send("No article found with that ID")
      }

      const article = results[0];
      res.json(article)
  })

})

// POST ROUTES

app.post(addProduct, (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('No data received in the POST request');
    return res.status(400).send('No data received in the POST request');
  }

  const data = req.body;

  const createProductQuery = `
    INSERT INTO products(name, description, price, stock, image)
    VALUES('${data.name}', '${data.description}', ${data.price}, ${data.stock}, '${data.image}')
  `;

  connection.query(createProductQuery, (err, results, fields) => {
    if (err) {
      console.error("Error analyzing the query:", err);
      return res.status(500).send('Error inserting data into the database');
    }
    
    console.log("Data inserted successfully:", results);
    res.send("Data received and saved successfully");
  });
});


app.post(addCategory,(req,res)=>{
  if(!req.body || Object.keys(req.body) === 0){
    console.log("No data received");
    return res.status(400).send('No data received in the POST request');
  }

  data = req.body

  const createCategoryQuery = `
    INSERT INTO categories( name, description)
    VALUES('${data.name}', '${data.description}')
  `;

  connection.query(createCategoryQuery,(error,results, fields)=>{
    if(error){
      console.error("Error analyzing the query:", error);
      return res.status(500).send('Error inserting data into the database');
    }

    console.log("Data inserted successfully:", results);
    res.send("Data received and saved successfully - categories");
  })

})


app.post(addUser,(req,res)=>{
  console.log("hola")
  if(!req.body || Object.keys(req.body) === 0){
    console.log("No data received");
    return res.status(400).send('No data-user received in the POST request');
  }

  data = req.body;
 

  const createUserQuery = `
    INSERT INTO users( name, last_name, email, password, shipping_address, user_role)
    VALUES('${data.name}', '${data.lastName}','${data.email}','${data.password}','${data.shippingAddress}','${data.userRole}')
  `;

  connection.query(createUserQuery,(error,results, fields)=>{
    if(error){
      console.error("Error analyzing the query:", error);
      return res.status(500).send('Error inserting data-user into the database');
    }

    console.log("Data inserted successfully:", results);
    // res.status(201).send("Data received and saved successfully - user");

    //get user recently added---

    userId = results.insertId;
    console.log(userId)

    // create shopping cart with the ID 

    const creationDate = new Date();
    const formattedCreationDate = creationDate.toISOString().split('T')[0];

    const createShoppingCart = `
      INSERT INTO shopping_carts(id_user,creation_date)
      VALUES('${userId}','${formattedCreationDate}')
    `  

    connection.query(createShoppingCart, (error,results,fields)=>{
      if(error){
        console.error("Error analyzing the query:", error)
        return res.status(500).send('Error creating shopping_cart');
      }
      console.log("Data inserted successfully:", results)

    })
  })

})

app.post(login, (req,res)=>{
  const {username, password} = req.body

  const loginQuery = `
    SELECT * FROM users WHERE name = '${username}'
  `

  connection.query(loginQuery, (err,results,fields)=>{
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).send('Error interno del servidor');
    }

    if (results.length === 0) {
      return res.status(401).send('Nombre de usuario o contraseña incorrectos');
    }

    const user = results[0];

    if(password == user.password){
      res.status(200).send('Autenticación exitosa');
    }else{
      res.status(401).send('Nombre de usuario o contraseña incorrectos');
    }

  })
})


//PUT ROUTES

//UPDATE PRODUCTS

app.put(updateProduct, (req,res)=>{
  const {id_product, name, description} = req.body
  const newData = {
    name,
    description
  }
  console.log(newData)

  const  updateProductQuery = `
  UPDATE products SET ? WHERE id_product = ?
  `

  connection.query(updateProductQuery,[newData, id_product],(error,results,fields)=>{
    if(error){
      console.error("There was a error updating", error)
      return res.status(500).send("There was a error updating")
    }
    console.log(results)
    return res.status(200).send("Updated successfuly")


  })

})

//UPDATE USER 

app.put(updateUser,(req,res)=>{
  const {id_user, name, last_name, password} = req.body;

  const newData = {
    name,
    last_name,
    password
  } 

  const updateUserQuery = `
  UPDATE users SET ? WHERE id_user = ?
  `

  connection.query(updateUserQuery,[newData, id_user], (error,results,fields)=>{
    if(error){
      console.error("There was a error updating user", error)
      return res.status(500).send("There was a error updating")
    }
    console.log(results)
    return res.status(200).send("Updated successfuly")

  })
}
)

//DELETE ROUTES

//DELETE PRODUCT

app.delete(deleteProduct,(req,res)=>{
  const {id_product} = req.body;

  if (!id_product) {
    return res.status(400).send('Product ID required to delete');
  }

  const deleteProductQuery = `
    DELETE FROM products WHERE id_product = ${id_product}
  `

  connection.query(deleteProductQuery, (error,results,fields)=>{
    if(error){
      console.error("There was a error deleting the product", error);
      return res.status(500).send("There was a error deleting the product");
    }

    console.log("Product deleted successfuly", results)
    return res.status(200).send("product deleted successfuly")
  })


})


//DELETE USER AND SHOPPING_CART

app.delete(deleteUser,(req,res)=>{
  const {id_user} = req.body;

  if(!id_user){
    return res.status(400).send('User ID required to delete');
  }

  const deleteUserQuery = `
    DELETE FROM users WHERE id_user = ${id_user}
  `
  connection.query(deleteUserQuery, (error,results,fields)=>{
    if(error){
      console.error("There was a error deleting the user", error);
      return res.status(500).send("There was a error deleting the user");
    }

    console.log("user deleted successfuly", results)
    return res.status(200).send("user deleted successfuly")
    
  })


})


// connection.end((err)=>{
//   if(err){
//     console.error("error al cerrar",err)
//     return;
//   }
//   console.log("conexion cerrada correctamente")
// })



// to start the server on port 3000 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});

