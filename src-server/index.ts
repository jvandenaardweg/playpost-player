import express, { Request, Response } from 'express'
import path from 'path';
import ejs from 'ejs';
import nodeFetch from 'node-fetch';
import { Api } from '../@types/playpost-api';

const app = express();

// Set custom ejs delimiter
// Use: <$- article $>
ejs.delimiter = '$';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'))

app.use(express.static(path.join(__dirname, '../build-frontend')));

app.get('/ping', (req: Request, res: Response) => {
  return res.send('pong');
});

app.get('/articles/:articleId/audiofiles/:audiofileId', async (req: Request, res: Response) => {
  const { articleId, audiofileId } = req.params;

  if (!articleId) {
    const errorPageRendered = await ejs.renderFile(__dirname + '/pages/error.ejs', {
      title: 'Oops!',
      description: 'Please given an article ID.'
    })

    return res.status(400).send(errorPageRendered);
  }

  if (!audiofileId) {
    const errorPageRendered = await ejs.renderFile(__dirname + '/pages/error.ejs', {
      title: 'Oops!',
      description: 'Please given an audiofile ID for the article.'
    })

    return res.status(400).send(errorPageRendered);
  }

  try {
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
      const errorPageRendered = await ejs.renderFile(__dirname + '/pages/error.ejs', {
        title: 'Oops!',
        description: 'Could not find the audiofile in the article data.'
      })
      return res.status(404).send(errorPageRendered);
    }

    // Render the embed page with the article API data inside, so React can use that data to render the player
    const embedPageRendered = await ejs.renderFile(__dirname + '/../build-frontend/index.ejs', {
      title: article.title,
      article: JSON.stringify(article),
      audiofile: JSON.stringify(audiofile),
    })

    // Send the HTML page to the user
    return res.send(embedPageRendered)
  } catch (err) {
    const isApiUnavailable = err && err.code === 'ECONNREFUSED'
    const errorMessage = err && err.message

    console.log(err)

    const title = isApiUnavailable ? 'Playpost API not available.' : 'Oops!'
    const description = errorMessage ? errorMessage : isApiUnavailable ? 'Could not connect to the Playpost API to get the article data.' : 'An unknown error happened. Please reload the page.'

    const errorPageRendered = await ejs.renderFile(__dirname + '/pages/error.ejs', {
      title,
      description
    })

    if (isApiUnavailable) {
      return res.status(503).send(errorPageRendered);
    }

    return res.status(500).send(errorPageRendered);
  }

});

const port = process.env.PORT || 8080;

console.log('Server init on port:', port);

app.listen(port);
