const axios = require('axios');

async function testSearch() {
    try {
        const res = await axios.get('http://localhost:5005/api/donors/search', {
            params: { area: 'Ameerpet' }
        });
        console.log('Search results:', res.data);
    } catch (err) {
        console.error('Search failed:', err.message);
    }
}

testSearch();
