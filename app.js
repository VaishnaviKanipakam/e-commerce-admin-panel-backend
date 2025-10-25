// e_commerce_admin_panel_backend

const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = mysql.createConnection({
      host: "localhost",
      user: "vaishu",
      password: "Bharu@96",
      database: "e_commerce_admin_panel_backend",
      insecureAuth: true,
    });
    const port = 3004
    app.listen(port, () => {
      console.log(`app listening at ${port}...`); 
    });
    db.connect(function (err) {
      if (err) throw err;
      console.log("Conected!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Signup API
app.post("/signup", (request, response) => {
  const userDetails = request.body;
  const { name, mobileNumber, email, password, userType } = userDetails;
  const create_user_table = `
        CREATE TABLE IF NOT EXISTS  registration_table (
            id INTEGER NOT NULL AUTO_INCREMENT,
            name VARCHAR (1000),
            mobile_number VARCHAR (1000),
            email VARCHAR (1000),
            password VARCHAR (5000),
            user_type ENUM('customer', 'admin') NOT NULL,
            PRIMARY KEY (id)
        );`;

  db.query(create_user_table, (err, result) => {
    if (err) {
      response.status(500);
      console.log("56", err)
      return;
    }
    // response.status(200).json(result)
    // console.log("60", result)

    const insert_user_details = `
           INSERT INTO 
                registration_table (name,  mobile_number, email, password, user_type)
            values (
               ?, ?, ?, ?, ?
            ); `;

    db.query(insert_user_details,[name, mobileNumber, email, password, userType], (err, result) => {
      if (err) {
        response.status(500).json("Enter All The Required Fields");
        console.log("72", err)
        return;
      }
      response.status(200).json(userDetails);
      console.log("76", result, userDetails)
    });
  });
});

// Login API
app.post("/login", (request, response) => {
  const loginDetails = request.body;
  const { mobileNumber, password } = loginDetails;

  const get_login_details_query = `
        SELECT 
            *
        FROM 
            registration_table
        WHERE
             mobile_number = "${mobileNumber}"
             AND password = "${password}";`;

  db.query(get_login_details_query, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Get Details");
      console.log("98", err)
      return;
    } else if (
      result.length !== 0 &&
      result[0].mobile_number === mobileNumber &&
      result[0].password === password
    ) {
      const user = result[0]
      console.log("106", user.mobile_number, user.id, user.user_type, user.password)
       const payload = { mobileNumber: user.mobile_number,  userType: user.user_type, id: user.id};
          const jwtToken = jwt.sign(payload, "oaapmcntholamc");
          response.status(200).json({ result, token: jwtToken });
          // if (user.user_type === "admin"){
          //   const payload = { mobileNumber: user.mobile_number,  userType: user.user_type, password: user.password, id: user.id};
          // const adminJwtToken = jwt.sign(payload, "oaapmcntholamc");
          // response.status(200).json({ result, token: adminJwtToken });
          // }else if(user.user_type === "customer"){
          //     const payload = { mobileNumber: user.mobile_number,  userType: user.user_type, password: user.password, id: user.id};
          // const customerJwtToken = jwt.sign(payload, "oaapmcntholamc");
          // response.status(200).json({ result, token: customerJwtToken });
          // }
      console.log("111", result)
    } else if (result.length == 0) {
      response.status(500).json("Enter Valid Mobile Number and Password");
    }
  });
});


//Token Verification Middleware
const authenticationToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
const jwtToken = authHeader && authHeader.split(" ")[1];;
 
if (!jwtToken) {
    return response.status(401).json("Invalid JWT Token");
  }
  try{
    const decoded = jwt.verify(jwtToken, "oaapmcntholamc")
     request.user = decoded
     next()
  }catch(err){
    return response.status(403).json("Invalid JWT Token")
  }


  // let jwtToken;
  // if (authHeader !== undefined) {
  //   jwtToken = authHeader.split(" ")[1];
  // }
  // if (jwtToken === undefined) {
  //   response.status(401);
  //   response.json("Invalid JWT Token");
  // } else {
  //   // console.log("138", decoded)
  //   jwt.verify(jwtToken, "oaapmcntholamc", async (error, payload) => {
  //     // request.user = decoded
  //     // console.log("141", decoded)
  //     if (error) {
  //       response.status(401);
  //       response.json("Invalid JWT Token");
  //     } else {
  //       next();
  //     }
  //   });
  // }
};

