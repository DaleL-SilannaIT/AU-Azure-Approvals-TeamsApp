import decodeJWT from './decodeJWT';

export async function verifyJWT(token: string) {
    const decoded = await decodeJWT(token);
    //console.log('Decoded token:', decoded);
    //Need to add signature checking logic here

    // Also need to add checks to confirm if the claims are valid (e.g. expiry date, appid, oid, tenantid, scp, iss etc)
    // https://jwt.ms/

    return decoded;
};