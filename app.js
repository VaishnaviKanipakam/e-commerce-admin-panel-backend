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
                response.status(500)
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
                    response.status(500).json("Enter Valid Details")
                    return
                }
                response.status(200).json(userDetails)
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
        }
        if (result[0].mobile_number === mobileNumber && result[0].password === password){
            const payload = {mobileNumber: mobileNumber}
            const jwtToken = jwt.sign(payload, "oaapmcntholamc")
            response.status(200).json({result, "token": jwtToken})
        }
    })
})

// Post All Categories API
app.post("/categories", (request, response) => {
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
            response.status(500)
            return
        }
           
        const insert_data_into_category_table = `
            INSERT INTO 
                category_table (category_image, category_name, item_count)
            VALUES 
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS49X_cSUrau_6WBf33JqdMS8LeXYvR0SMMCu_-xruWEtEOonAMdiETkm5-O-POJ2gVV0&usqp=CAU", "Men Clothes", 24),
                ("https://img.freepik.com/free-photo/front-view-woman-wearing-hat_23-2149726075.jpg?semt=ais_hybrid&w=740", "Women Clothes", 12),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgaRpxuCEnhHDo_xKGcundMmPk4VxHzIVZoA&s", "Accessories", 43),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWTZoyOYHHdmLpeKgHNXWbsjcb0nFfk85jxA&s", "Cotton Clothes", 31),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbIkH4d9IPA4seGezbYrulQl5m7pUbWrDfBQ&s", "Summer Clothes", 26),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkKoM8Rx38A8zr0YJ8lrRTz836IW1Ra-k0Sw&s", "Wedding Clothes", 52),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeW0ezCkdz8fYxWGZKDoQrPTPSIlbzjYl4pg&s", "Spring Colletion", 30),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc0XGX9D4CQ0XJBtUgkj2xjxa8uSvCTw1gcQ&s", "Casual Clothes", 52),
                ("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGPgxzMQSinGi4x-bSntnGllwhg1UCNuUbDw&s", "Hats", 47);
        `;
        db.query(insert_data_into_category_table, (err, result) => {
            if(err){
                response.status(500).json("Cannot Update Category")
                return
            }
            response.status(200).json("Categories Insereted Successfully")
        })
    })
})


// Get All Categories API
app.get("/get_category", (request, response) => {
    const get_data_from_category_table = `
        SELECT
            *
        FROM
            category_table;
    `;
    db.query(get_data_from_category_table, (err, result) => {
        if(err){
            response.status(500).json("Something Went Wrong")
            return
        }
        response.status(200).json(result)
    })
})
