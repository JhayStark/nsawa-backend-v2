const router = require('express').Router;
const { getSingleFuneral } = require('./funeral.controller');

const publicFuneralRouter = router();

publicFuneralRouter.get('/:id', getSingleFuneral);

module.exports = {
  publicFuneralRouter,
};
