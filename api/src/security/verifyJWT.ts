import decodeJWT from './decodeJWT';

export function verifyJWT(token: string) {
    const decoded = decodeJWT(token);
    //Need to add signature checking logic here

    // Also need to add checks to confirm if the claims are valid (e.g. expiry date, appid, oid, tenantid, scp, iss etc)
    // https://jwt.ms/

    return decoded;
};