//Role-based Authorization Middleware
const authorizeRoles = (...allowedRoles) =>{
  return(request, response, next) => {
    console.log("152", allowedRoles)
    if (!allowedRoles.includes(request.user.userType)){
            return response.status(403).json("Access denied: Insufficient permissions.");
    }
    next();
  }
}

//Get API
// app.get("/get_admin_details", authenticationToken, (request, response) => {
//   const admin_registration_details = `
//         SELECT
//             *
//         FROM
//             admin_registration;`;
//   db.query(admin_registration_details, (err, result) => {
//     if (err) {
//       response.status(500).json("Cannot Get Admin Details");
//     }
//     response.status(200).json(result);
//   });
// });


// Post All Categories API
app.post("/categories", authenticationToken, authorizeRoles("admin"),(request, response) => {
  const categoryDetails = request.body;
  const { categoryImage, categoryName, categoryCount } = categoryDetails;
  const create_category_table = `
        CREATE TABLE IF NOT EXISTS category_table (
            category_id  INTEGER NOT NULL AUTO_INCREMENT,
            category_image VARCHAR (1000),
            category_name VARCHAR (1000),
            item_count INTEGER,
            PRIMARY KEY (category_id)
        );`;

  db.query(create_category_table, (err, result) => {
    if (err) {
      response.status(500);
      return;
    }

    const insert_data_into_category_table = `
            INSERT INTO 
                category_table (category_image, category_name, item_count)
            VALUES 
                ("${categoryImage}", "${categoryName}", ${categoryCount});
        `;
    db.query(insert_data_into_category_table, (err, result) => {
      if (err) {
        response.status(500).json("Cannot Update Category");
        return;
      }
      response.status(200).json("Categories Insereted Successfully");
    });
  });
});

// Get All Categories API
app.get("/get_category", authenticationToken, authorizeRoles("admin", "customer"),(request, response) => {
  const get_data_from_category_table = `
        SELECT
            *
        FROM
            category_table;
    `;
  db.query(get_data_from_category_table, (err, result) => {
    if (err) {
      response.status(500).json("Something Went Wrong");
      console.log("238", err)
      return;
    }
    response.status(200).json(result);
    console.log("242", result)
  });
});

// Edit Category API
app.put("/edit_category", authenticationToken, authorizeRoles("admin"),(request, response) => {
  const categoryId = request.query.category_id;
  const editCategoryDetails = request.body;
  const { editCategoryImage, editCategoryName, editCategoryCount } =
    editCategoryDetails;

  const update_category_query = `
        UPDATE
            category_table
        SET
            category_image = "${editCategoryImage}", 
            category_name = "${editCategoryName}", 
            item_count = ${editCategoryCount}
        WHERE 
            category_id = ${categoryId};`;

  db.query(update_category_query, (err, result) => {
    if (err) {
      response.status(500).json(`Cannot Update ${editCategoryName}`);
      return;
    }
    response.status(200).json(`${editCategoryName} Updated Successfully`);
  });
});


// Category Detailed API
app.post("/add_category_type", authenticationToken, authorizeRoles("admin"),(request, response) => {
  const categoryId = request.query.category_id;
  const addCategoryTypeDetails = request.body;
  const {
    addCategoryType,
    addCategoryImage,
    addCategoryName,
    addCategoryCount,
    addCategoryPrice
  } = addCategoryTypeDetails;
  const create_category_Details_table = `
         CREATE TABLE IF NOT EXISTS category_type_table (
            each_category_id  INTEGER NOT NULL AUTO_INCREMENT,
            category_type VARCHAR (1000),
            category_image VARCHAR (1000),
            category_name VARCHAR (1000),
            category_price INTEGER,
            item_count INTEGER,
            category_id INTEGER,
            PRIMARY KEY (each_category_id),
            FOREIGN KEY (category_id) REFERENCES category_table(category_id));`;

  db.query(create_category_Details_table, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Create Table");
      console.log("298", err);
      return;
    }
    // response.status(200).json("Table Create Successfully");
    // console.log("302", result)

    const insert_data_into_category_Details_table = `
                INSERT INTO 
                    category_type_table (category_id, category_type, category_image, category_name,  item_count, category_price)
                VALUES
                (
                ?, ?, ?, ?, ?, ?
                );
            `;
    db.query(insert_data_into_category_Details_table,[categoryId, addCategoryType, addCategoryImage, addCategoryName, addCategoryCount, addCategoryPrice], (err, result) => {
      if (err) {
        response.status(500).json(`Cannot Insert Data`);
        return;
      }
      response.status(200).json("Data Inserted Successfully");
    });
  });
});

