import { extname } from 'path';

export const csvFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(csv)$/)) {
        return callback(new Error('Only CSV files are allowed!'), false);
    }

    callback(null, true);
};

export const csvFileName = (req, file, callback) => {
    callback(null, `data${extname(file.originalname)}`);
};