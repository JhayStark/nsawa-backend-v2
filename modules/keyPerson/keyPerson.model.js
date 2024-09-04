const { Schema, model, default: mongoose } = require('mongoose');

const keyPersonSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    relation: {
      type: String,
      required: true,
    },
    funeralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Funeral',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // donations: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Donation',
    // },
    // totalDonations: {
    //   type: Number,
    //   default: 0,
    // },
  },
  { timestamps: true }
);

module.exports = model('KeyPerson', keyPersonSchema);
