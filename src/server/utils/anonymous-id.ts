import md5 from 'md5';
import { Request } from 'express'
import { getRealUserIpAddress } from "./ip-address";

export const createAnonymousId = (req: Request) => {
  const ipAddressOfUser = getRealUserIpAddress(req);
  const userAgent = req.get('User-Agent');
  const userAcceptLanguage = req.get('Accept-Language');
  const userAccept = req.get('Accept');

  // Create a unique key based on the user browser data
  // This is not perfect, but this might be the closest we get to a unique user
  // TODO: use hash, not md5
  return md5(ipAddressOfUser + userAgent + userAcceptLanguage + userAccept);
}
