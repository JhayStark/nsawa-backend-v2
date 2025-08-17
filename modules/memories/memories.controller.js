const Memory = require("./memories.model");

const createMemory = async (req, res) => {
  try {
    const memory = await Memory.create(req.body);
    return res.status(201).json(memory);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getAllMemories = async (req, res) => {
  try {
    const funeralId = req.query.funeralId;
    const pageSize = req.query.pageSize;
    const pageNumber = req.query.pageNumber;

    if (pageSize && pageNumber) {
      const memories = await Memory.find({ funeralId })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
      const total = await Memory.countDocuments({ funeralId });
      return res.status(200).json({
        memories,
        total,
        pageSize,
        pageNumber,
      });
    }
    const memories = await Memory.find({ funeralId });
    return res.status(200).json(memories);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  createMemory,
  getAllMemories,
};
