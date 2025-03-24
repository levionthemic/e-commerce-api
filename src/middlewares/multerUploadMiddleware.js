const multer = require('multer')


const upload = multer()

export const multerUploadMiddleware = { upload }