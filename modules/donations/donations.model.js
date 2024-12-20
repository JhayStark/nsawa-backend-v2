const { Schema, model } = require('mongoose');
const donationsSchema = new Schema(
  {
    donorName: {
      type: String,
      required: true,
    },
    keyPerson: {
      type: Schema.Types.ObjectId,
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
    announced: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    reference: {
      type: String,
    },
    thankYouMessageStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model('Donation', donationsSchema);
