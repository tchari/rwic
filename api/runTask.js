const fetchStockValues = require('./Tasks/fetchStockValue');

try {
    fetchStockValues();
} catch (e) {
    console.log(e);
}
