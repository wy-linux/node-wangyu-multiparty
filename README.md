### node-wangyu-multiparty, 用于对http请求中FormData类型的数据进行解析
1. bin目录为multiparty的核心库
2. example目录提供了该库的一些使用示例

Using npm:
```javascript
npm install node-wangyu-multiparty
```
Once the package is installed, you can import the library using require approach:
```javascript
const multiparty = require('node-wangyu-multiparty')
```
###### Example:
```javascript
if (req.headers['content-type']?.includes('multipart/form-data')) {  
    /**
     * 在new调用时候，传入callback获取解析后的fields字段
     */
    new MultipartyParse(req, (fields, files) => {
         res.end(JSON.stringify(files))
    })
}

if (req.headers['content-type']?.includes('multipart/form-data')) {  
   const multiparty = new MultipartyParse(req)
    /**
     * 发布订阅监听fields事件, 获取解析后的fields字段
     */
   multiparty.on('fields', (fields, files) => {
        res.end(JSON.stringify(files))
   })
}
```