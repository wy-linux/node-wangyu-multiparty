const fs = require('fs')
const uuid = require('uuid')
const path = require('path')
const EventEmitter = require('events')
class MultipartyParse extends EventEmitter{
    constructor(req, callback) {
        super()
        this.buffer = null
        this.boundary = ''
        this.fields = {}
        this.files = {}
        this.callback = callback
        this._requestResolve(req)
    }
    _requestResolve(req) {
        const arrayBuffer = []
        req.on('data', (chunk) => {
            arrayBuffer.push(chunk);
        })
        req.on('end', () => {
            this.buffer = Buffer.concat(arrayBuffer)
            this.boundary  ="--" + req.headers['content-type'].split('=')[1];
            this.parse(this.buffer, this.boundary)
        })
    }
    split(buffer, boundary) {
        const length = Buffer.from(boundary).length; // 强制将字符串转化成buffer
        let offset = 0;
        let current;
        const arrayBuffer = []
        while (-1 !== (current = buffer.indexOf(boundary, offset))) {
            arrayBuffer.push(buffer.slice(offset, current))
            offset = current + length
        }
        arrayBuffer.push(buffer.slice(offset))
        return arrayBuffer
    }
    parse(buffer, boundary) {
        const arrayBuffer = this.split(buffer, boundary).slice(1, -1)
        const uploadPath = path.resolve(process.cwd(), 'upload')
        if(!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath)
        }
        for(let i = 0; i < arrayBuffer.length; i++) {
            let [head, body] = this.split(arrayBuffer[i], `\r\n\r\n`)
            head = head.toString()
            const name = head.match(/name="(.+?)"/)[1];
            if (head.includes('filename')) {
                const originalFilename = head.match(/filename="(.*?)"/)[1]
                const buffer = body.slice(0, -2)
                let filename = uuid.v4() + '.' + originalFilename.split('.')[1]
                fs.writeFile(path.join(uploadPath,filename),buffer, (err) => {
                    if(err) {
                        throw err
                    }
                    this.emit('end', this.fields, this.files)
                })
                this.files[name] = {
                    filename,
                    originalFilename,
                    size:buffer.length,
                    path: uploadPath + filename  
                }
            } else { 
               this.fields[name] = body.toString().slice(0, -2);
            }
        }
        this.callback? this.callback(this.fields, this.files) : null
        this.emit('fields', this.fields, this.files)
    }
}

module.exports = MultipartyParse