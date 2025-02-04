const jwt = require('jsonwebtoken');
const axios = require('axios');

export default function decodeJWT(token: string) {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
        throw new Error('Invalid token');
    }

    return decoded;
}