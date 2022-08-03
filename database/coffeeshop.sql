CREATE DATABASE coffeeshop
GO
USE coffeeshop
GO

CREATE TABLE Category (
    categoryID CHAR(6) NOT NULL,
    name VARCHAR(20) NOT NULL,
    parentID CHAR(6),

    CONSTRAINT Category_pk PRIMARY KEY (categoryID)
)
GO

CREATE TABLE Product (
    productID CHAR(6) NOT NULL,
    name VARCHAR(30) NOT NULL,
    description varchar(1000),
    image VARCHAR(150),
    rating FLOAT,
    categoryID CHAR(6) NOT NULL,
    
    CONSTRAINT Product_pk PRIMARY KEY (productID),
    CONSTRAINT Product_fk_Category FOREIGN KEY (categoryID)
        REFERENCES Category (categoryID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
GO

CREATE TABLE ProductItem (
    productID CHAR(6) NOT NULL,
    size VARCHAR(20) NOT NULL,
    quantity INT,
    price FLOAT,

    CONSTRAINT ProductItem_pk PRIMARY KEY (productID, size),
    CONSTRAINT ProductItem_fk_Product FOREIGN KEY (productID)
        REFERENCES Product(productID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
GO

CREATE TABLE Customer (
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    fullname NVARCHAR(20) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    address NVARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    
    CONSTRAINT Customer_pk PRIMARY KEY (username)
)
GO


-- insert data
INSERT INTO Category (categoryID, name, parentID)
VALUES  ('CFE000', 'Coffee', NULL),
        ('TEA000', 'Tea', NULL),
        ('CKE000', 'Cake', NULL),
        ('CFE001', 'Blend', 'CFE000'),
        ('CFE002', 'Collaboration', 'CFE000'),
        ('CFE003', 'Single Origin', 'CFE000'),
        ('CFE004', 'Steeped', 'CFE000'),
        ('TEA001', 'Black tea', 'TEA000'),
        ('TEA002', 'Green tea', 'TEA000'),
        ('TEA003', 'Caffeine tea', 'TEA000'),
        ('TEA004', 'White tea', 'TEA000'),
        ('TEA005', 'Matcha tea', 'TEA000'),
        ('CKE001', 'Vegan Cakes', 'CKE000'),
        ('CKE002', 'Heart Shaped Cakes', 'CKE000'),
        ('CKE003', 'Party Cakes', 'CKE000'),
        ('CKE004', 'Midnight Cakes', 'CKE000')
GO

-- CREATE PROCEDURE addNewProduct
-- @name VARCHAR(30), @description VARCHAR(1000), @image VARCHAR(150), @rating FLOAT, @categoryID CHAR(6)
-- AS BEGIN
--     INSERT INTO Product (name, description, image, rating, categoryID)
--     VALUES (@name, @description, @image, @rating, @categoryID)
-- END
-- GO