const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const models = require("./models");
const multer = require('multer');

// 업로드 폴더 경로
const uploadDir = path.join(__dirname, 'uploads');

// 서버 시작 시 uploads 디렉토리 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('uploads 폴더가 생성되었습니다.');
}

// Multer 설정
const upload = multer({ 
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname);
        },
    }),
});

const port = 8080;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/banners", (req, res) => {
  models.Banner.findAll({
    limit: 2,
  })
    .then((result) => {
      res.send({
        banners: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생했습니다");
    });
});

// 상품 목록 조회
app.get("/products", (req, res) => {
  models.Product.findAll({
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'price', 'createdAt', 'seller', "imageUrl", "soldout",],
  }).then((result) => {
    console.log("PRODUCTS: ", result);
    res.send({
      products: result
    });
  }).catch((error) => {
    console.error(error);
    res.status(400).send("에러 발생");
  });
});

// 상품 생성
app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !description || !price || !seller || !imageUrl) {
    return res.status(400).send("모든 필드를 입력해주세요");
  }
  models.Product.create({
    name,
    description,
    price,
    seller,
    imageUrl,

  }).then((result) => {
    console.log("상품 생성 결과: ", result);
    res.send({
      result,
    });
  })
  .catch((error) => {
    console.error(error);
    res.status(400).send("상품 업로드에 문제가 발생했습니다");
  });
});

// 특정 상품 조회
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  models.Product.findOne({
    where: { id }
  }).then((result) => {
    if (!result) {
      return res.status(404).send("해당 상품을 찾을 수 없습니다.");
    }
    console.log("PRODUCT: ", result);
    res.send({
      product: result,
    });
  }).catch((error) => {
    console.error(error);
    res.status(400).send("상품 조회에 에러가 발생했습니다.");
  });
});

// 이미지 업로드
app.post('/image', upload.single('image'), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});
app.post("/purchase/:id", (req, res) => {
  const { id } = req.params;
  models.Product.update(
    {
      soldout: 1,
    },
    {
      where: {
        id,
      },
    }
  )
    .then((result) => {
      res.send({
        result: true,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생했습니다.");
    });
});

// 서버 시작
app.listen(port, () => {
  console.log("달콤 스낵 노마드의 서버가 돌아가고 있습니다.");
  models.sequelize.sync().then(() => {
    console.log('DB 연결 성공!');
  })
  .catch((err) => {
    console.error(err);
    console.log('DB 연결 에러');
    process.exit();
  });
});
