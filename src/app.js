require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
const app = express();
const store = require('./store');
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
const uuid = require('uuid/v4');

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());

// set up winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.File({ filename: 'info.log' })]
});

if (NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple()
        })
    );
}

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    // move to the next middleware
    next();
});

app.get('/bookmarks', (req, res) => {
    let bookmarkList = store.bookmarks;
    res.send(bookmarkList);
});

app.get('/bookmarks/:id', (req, res) => {
    const id = req.params.id;
    let bookmarkSearch = [];
    bookmarkSearch = store.bookmarks.filter(bookmark => bookmark.id === id);
    if (!bookmarkSearch.length) {
        res.status(404).json({ error: '404 Not Found' });
    } else {
        res.send(bookmarkSearch);
    }
});

app.post('/bookmark', (req, res) => {
    const { title, url, desc, rating } = req.body;
    let bookmarkList = store.bookmarks;

    if (!title) {
        logger.error(`Title is required`);
        return res.status(400).send('Invalid data');
    }

    if (!url) {
        logger.error(`URL is required`);
        return res.status(400).send('Invalid data');
    }
    if (url.slice(0, 5) !== 'http:' && url.slice(0, 5) !== 'https') {
        logger.error(`URL must include protocol (http/https)`);
        return res.status(400).send('Invalid data');
    }
    if (rating !== '' && (rating < 1 || rating > 5)) {
        logger.error(`URL must include protocol (http/https)`);
        return res.status(400).send('Invalid data');
    }
    // get an id
    const id = uuid();

    const newBookmark = {
        id,
        title,
        url,
        desc,
        rating
    };

    bookmarkList.push(newBookmark);

    logger.info(`Bookmark with id ${id} created`);

    res.status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json({ id });
});

app.delete('/bookmarks/:id', (req, res) => {
    const id = req.params.id;
    let bookmarkList = store.bookmarks;

    let bmIndex = bookmarkList.findIndex(bm => bm.id === id);
    bookmarkList.splice(bmIndex, 1);
    res.status(204).end(`List with id ${id} deleted.`);
});

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
