import multer from 'multer'

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB (Vercel's request limit is 4.5 MB)
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) callback(null, true)
        else callback(new Error('Only image files are allowed'))
    }
});

export default upload;
