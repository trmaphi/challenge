const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');

// https://elements.heroku.com/addons/heroku-postgresql
// Create base on Hobby Dev plan
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV !== "production" ? false : {
    rejectUnauthorized: false,
  },
});

const requestListener = function (req, resp) {
  let extname = path.extname(req.url);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
  }

  let urlPath = path.resolve(req.url)
  if (urlPath == '/') {
    urlPath = path.join(__dirname, './public/index.html')
  }

  let ipaddress = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress).split(",")[0];

  if (ipaddress) {
    // Asynchorously save visit
    // Every request save into visits include one visit with multiple requests
    pool.query('INSERT INTO visits(access_time, ip) VALUES($1, $2) RETURNING *', [new Date().toISOString(), ipaddress])
      .then(res => {
        console.log("Save visit: ", res.rows[0]);
      })
      .catch(error => {
        console.log("save visit error"); 
        console.error(error);
      })
  }


  if (urlPath.startsWith('/api/v1')) {
    if (urlPath.startsWith('/api/v1/visits')) {
      const parsedUrl = url.parse(urlPath, true)

      if (parsedUrl.query['by'] == 'rank') {
        pool.query('SELECT ip, count(ip) FROM visits GROUP BY ip LIMIT $1', [parsedUrl.query['top'] || 100])
          .then(res => {
            resp.writeHead(200, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify(res.rows))
          })
          .catch(error => {
            console.log("query by rank error")
            console.error(error)
            resp.writeHead(500);
            resp.end('Sorry, check with the site admin for error: ..\n');
          })
      } else {
        pool.query('SELECT * FROM visits ORDER BY access_time LIMIT $1', [parsedUrl.query['top'] || 100])
          .then(res => {
            resp.writeHead(200, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify(res.rows));
          })
          .catch(error => {
            console.log("query by recent error");
            console.error(error);
            resp.writeHead(500);
            resp.end('Sorry, check with the site admin for error: ..\n');
          })
      }
    }
  } else {
    // Can use stream, but html files are too small, not worth it.
    fs.readFile(urlPath, function (error, content) {
      if (error) {
        if (error.code == 'ENOENT') {
          fs.readFile(path.join(__dirname, './public/404.html'), function (error, content) {
            resp.writeHead(200, { 'Content-Type': contentType });
            resp.end(content, 'utf-8');
          });
        }
        else {
          resp.writeHead(500);
          resp.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
        }
      }
      else {
        resp.writeHead(200, { 'Content-Type': contentType });
        resp.end(content, 'utf-8');
      }
    });
  }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);