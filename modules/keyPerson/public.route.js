const router = require('express').Router;
const { getAllKeyPersonsForFuneral } = require('./keyPerson.controller');

const publicKeyPersonRouter = router();

publicKeyPersonRouter.get('/:id', getAllKeyPersonsForFuneral);

module.exports = { publicKeyPersonRouter };
