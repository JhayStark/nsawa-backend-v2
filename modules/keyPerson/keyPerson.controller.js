const KeyPerson = require('./keyPerson.model');
const Funeral = require('../funerals/funeral.model');

const createKeyPerson = async (req, res) => {
  try {
    const funeral = await Funeral.findById(req.body.funeralId);
    if (!funeral) return res.status(404).json('Funeral not found');
    const person = await KeyPerson.create({
      ...req.body,
      createdBy: req.user.id,
    });
    if (person) {
      return res.status(200).json('Key person created');
    }
    res.status(404).json('Key Person not created');
  } catch (error) {
    res.status(500).json(error);
  }
};

const editKeyPerson = async (req, res) => {
  const keyPersonId = req.params.id;
  try {
    const person = await KeyPerson.findById(keyPersonId);
    if (!person) return res.status(404).json('Key person not found');
    await person.updateOne({
      $set: req.body,
    });
    res.status(200).json('User Updated');
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllKeyPersons = async (req, res) => {
  const userId = req.user.id;
  const search = req.query.search || '';
  const pageSize = req.query.pageSize || 10;
  const pageNumber = req.query.pageNumber || 1;
  const skip = (pageNumber - 1) * pageSize;
  try {
    const filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { relation: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
    };

    if (userId) {
      filter.createdBy = userId;
    }

    const total = await KeyPerson.countDocuments(filter);
    const persons = await KeyPerson.find(filter)
      .sort({
        createdAt: -1,
      })
      .limit(pageSize)
      .skip(skip);

    res.status(200).json({ persons, total, pageNumber, pageSize });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllKeyPersonsForFuneral = async (req, res) => {
  const funeralId = req.params.id;
  const search = req.query.search || '';
  const pageSize = req.query.pageSize || 10;
  const pageNumber = req.query.pageNumber || 1;
  const skip = (pageNumber - 1) * pageSize;
  try {
    const filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { relation: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
    };

    filter.funeralId = funeralId;

    const total = await KeyPerson.countDocuments(filter);
    const persons = await KeyPerson.find(filter)
      .sort({
        createdAt: -1,
      })
      .limit(pageSize)
      .skip(skip);

    res.status(200).json({ persons, total, pageNumber, pageSize });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getSingleKeyPerson = async (req, res) => {
  const keyPersonId = req.params.id;
  try {
    const person = await KeyPerson.findById(keyPersonId);
    if (!person) return res.status(404).json('Key person not found');
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteKeyPerson = async (req, res) => {
  const { keyPersonId } = req.query;
  try {
    const person = await KeyPerson.findByIdAndDelete(keyPersonId);
    if (!person) return res.status(404).send('No persons found');
    return res.status(200).send('Key Person deleted');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  createKeyPerson,
  editKeyPerson,
  getAllKeyPersons,
  getAllKeyPersonsForFuneral,
  getSingleKeyPerson,
  deleteKeyPerson,
};
