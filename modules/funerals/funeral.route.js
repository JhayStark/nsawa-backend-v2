const router = require('express').Router;
const {
  createFuneral,
  editFuneral,
  getAllFunerals,
  getSingleFuneral,
  deleteFuneral,
  sendMessages,
} = require('./funeral.controller');

const funeralRouter = router();

funeralRouter.post('/create', createFuneral);
funeralRouter.get('/all-funerals', getAllFunerals);
funeralRouter.delete('/delete', deleteFuneral);
funeralRouter.post('/send-message', sendMessages);
funeralRouter.patch('/edit/:id', editFuneral);
funeralRouter.get('/:id', getSingleFuneral);

module.exports = {
  funeralRouter,
};
