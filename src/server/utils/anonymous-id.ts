import md5 from 'md5';
import { Request } from 'express'
import crypto from 'crypto'
import { getRealUserIpAddress } from "./ip-address";

/**
 * Generate a one-way hash to anonymously identify a user
 *
 * Based on user variables, like: ip address, browser, language etc...
 *
 * Idea taken from: https://usefathom.com/news/anonymization
 *
 * @param req
 * @param publisherId
 */
export const getAnonymousId = (req: Request, publisherId?: string): string => {
  const ipAddressOfUser = getRealUserIpAddress(req);
  const userAgent = req.get('User-Agent');
  const userAcceptLanguage = req.get('Accept-Language');
  const userAccept = req.get('Accept');
  const userDoNotTrack = req.get('DNT');

  const dataToHash = ipAddressOfUser + userAgent + userAcceptLanguage + userAccept + userDoNotTrack + publisherId;

  // Create a unique key based on the user browser data
  // This is not perfect, but this might be the closest we get to a unique user
  const hash = md5(crypto.createHash('sha1').update(dataToHash).digest('base64'));

  return hash;
}
