import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.set('view engine', 'ejs'); // Set the view engine to EJS

app.get('/', async (req, res) => {
	const products = await getProducts();
	console.log(products);
	const markup = products
		.map(
			(p) =>
				`<a style="display: block; color: black; border: solid 2px black; margin: 20px; padding: 10px;" href="/products/${p.id}">${p.title} - ${p.price}</a>`
		)
		.join(' ');
	res.send(markup);
});

app.get('/products/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const product = await getProduct(id);
		const klarnaRsponse = await createOrder(product);
		const markup = klarnaRsponse.html_snippet;
		// const markup = `<h1>${product.title} - ${product.price} kr </h1> `;
		res.send(markup);
	} catch (error) {
		res.send(error.message);
	}
});

app.get('/confirmation', async (req, res) => {
	try {
		const { order_id } = req.query;
		const getKlarnaAuth = await retrieveOrder(order_id);
		const { html_snippet } = getKlarnaAuth;
		// const markup = `<h1>Hello confirmation</h1>`;
		res.send(html_snippet);
	} catch (error) {
		res.send(error.message);
	}
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
