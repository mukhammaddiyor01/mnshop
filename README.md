MNShop

Visit the live storefront

MNShop is an online marketplace with a TypeScript, Express, and MongoDB backend. It provides buyer and seller storefront features, an EJS-rendered admin area, and payment processing through Toss Payments.

Features

Buyers: browse products and sellers, create orders, like products, message sellers or admins, and view payment history.
Sellers: manage products and profile details, review orders and analytics, and message buyers or admins.
Admins: manage buyers, sellers, products, and settings; review orders and analytics; and communicate with users.

Requirements

Node.js 18 or newer
MongoDB
npm
Toss Payments test credentials for provider-backed payments

Getting started

Install dependencies:

npm install

Create a .env file in the project root and set the required values:

MONGO_URL=mongo db link here
SESSION_SECRET=replace-with-a-long-random-secret
TOSS_CLIENT_KEY=test_ck_replace_with_your_test_client_key
TOSS_SECRET_KEY=test_sk_replace_with_your_test_secret_key

Optional settings:

PORT=1213
BUYER_FRONTEND_URL=http://localhost:1214
SELLER_FRONTEND_URL=http://localhost:1215
FRONTEND_URL=http://localhost:1214
GOOGLE_CLIENT_ID=your-google-client-id
TOSS_MOCK_MODE=false

BUYER_FRONTEND_URL and SELLER_FRONTEND_URL configure allowed browser origins. FRONTEND_URL sets the payment return URL base; if omitted, the buyer frontend URL is used. The server defaults to port 1213, with buyer and seller origins defaulting to ports 1214 and 1215.

Start the server:

npm start

For development with automatic restarts, use npm run start:dev. npm run build compiles the TypeScript and copies static assets.

Payment flow

Payment endpoints require an authenticated buyer session. The usual Toss Payments flow is:

Create an order with POST /order/create.
Call POST /payment/prepare with the order's orderId and an optional payment method (defaults to card). The response contains the amount, customer key, Toss client key, provider order ID, and success/failure return URLs.
Use the Toss Payments client integration to collect payment and redirect to the returned URL.
On success, send the Toss paymentKey, provider orderId, and amount to POST /payment/confirm. The backend confirms the payment with Toss, checks the returned order and amount against the saved order, then marks the payment and order as paid.
Retrieve the buyer's payment records with GET /payment/all.

The provider order ID returned by /payment/prepare is distinct from the database order ID: it is formatted as MN*<order-id> and is the ID to use when confirming the provider payment. Provider-backed payments currently require Toss test client and secret keys (test_ck*/test*sk* or test*gck*/test*gsk* key pairs).

For local development only, set TOSS_MOCK_MODE=true while NODE_ENV is not production. Then /payment/prepare returns a mock-mode response and POST /payment/mock-confirm can mark the prepared payment as paid without contacting Toss. Mock payment is disabled in production.

Project scripts

Command
Description
npm start
Start the backend
npm run start:dev
Start the backend with nodemon
npm run build
Compile TypeScript and copy static assets
