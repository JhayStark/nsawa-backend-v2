const axios = require('axios');

const confirmAccount = async (accountNumber, bankCode) => {
  return axios
    .get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
        },
      }
    )
    .then(res => res)
    .catch(err => err);
};

const getBanks = async (type = '') => {
  let url = 'https://api.paystack.co/bank?currency=GHS';
  if (type) {
    url = `${url}&type=${type}`;
  }

  console.log(url, 'test');
  return axios
    .get(url)
    .then(res => res)
    .catch(err => err);
};

const createRecipient = async recipient => {
  const data = {
    type: 'nuban',
    name: recipient?.name,
    account_number: recipient?.accountNumber,
    bank_code: recipient?.bankCode,
    currency: 'GHS',
  };

  const config = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transferrecipient',
    method: 'POST',
    headers: {
      Authorization: 'Bearer SECRET_KEY',
      'Content-Type': 'application/json',
    },
    data,
  };
  axios
    .post(config)
    .then(res => res)
    .catch(err => err);
};

module.exports = { confirmAccount, getBanks };
