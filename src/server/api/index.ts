import nodeFetch from 'node-fetch';
import { Api } from '../../@types/playpost-api';

import { logger } from '../utils/logger';

interface CachedArticlePromise {
  [key: string]: Promise<FindArticleByIdResult>
}

interface CachedAudiofilePromise {
  [key: string]: Promise<Api.Audiofile>
}

interface FindArticleByIdResult {
  article: Api.Article,
  audiofile: Api.Audiofile
}

const cachedArticlePromises: CachedArticlePromise = {};
const cachedAudiofilePromises: CachedAudiofilePromise = {};

/**
 * This method makes sure we re-use any active promise already happening.
 * For example: when 10 calls are made, but the promise did not resolve yet, we'll use the same promise.
 * So we do not fire massive amounts of calls to the API for the exact same data on high traffic websites.
 *
 * @param articleId
 * @param audiofileId
 */
export const cachedFindArticleById = async (articleId: string, audiofileId: string, requesterIpAddress: string): Promise<FindArticleByIdResult> => {
  const id = articleId + audiofileId;

  // Re-use the promise if it exists
  if (cachedArticlePromises[id]) {
    logger.info(articleId, `Promise did not resolve yet. Re-using promise...`);
    return cachedArticlePromises[id]
  }

  // Add the promise if it does not exist yet
  const promise = findArticleById(articleId, audiofileId, requesterIpAddress)
  .then((result) => {
    // Delete promise from cache if it succeeds
    delete cachedArticlePromises[id]
    return result;
  })
  .catch((err) => {
    // Delete promise from cache on error
    delete cachedArticlePromises[id]
    throw err;
  })

  // Cache the promise and re-use it until it get's fulfilled
  return cachedArticlePromises[id] = promise;
}

export const cachedGetAudiofileById = async (audiofileId: string, requesterIpAddress: string): Promise<Api.Audiofile> => {
  const id = audiofileId;

  // Re-use the promise if it exists
  if (cachedAudiofilePromises[id]) {
    logger.info(audiofileId, `Promise did not resolve yet. Re-using promise...`);
    return cachedAudiofilePromises[id]
  }

  // Add the promise if it does not exist yet
  const promise = getAudiofileById(audiofileId, requesterIpAddress)
  .then((result) => {
    // Delete promise from cache if it succeeds
    delete cachedAudiofilePromises[id]
    return result;
  })
  .catch((err) => {
    // Delete promise from cache on error
    delete cachedAudiofilePromises[id]
    throw err;
  })

  // Cache the promise and re-use it until it get's fulfilled
  return cachedAudiofilePromises[id] = promise;
}

/**
 * Method to get the article details from the API.
 *
 * @param articleId
 * @param audiofileId
 */
export const findArticleById = async (articleId: string, audiofileId: string, requesterIpAddress: string): Promise<FindArticleByIdResult> => {
  logger.info(articleId, `Getting article from API...`);

  const response = await nodeFetch(`${process.env.API_URL}/v1/articles/${articleId}`, {
    method: 'get',
    headers: {
      'X-Api-Key': process.env.API_KEY || '',
      'X-Api-Secret': process.env.API_SECRET || '',
      'X-Forwarded-For': requesterIpAddress // Add this header, so we can re-use our API rate limiting properly
    }
  })

  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.message ? json.message : 'Did not got ok from api')
  }

  const article: Api.Article = await response.json()

  // Find the audiofile using the audiofileId from the url param
  const audiofile = article.audiofiles.find(audiofile => audiofile.id === audiofileId);

  if (!audiofile) {
    throw new Error('Could not find the audiofile in the article data.');
  }

  return {
    article,
    audiofile
  }
}

export const getAudiofileById = async (audiofileId: string, requesterIpAddress: string): Promise<Api.Audiofile> => {
  logger.info(audiofileId, `Getting audiofile from API...`);

  const response = await nodeFetch(`${process.env.API_URL}/v1/audiofiles/${audiofileId}`, {
    method: 'get',
    headers: {
      'X-Api-Key': process.env.API_KEY || '',
      'X-Api-Secret': process.env.API_SECRET || '',
      'X-Forwarded-For': requesterIpAddress // Add this header, so we can re-use our API rate limiting properly
    }
  })

  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.message ? json.message : 'Did not got ok from api')
  }

  return response.json()
}
