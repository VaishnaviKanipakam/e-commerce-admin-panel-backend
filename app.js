// e_commerce_admin_panel_backend

const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

let db = null;
const initializeDbAndServer = async() => {
    try{
        db = mysql.createConnection({
        host: "localhost",
        user: "vaishu",
        password: "Bharu@96",
        database: "e_commerce_admin_panel_backend",
        insecureAuth : true
        });
        app.listen(3004 , () => {
            console.log("app listening at 3004...")
        })
        db.connect(function(err) {
            if (err) throw err;
            console.log("Conected!")
        })  
    } catch(e){
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
}

initializeDbAndServer();

// Signup API
app.post("/signup", (request, response) => {
    const userDetails = request.body
    const {name, mobileNumber, email, password} = userDetails
    const create_user_table = `
        CREATE TABLE IF NOT EXISTS  admin_registration (
            admin_id INTEGER NOT NULL AUTO_INCREMENT,
            name VARCHAR (1000),
            mobile_number VARCHAR (1000),
            email VARCHAR (1000),
            password VARCHAR (5000),
            PRIMARY KEY (admin_id)
        );`;
    
        db.query(create_user_table, (err, result)=> {
            if(err){
                response.status(500);
                return
            }

        const insert_user_details = `
           INSERT INTO 
                admin_registration (name,  mobile_number, email, password)
            values (
                "${name}", "${mobileNumber}", "${email}", "${password}"
            ); `;

            db.query(insert_user_details, (err, result) => {
                if(err){
                    response.status(500).json("Enter Valid Details");
                    return
                }
                response.status(200).json(userDetails);
            })
    })
        
})


// Login API
app.post("/login", (request, response) => {
    const loginDetails = request.body 
    const {mobileNumber, password} = loginDetails

    const get_login_details_query = `
        SELECT 
            *
        FROM 
            admin_registration
        WHERE
             mobile_number = "${mobileNumber}"
             AND password = "${password}";`;

    db.query(get_login_details_query, (err, result) => {
        if(err){
            response.status(500).json("Cannot Get Details");
            return
        }else if(result.length !== 0 && result[0].mobile_number === mobileNumber && result[0].password === password){
            const payload = {mobileNumber: mobileNumber}
            const jwtToken = jwt.sign(payload, "oaapmcntholamc");
            response.status(200).json({result, "token": jwtToken})
        }else if (result.length == 0){
             response.status(500).json("Enter Valid Mobile Number and Password")
        }
    })
})


//Authentication Middleware
const authenticationToken = (request, response, next) => {
    const authHeader = request.headers["authorization"]
    let jwtToken;
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1];
      }
      if (jwtToken === undefined) {
        response.status(401);
        response.json("183Invalid JWT Token");
      } else {
        jwt.verify(jwtToken, "oaapmcntholamc", async (error, payload) => {
          if (error) {
            response.status(401);
            response.json("188Invalid JWT Token");
          } else {
            next();
          }
        });
      }
}

//Get API
app.get("/get_admin_details", authenticationToken,  (request, response) => {
    const admin_registration_details = `
        SELECT
            *
        FROM
            admin_registration;`;
        db.query(admin_registration_details, (err, result) => {
            if(err){
                response.status(500).json("Cannot Get Admin Details")
            }
            response.status(200).json(result)
        })
})


// Post All Categories API
app.post("/categories", authenticationToken, (request, response) => {
    const categoryDetails = request.body 
    const {categoryImage, categoryName, categoryCount} = categoryDetails
    const create_category_table = `
        CREATE TABLE IF NOT EXISTS category_table (
            category_id  INTEGER NOT NULL AUTO_INCREMENT,
            category_image VARCHAR (1000),
            category_name VARCHAR (1000),
            item_count INTEGER,
            PRIMARY KEY (category_id)
        );`;

    db.query(create_category_table, (err, result) => {
        if(err){
            response.status(500);
            return
        }
           
        const insert_data_into_category_table = `
            INSERT INTO 
                category_table (category_image, category_name, item_count)
            VALUES 
                ("${categoryImage}", "${categoryName}", ${categoryCount});
        `;
        db.query(insert_data_into_category_table, (err, result) => {
            if(err){
                response.status(500).json("Cannot Update Category");
                return
            }
            response.status(200).json("Categories Insereted Successfully");
        })
    })
})




