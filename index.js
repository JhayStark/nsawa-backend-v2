const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
const credentials = require('./config/credentials');
const { corsOptions, allowedOrigins } = require('./config/corsOptions');
const { verifyToken } = require('./config/JWT');
const { authRouter } = require('./modules/auth/auth.routes');
const { funeralRouter } = require('./modules/funerals/funeral.route');
const { keyPersonRouter } = require('./modules/keyPerson/keyPerson.route');
const { donationRouter } = require('./modules/donations/donations.route');
const { publicDonationRouter } = require('./modules/donations/public.route');
const { publicFuneralRouter } = require('./modules/funerals/public.route');
const { publicKeyPersonRouter } = require('./modules/keyPerson/public.route');
const publicRouter = require('./modules/public/public.route');

dotenv.config();
const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(credentials);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

const port = process.env.PORT || 3001;

app.use('/auth', authRouter);
app.use('/donations/public', publicDonationRouter);
app.use('/funerals/public', publicFuneralRouter);
app.use('/key-persons/public', publicKeyPersonRouter);
app.use('/pub', publicRouter);
app.use('/funeral', verifyToken, funeralRouter);
app.use('/key-person', verifyToken, keyPersonRouter);
app.use('/donation', verifyToken, donationRouter);

(async function start() {
  await dbConnect();
  app.listen(port, () => {
    console.log(`Server is running on:${port}`);
  });
})();
