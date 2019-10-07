import express, { Request, Response } from 'express'
// import bodyParser from 'body-parser';
import path from 'path';
import nodeFetch from 'node-fetch';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'))

declare namespace Api {
  interface Article {
    id: string;
    audiofiles: Audiofile[]
  }

  interface Audiofile {
    id: string;

  }
}

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
    return res.status(400).send('Please give an article ID.');
  }

  if (!audiofileId) {
    return res.status(400).send('Please give an audiofile ID.');
  }

  // TODO: check if we have a cached HTML version

  // TODO: cache endpoint
  try {
    const article: Api.Article = await nodeFetch(`http://localhost:3000/v1/articles/${articleId}`, {
      method: 'get',
      headers: {
        'X-Api-Key': '6892e59af722a2afa7147b348ba71100e56351bf3689cebc155c22db5b8c1d70',
        'X-Api-Secret': 'f793d030c8062b5e1342ff9fcad0fc8177a966e61c809b02f2f207a473eeaf9a'
      }
    }).then(response => response.json())

    const audiofile = article.audiofiles.find(audiofile => audiofile.id === audiofileId);

    if (!audiofile) {
      return res.status(404).send('Could not find the audiofile.');
    }

    return res.render('pages/embed', { article: JSON.stringify(article) });

    // return res.json(article)
    // TODO: cache

    return article;
    // return res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } catch (err) {
    return res.status(500).send('An error happened.');
  }

});

const port = process.env.PORT || 8080;

console.log('Server init on port:', port);

app.listen(process.env.PORT || 8080);
