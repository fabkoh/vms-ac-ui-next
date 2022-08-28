const { createServer } 	= require('http')
const { parse } 		= require('url')
const next 				= require('next')
const cookie 			= require('cookie');

const Cookies 			= require('cookies');
const request 			= require('request');

const dev 		= process.env.NODE_ENV !== 'production'

const hostname  = '0.0.0.0'
const port 		= (dev) ? 3000 : 3000;
const app 		= next({ dev, hostname, port })
const handle 	= app.getRequestHandler()

function forward(req, res) {
	const cookies 					= new Cookies(req, res)
	const webVideoCtrlProxy = cookies.get('webVideoCtrlProxy')

	function process_response(error, response, body) {
		console.log('error:', error);
		console.log('statusCode:', response && response.statusCode);
		console.log("body", body);

		for (const key of Object.keys(response.headers)) {
			res.setHeader(key, response.headers[key]);
		}
		
		res.write(body);
		res.end();
	}

	if(webVideoCtrlProxy) {
		const keys = {
			url: 			`http://${webVideoCtrlProxy}${req.url}`,
			headers: 	req.headers,
			method: 	req.method 
		}

		let body = [];
		req.on('data', (chunk) => {
		  body.push(chunk);
		}).on('end', () => {
		  body = Buffer.concat(body).toString();
		  if (typeof req.body !== "object" || Object.keys(req.body).length > 0) {
				keys['body'] = body
			}

			console.log("req.body", req.body)

			request(keys, process_response);
		});
	}
}

app.prepare().then(() => {
	createServer(async (req, res) => {
		try {
			// Be sure to pass `true` as the second argument to `url.parse`.
			// This tells it to parse the query portion of the URL.
			const parsedUrl = parse(req.url, true)
			const { pathname, query } = parsedUrl

			if (pathname.indexOf("ISAPI/") !== -1 || pathname.indexOf("/SDK") !== -1) {
				forward(req, res);
			} else {
				await handle(req, res, parsedUrl)
			}
		} catch (err) {
			console.error('Error occurred handling', req.url, err)
			res.statusCode = 500
			res.end('internal server error')
		}
	}).listen(port, (err) => {
		if (err) throw err
		console.log(`> Ready on http://${hostname}:${port}`)
	})
})