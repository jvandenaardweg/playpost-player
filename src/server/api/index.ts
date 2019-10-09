import nodeFetch from 'node-fetch';
import { Api } from '../../@types/playpost-api';

export const findArticleById = async (articleId: string, audiofileId: string): Promise<{article: Api.Article, audiofile: Api.Audiofile}> => {
  console.log(articleId, `Getting article from API...`)

  const response = await nodeFetch(`${process.env.API_URL}/v1/articles/${articleId}`, {
    method: 'get',
    headers: {
      'X-Api-Key': process.env.API_KEY || '',
      'X-Api-Secret': process.env.API_SECRET || ''
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
