const MultipartyParse = require('../bin')
const http = require('http')
const url = require('url')
const path = require('path');
const fs = require('fs')
const mime = require('mime')
const server = http.createServer((req, res) => {
    let { pathname, query } = url.parse(req.url, true);
    if (pathname === '/upload' && req.method == 'POST') {
        if (req.headers['content-type']?.includes('multipart/form-data')) {  
            /**
             * 在new调用时候，传入callback获取解析后的fields字段
             */
           new MultipartyParse(req, (fields, files) => {
                res.end(JSON.stringify(files))
           })
        }
    } else {
        let filePath = path.join(__dirname, pathname);
        fs.stat(filePath, function(err, statObj) {
            if (err) {
                res.statusCode = 404;
                res.end('NOT FOUND')
            } else {
                if (statObj.isFile()) {
                    res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8')
                    fs.createReadStream(filePath).pipe(res);
                } else {
                    let htmlPath = path.join(filePath, 'client.html');
                    fs.access(htmlPath, function(err) {
                        if (err) {
                            res.statusCode = 404;
                            res.end('NOT FOUND')
                        } else {
                            res.setHeader('Content-Type', 'text/html;charset=utf-8')
                            fs.createReadStream(htmlPath).pipe(res);
                        }
                    })
                }
            }
        })
    }
})
server.listen(80, () => {
    console.log(`server start 80`)
})