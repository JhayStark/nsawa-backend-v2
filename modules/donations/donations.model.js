const { Schema, model } = require('mongoose');
const donationsSchema = new Schema(
  {
    donorName: {
      type: String,
      required: true,
    },
    keyPerson: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'KeyPerson',
    },
    funeralId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Funeral',
    },
    modeOfDonation: {
      type: String,
      enum: ['Momo', 'Cash'],
      required: true,
    },
    donorPhoneNumber: {
      type: String,
      require: true,
    },
    donorEmail: {
      type: String,
      require: true,
    },
    amountDonated: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Donation', donationsSchema);
