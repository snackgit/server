const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Sequelize, Op } = require("sequelize");
const models = require("./models");
const detectProduct = require("./helpers/detectProduct");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

app.get("/banners", async (req, res) => {
  try {
    const banners = await models.Banner.findAll({ limit: 2 });
    res.send({ banners });
  } catch (error) {
    console.error(error);
    res.status(500).send("배너를 가져오는 중 오류가 발생했습니다.");
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await models.Product.findAll({
      order: [["createdAt", "DESC"]],
      attributes: [
        "id", 
        "name", 
        "price", 
        "createdAt", 
        "seller", 
        "imageUrl", 
        "quantity", 
        "category"
      ],
    });
    res.send({ products });
  } catch (error) {
    console.error(error);
    res.status(400).send("상품 목록을 가져오는 중 오류가 발생했습니다.");
  }
});

app.post("/products", async (req, res) => {
  const { name, description, price, seller, imageUrl, category, quantity } = req.body;

  if (!name || !description || !price || !seller || !imageUrl || !category || !quantity) {
    return res.status(400).send("모든 필드를 입력해주세요.");
  }

  try {
    detectProduct(imageUrl, async (type) => {
      const product = await models.Product.create({ 
        name, 
        description, 
        price, 
        seller, 
        imageUrl, 
        type, 
        category,
        quantity: parseInt(quantity)
      });
      res.send({ result: product });
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("상품 생성 중 오류가 발생했습니다.");
  }
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await models.Product.findOne({ where: { id } });
    if (!product) {
      return res.status(404).send("해당 상품을 찾을 수 없습니다.");
    }
    res.send({ product });
  } catch (error) {
    console.error(error);
    res.status(400).send("상품 조회 중 오류가 발생했습니다.");
  }
});

app.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("파일이 업로드되지 않았습니다.");
  }
  res.send({ imageUrl: req.file.path });
});

app.post("/purchase/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await models.Product.findOne({ where: { id } });
    
    if (!product) {
      return res.status(404).send("해당 상품을 찾을 수 없습니다.");
    }

    if (product.quantity <= 0) {
      return res.status(400).send("품절된 상품입니다.");
    }

    const [updated] = await models.Product.update(
      { quantity: product.quantity - 1 },
      { where: { id } }
    );

    if (!updated) {
      return res.status(500).send("구매 처리 중 오류가 발생했습니다.");
    }

    res.send({ result: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("상품 구매 처리 중 오류가 발생했습니다.");
  }
});

app.get("/products/:id/recommendation", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await models.Product.findOne({ where: { id } });

    if (!product || !product.type) {
      return res.status(404).send("추천할 상품이 없습니다.");
    }

    const recommendations = await models.Product.findAll({
      where: { type: product.type, id: { [Op.ne]: id } },
    });

    res.send({ products: recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).send("추천 상품을 가져오는 중 오류가 발생했습니다.");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("서버에서 오류가 발생했습니다.");
});

app.listen(port, async () => {
  console.log(`달콤 노마드 서버가 ${port} 포트에서 실행 중입니다.`);

  try {
    await models.sequelize.sync();
    console.log("데이터베이스 연결 성공!");
  } catch (err) {
    console.error(err);
    console.log("데이터베이스 연결 실패. 서버를 종료합니다.");
    process.exit();
  }
});
