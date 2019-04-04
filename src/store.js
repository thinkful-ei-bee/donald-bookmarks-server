const uuid = require('uuid/v4');

const bookmarks = [
    {
        id: uuid(),
        title: 'Google',
        url: 'http://google.com',
        desc: 'An indie search engine startup',
        rating: 4
    },
    {
        id: uuid(),
        title: 'Fluffiest Cats in the World',
        url: 'http://medium.com/bloggerx/fluffiest-cats-334',
        desc: 'The only list of fluffy cats online',
        rating: 5
    }
];

module.exports = { bookmarks };
