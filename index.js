var port = 8080;

const server = http.createServer(function (req,res){
    const path =req.url;
    const method =req.method;
    if(path ==="/products"){
        if (method ==="GET"){
            res.writeHead(200, { "Content-Type": "application/json"});
            const products =JSON.stringify([
                {
                    name: "하리보 골든바렌구미",
                    price: 1900,
                },
            ]);
            res.end(products);
        } else if (method==="POST"){
            res.end("생성되었습니다!");
        }
    }
    res.end("Good Bye");
});