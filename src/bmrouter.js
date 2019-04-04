const express = require('express');
const bmRouter = express.Router();
const bodyParser = express.json();
const store = require('./store');
const uuid = require('uuid/v4');

bmRouter
    .route('/bookmarks')
    .get((req, res) => {
        let bookmarkList = store.bookmarks;
        res.send(bookmarkList);
    })
    .post((req, res) => {
        const { title, url, desc, rating } = req.body;
        let bookmarkList = store.bookmarks;

        if (!title) {
            return res.status(400).send(`Title is required`);
        }

        if (!url) {
            return res.status(400).send(`URL is required`);
        }
        if (url.slice(0, 5) !== 'http:' && url.slice(0, 5) !== 'https') {
            return res
                .status(400)
                .send(`URL must include protocol (http/https)`);
        }
        if (rating !== '' && (rating < 1 || rating > 5)) {
            return res
                .status(400)
                .send(`URL must include protocol (http/https)`);
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

        res.status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json({ id });
    });

bmRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const id = req.params.id;
        let bookmarkSearch = [];
        bookmarkSearch = store.bookmarks.filter(bookmark => bookmark.id === id);
        if (!bookmarkSearch.length) {
            res.status(404).json({ error: '404 Not Found' });
        } else {
            res.send(bookmarkSearch);
        }
    })
    .delete((req, res) => {
        const id = req.params.id;
        let bookmarkList = store.bookmarks;

        let bmIndex = bookmarkList.findIndex(bm => bm.id === id);
        bookmarkList.splice(bmIndex, 1);
        res.status(204).end(`List with id ${id} deleted.`);
    });

module.exports = bmRouter;