// Get Category Detailes API
app.get("/get_each_category_list", authenticationToken, authorizeRoles("admin", "customer"),(request, response) => {
  const categoryId = request.query.category_id;
  const get_category_Details_table_data = `
        SELECT 
            *
        FROM 
            category_type_table
        WHERE
            category_id = ${categoryId};`;

  db.query(get_category_Details_table_data, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Get Data");
      return;
    }
    response.status(200).json(result);
  });
});

// Edit Category Detailes API
app.put("/edit_catgory_type", authenticationToken, authorizeRoles("admin"),(request, response) => {
  const eachCategoryId = request.query.each_category_type_id;
  const editCategoryTypeDetails = request.body;
  const {
    editCategoryTypeImage,
    editCategoryTypeName,
    editCategoryTypeCount,
    editCategoryType,
      editCategoryPrice,
  } = editCategoryTypeDetails;

  const update_category_type_query = `
        UPDATE
            category_type_table
        SET
            category_image = "${editCategoryTypeImage}",
            category_name = "${editCategoryTypeName}",
            item_count = "${editCategoryTypeCount}",
            category_type = "${editCategoryType}",
            category_price = ${editCategoryPrice}
        WHERE 
            each_category_id = ${eachCategoryId};

    `;
  db.query(update_category_type_query, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Update Category");
      return;
    }
    response.status(200).json("Category Updated Successfully");
  });
});



// Add to Cart Api
app.post("/add_to_cart", authenticationToken, authorizeRoles("admin", "customer"),(request, response) => {
  const cartItemDetails = request.body
  const {eachCategoryId, userId, editCategoryTypeImage, editCategoryTypeName, editCategoryType, editCategoryPrice} = cartItemDetails
  const add_to_cart__items_table_query = `
     CREATE TABLE IF NOT EXISTS add_to_cart_table (
            cart_product_id  INTEGER NOT NULL AUTO_INCREMENT,
            product_price INTEGER, 
            product_name VARCHAR (1000), 
            product_image VARCHAR (1000), 
            product_type VARCHAR (1000), 
            product_quantity INTEGER DEFAULT 1,
            user_id INTEGER,
            each_category_id INTEGER, 
            PRIMARY KEY (cart_product_id),
            FOREIGN KEY (user_id) REFERENCES registration_table(id),
            FOREIGN KEY (each_category_id) REFERENCES category_type_table(each_category_id)
      );
  `;

  db.query(add_to_cart__items_table_query, (err, result) => {
    if(err){
      response.status(500).json("Cannot Create Table");
      console.log("398", err);
      return 
    }
    response.status(200).json(result);
    console.log("402", result);

    // const insert_cart_item_details_query = `
    //   INSERT INTO 
    //     add_to_cart_table (each_category_id, user_id, product_image, product_name,  product_type, product_price)
    //   VALUES(
    //     ?, ?, ?, ?, ?, ?
    //   );
    // `;
    // db.query(insert_cart_item_details_query, [eachCategoryId, userId, editCategoryTypeImage, editCategoryTypeName, editCategoryType, editCategoryPrice], (err, result) => {
    //   if (err){
    //     response.status(404).json("Cannot Add Cart Item");
    //     console.log("418", err);
    //     return 
    //   }
    //   response.status(200).json("Cart Item Added Successfully");
    //   console.log("422", result);
    // })
  })
})


// Get Cart Items API
app.get("/get_cart_items", authenticationToken, authorizeRoles("admin", "customer"),(request, response)=> {
  const userId = request.query.user_id;
    const get_all_cart_items_query = `
      SELECT
        *
      FROM
        add_to_cart_table
      WHERE
        user_id = ${userId};
    `;

    db.query(get_all_cart_items_query, (err, result)=> {
      if(err){
        response.status(500).json("Cannot Get Cart Items");
        console.log("442", err);
        return 
      }
      response.status(200).json(result);
      console.log("446", result);
    })
})