const express = require('express');
const cors = require('cors');
const app = express();
const models = require("./models");
const port = 8080;

app.use(express.json());
app.use(cors());

app.get("/products",(req,res) => {
    const query =req.query;
    console.log("QUERY :" , query);
    res.send({
      products: [
            {
                "id": 1,
                "name": "하리보 골든바렌구미",
                "price": 1900,
                "seller": "달콤스낵노마드",
                "imageUrl": "images/products/jelly.jpeg"
            },
            {
                "id": 2,
                "name": "가루쿡 햄버거 포춘쿠키",
                "price": 4500,
                "seller": "달콤스낵노마드",
                "imageUrl": "images/products/ham.jpeg"
            },
            {
                "id": 3,
                "name": "카스가이 라카아메 땅콩사탕",
                "price": 2800,
                "seller": "달콤스낵노마드",
                "imageUrl": "images/products/candy.jpeg"
            },
        ],
    });
});

app.post("/products",(req,res) => {
    const body = req.body;
    const {name,description, price, seller} =body;
    models.Product.create({
        name,
        description,
        price,
        seller
    }).then((result)=>{
        console.log("상품 생성 결과: ", result);
        res.send({
            result,
        });
    })
    .catch((error)=>{
        console.error(error);
        res.send("상품 업로드에 문제가 발생했습니다");
    });
});
app.get("/products/:id/events/:eventId", (req,res) =>{
    const params = req.params;
    const {id,eventId} = params;
    res.send(`id는 ${id}와 ${eventId}입니다`);
})

app.listen(port,() => {
    console.log("달콤 스낵 노마드의 서버가 돌아가고 있습니다.");
    models.sequelize.sync().then(()=>{
        console.log('DB 연결 성공!');
    })
    .catch((err)=>{
        console.error(err);
        console.log('DB 연결 에러');
        process.exit();
    })
});