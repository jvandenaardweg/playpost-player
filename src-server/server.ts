import express, { Request, Response } from 'express'
// import bodyParser from 'body-parser';
import path from 'path';
import ejs from 'ejs';
import nodeFetch from 'node-fetch';
import { Api } from '../src/typings/playpost-api';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'))

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', (req: Request, res: Response) => {
  return res.send('pong');
});

app.get('/articles/:articleId', async (req: Request, res: Response) => {
  const { articleId } = req.params;

  if (!articleId) {
    return res.status(400).send('Please give an article ID.');
  }

  // TODO: check if we have a cached HTML version

  // TODO: cache endpoint
  try {
    const article = await nodeFetch(`https://api.playpost.app/v1/articles/${articleId}`, {
      method: 'get'
    }).then(response => response.json())

    // TODO: cache

    return article;
    // return res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } catch (err) {
    return res.status(500).send('An error happened.');
  }

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

    // TODO: First, check if we have a cached HTML version in Redis (Embed:Article:1231231231233313)

    // If there is no cached version, do an API call to get the article and audiofile data
    const response = await nodeFetch(`http://localhost:3000/v1/articles/${articleId}`, {
      method: 'get',
      headers: {
        'X-Api-Key': '6892e59af722a2afa7147b348ba71100e56351bf3689cebc155c22db5b8c1d70',
        'X-Api-Secret': 'f793d030c8062b5e1342ff9fcad0fc8177a966e61c809b02f2f207a473eeaf9a'
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
    const embedPageRendered = await ejs.renderFile(__dirname + '/pages/embed.ejs', {
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
