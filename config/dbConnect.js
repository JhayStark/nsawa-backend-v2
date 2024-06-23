const { connect } = require('mongoose');

async function dbConnect() {
  let MONGO_URI = process.env.MONGO_URI;

  if (process.env.NODE_ENV !== 'production') {
    MONGO_URI = process.env.MONGO_URI_LOCAL;
  }
  try {
    const connection = await connect(MONGO_URI);
    console.log(`Database Connected at ${connection.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = dbConnect;
