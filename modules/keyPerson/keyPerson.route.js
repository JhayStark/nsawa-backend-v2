const router = require('express').Router;
const {
  createKeyPerson,
  editKeyPerson,
  getAllKeyPersons,
  getAllKeyPersonsForFuneral,
  getSingleKeyPerson,
  deleteKeyPerson,
} = require('./keyPerson.controller');

const keyPersonRouter = router();

keyPersonRouter.post('/create', createKeyPerson);
keyPersonRouter.patch('/edit/:id', editKeyPerson);
keyPersonRouter.get('/all', getAllKeyPersons);
keyPersonRouter.get('/funeral/:id', getAllKeyPersonsForFuneral);
keyPersonRouter.get('/person/:id', getSingleKeyPerson);
keyPersonRouter.delete('/delete/:id', deleteKeyPerson);

module.exports = { keyPersonRouter };
