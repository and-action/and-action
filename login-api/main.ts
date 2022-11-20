import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const githubOAuthBaseUrl = 'https://github.com/login/oauth';
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubApiScopes = 'repo read:org';

const serverPort = 3000;

const app = express();
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: 'GET',
  })
);
app.use(bodyParser.json());

app.get('/auth', (_, res) =>
  res.redirect(
    `${githubOAuthBaseUrl}/authorize?client_id=${githubClientId}&scope=${encodeURIComponent(
      githubApiScopes
    )}`
  )
);

app.get('/access_token', (req, res) =>
  fetch(`${githubOAuthBaseUrl}/access_token`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code: req.query.code,
    }),
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((jsonBody) => res.json(jsonBody))
);

app.listen(serverPort, () =>
  console.log(`🎬 AndAction login api listening on port ${serverPort}!`)
);