// Get All Categories API
app.get("/get_category", authenticationToken, (request, response) => {
    const get_data_from_category_table = `
        SELECT
            *
        FROM
            category_table;
    `;
    db.query(get_data_from_category_table, (err, result) => {
        if(err){
            response.status(500).json("Something Went Wrong");
            return
        }
        response.status(200).json(result);
    })
})


// Edit Category API
app.put("/edit_category", authenticationToken, (request, response) => {
    const categoryId = request.query.category_id
    const editCategoryDetails = request.body
    const {editCategoryImage, editCategoryName, editCategoryCount} = editCategoryDetails;
    
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
        if(err){
            response.status(500).json(`Cannot Update ${editCategoryName}`)
            return
        }
        response.status(200).json(`${editCategoryName} Updated Successfully`)
    })
})


// Category Detailed API
app.post("/add_category_type", authenticationToken, (request, response) => {
    const categoryId = request.query.category_id
    const addCategoryTypeDetails = request.body
    const {addCategoryType, addCategoryImage, addCategoryName, addCategoryCount} = addCategoryTypeDetails
    const create_category_Details_table = `
         CREATE TABLE IF NOT EXISTS category_type_table (
            each_category_id  INTEGER NOT NULL AUTO_INCREMENT,
            category_type VARCHAR (1000),
            category_image VARCHAR (1000),
            category_name VARCHAR (1000),
            item_count INTEGER,
            category_id INTEGER,
            PRIMARY KEY (each_category_id),
            FOREIGN KEY (category_id) REFERENCES category_table(category_id));`;

    db.query(create_category_Details_table, (err, result) => {
        if(err){
            response.status(500).json("Cannot Create Table")
            return
        }

            const insert_data_into_category_Details_table= `
                INSERT INTO 
                    category_type_table (category_id, category_type, category_image, category_name,  item_count)
                VALUES
                (${categoryId}, "${addCategoryType}", "${addCategoryImage}", "${addCategoryName}", ${addCategoryCount});
            `;
    db.query(insert_data_into_category_Details_table, (err, result) => {
        if(err){
            response.status(500).json(`Cannot Insert Data`);
            return
        }
        response.status(200).json("Data Inserted Successfully");
    })
        
    })
})


// Get Category Detailes API
app.get("/get_each_category_list", authenticationToken, (request, response) => {
    const categoryId = request.query.category_id
    const get_category_Details_table_data = `
        SELECT 
            *
        FROM 
            category_type_table
        WHERE
            category_id = ${categoryId};`;

    db.query(get_category_Details_table_data, (err, result) => {
        if(err){
            response.status(500).json("Cannot Get Data")
            return
        }
        response.status(200).json(result);
    })
})


// Edit Category Detailes API 
app.put("/edit_catgory_type", authenticationToken, (request, response) => {
    const eachCategoryId = request.query.each_category_type_id;
    const editCategoryTypeDetails = request.body;
    const {editCategoryTypeImage, editCategoryTypeName, editCategoryTypeCount, editCategoryType} = editCategoryTypeDetails

    const  update_category_type_query = `
        UPDATE
            category_type_table
        SET
            category_image = "${editCategoryTypeImage}",
            category_name = "${editCategoryTypeName}",
            item_count = "${editCategoryTypeCount}",
            category_type = "${editCategoryType}"
        WHERE 
            each_category_id = ${eachCategoryId};

    `;
    db.query(update_category_type_query, (err, result) => {
        if(err){
            response.status(500).json("Cannot Update Category")
            return
        }
        response.status(200).json("Category Updated Successfully")
    })

})

