import http from 'http';
import { parse } from 'url';
import { handler as incidentsHandler } from './handlers/incidents';
import { handler as sosHandler } from './handlers/sos';
import { handler as rescueHandler } from './handlers/rescue';
import { handler as sheltersHandler } from './handlers/shelters';
import { handler as alertsHandler } from './handlers/alerts';
import { handler as statsHandler } from './handlers/stats';
import { handler as uploadsHandler } from './handlers/uploads';

const PORT = process.env.PORT || 3001;

function toLambdaEvent(req: http.IncomingMessage, body: string, pathname: string, query: any) {
  const parts = pathname.replace(/^\/api/, '').split('/').filter(Boolean);
  let pathParams: Record<string, string> | undefined = undefined;

  // Extract ID if at the end: e.g. /incidents/123 -> id = 123
  if (parts.length >= 2 && !pathname.includes('/rescue/teams')) {
    pathParams = { id: parts[1] };
  } else if (pathname.includes('/rescue/teams') && parts.length >= 3) {
    pathParams = { id: parts[2] };
  }

  return {
    httpMethod: req.method || 'GET',
    path: pathname.replace(/^\/api/, ''),
    headers: req.headers as Record<string, string>,
    queryStringParameters: query,
    pathParameters: pathParams,
    body: body || null,
  };
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role, x-user-name, x-user-id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = parse(req.url || '/', true);
  const pathname = parsedUrl.pathname || '/';
  const query = parsedUrl.query;

  // Read request body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const lambdaEvent = toLambdaEvent(req, body, pathname, query);
      let lambdaRes: any = null;

      if (pathname.startsWith('/api/incidents')) {
        lambdaRes = await incidentsHandler(lambdaEvent);
      } else if (pathname.startsWith('/api/sos')) {
        lambdaRes = await sosHandler(lambdaEvent);
      } else if (pathname.startsWith('/api/rescue')) {
        lambdaRes = await rescueHandler(lambdaEvent);
      } else if (pathname.startsWith('/api/shelters') || pathname.startsWith('/api/resources')) {
        lambdaRes = await sheltersHandler(lambdaEvent);
      } else if (pathname.startsWith('/api/alerts')) {
        lambdaRes = await alertsHandler(lambdaEvent);
      } else if (pathname.startsWith('/api/stats')) {
        lambdaRes = await statsHandler(lambdaEvent);
      } else if (pathname.startsWith('/api/uploads')) {
        lambdaRes = await uploadsHandler(lambdaEvent);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Route ${pathname} not found on disaster API` }));
        return;
      }

      res.writeHead(lambdaRes.statusCode, { 'Content-Type': 'application/json' });
      res.end(lambdaRes.body);
    } catch (err: any) {
      console.error('Server error handling request:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[DisasterGuard Serverless API Server] Listening on http://localhost:${PORT}/api`);
  console.log(`[Storage Mode] Persistent JSON Disk Database Storage active in backend/data/disaster_database.json`);
});
