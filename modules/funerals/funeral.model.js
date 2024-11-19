const { Schema, model, default: mongoose } = require('mongoose');

const funeralSchema = new Schema(
  {
    familyName: {
      type: String,
    },
    nameOfDeceased: {
      type: String,
      required: true,
    },
    yearOfBirth: {
      type: Number,
      require: true,
    },
    yearOfDeath: {
      type: Number,
      require: true,
    },
    phoneNumber: {
      type: String,
    },
    funeralLocation: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: Boolean,
      default: true,
    },
    imagesOfDeceased: {
      type: [String],
    },
    bannerImage: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    lastPaymentSubscriptionReference: {
      type: Object,
    },
  },
  { timestamps: true }
);

funeralSchema.index({ nameOfDeceased: 1, startDate: 1 });

module.exports = model('Funeral', funeralSchema);
