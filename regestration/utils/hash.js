const { createHmac } = require('crypto')
const bcrypt = require("bcrypt");

exports.dohash = async (value, saltvalue) => {
    return await bcrypt.hash(value, saltvalue);
};

exports.doHashValidation = async (value, hashedvalue) => {
    return await bcrypt.compare(value, hashedvalue);
};

exports.hmacprocess = (value, key) => {
    const result = createHmac('sha256', key).update(value).digest('hex');
    return result
}