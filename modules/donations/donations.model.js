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
      enum: ['Cash', 'Online'],
      required: true,
    },
    donorPhoneNumber: {
      type: String,
      require: true,
    },
    amountDonated: {
      type: Number,
      required: true,
    },
    announcement: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    reference: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = model('Donation', donationsSchema);
