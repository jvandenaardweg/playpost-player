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
export const getAnonymousUserId = (req: Request): string => {
  // If there's a anonymousId as a cookie, use that one
  if (req.cookies.anonymousUserId) {
    return req.cookies.anonymousUserId
  }

  // Else, as a fallback, generate a ID based on the info we have

  const alternativeAnonymousUserId = createAlternativeAnonymousUserId(req);

  return alternativeAnonymousUserId;
}

/**
 * Creates a unique anonymousUserId to track users behind a shared ip address.
 */
export const createAnonymousUserId = () => {
  const valueToHash = crypto.randomBytes(32).toString('hex'); // Generate some random value
  const anonymousUserId = md5(valueToHash); // md5 it so we can identify it as an md5 value, not just some random value

  return anonymousUserId
}

/**
 * If we do not have a cookie in the request, create an alternative anonymousUserId.
 *
 * Downside of this method is it could possible multiple users behind a shared ip address get the same ID.
 *
 * @param req
 */
export const createAlternativeAnonymousUserId = (req: Request): string => {
  const ipAddressOfUser = getRealUserIpAddress(req);
  const userAgent = req.get('User-Agent');
  const userAcceptLanguage = req.get('Accept-Language');
  const userAccept = req.get('Accept');
  const userDoNotTrack = req.get('DNT');

  const dataToHash = ipAddressOfUser + userAgent + userAcceptLanguage + userAccept + userDoNotTrack;

  // Create a unique key based on the user browser data
  // This is not perfect, but this might be the closest we get to a unique user
  const valueToHash = crypto.createHash('sha1').update(dataToHash).digest('base64');
  const alternativeAnonymousUserId = md5(valueToHash); // md5 it so we can identify it as an md5 value, not just some random value

  return alternativeAnonymousUserId;
}
