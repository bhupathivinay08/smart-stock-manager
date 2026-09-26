
from fastapi import Depends, FastAPI
from models import Product
from fastapi.middleware.cors import CORSMiddleware
from databases import get_db, SessionLocal, engine
import database_models
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
     CORSMiddleware,
allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")],
     allow_methods=["*"]
)

database_models.Base.metadata.create_all(bind = engine)

@app.get("/")
def greet():
    return "WEL-COME to TELSUKO TRAC"

products = [
    Product(id = 1, name = "laptop", description = "budget_laptop", price = 99,quantity = 5),
    Product(id = 2, name =  "mobile", description = "budget_mobiles", price = 79, quantity =2),
    Product(id = 3, name = "mouse", description = "laptop mouse", price = 9,quantity = 5),
    Product(id = 5, name =  "keyboard", description = "laptop keyboard", price = 19, quantity =2)

]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    db = SessionLocal()

    count = db.query(database_models.Product).count()
    if count == 0:
        for product in products:
            db.add(database_models.Product(**product.model_dump()))

        db.commit()

init_db()

@app.get("/products")
def get_all_products(db : Session = Depends(get_db)):
    db_products = db.query(database_models.Product).all()
    return db_products

@app.get("/products/{id}")
def get_product_by_id(id : int, db : Session = Depends(get_db)):
        db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
        if db_product:
            return db_product
        return "product not found"

@app.post("/products")
def add_product(product : Product, db : Session = Depends(get_db)):
    db.add(database_models.Product(**product.model_dump()))
    db.commit()
    return product

@app.put("/products/{id}")
def update_product(id: int, product: Product, db : Session = Depends(get_db)):
        db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
        if db_product:
            db_product.name = product.name
            db_product.description = product.description
            db_product.price = product.price
            db_product.quantity = product.quantity
            db.commit()
            return "product updated!"
        else:
            return "product not found!"


@app.delete("/products/{id}")
def delete_product(id : int, db : Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
         db.delete(db_product)
         db.commit()
    else:
        return "id not found!"