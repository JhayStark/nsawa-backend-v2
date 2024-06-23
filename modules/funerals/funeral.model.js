const { Schema, model, default: mongoose } = require('mongoose');

const funeralSchema = new Schema(
  {
    nameOfFuneral: {
      type: String,
      required: true,
    },
    nameOfDeceased: {
      type: String,
      required: true,
    },
    ageOfDeceased: {
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
    // keyPersonalities: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "KeyPerson",
    // },
    // donations: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "Donation",
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // totalDonations: {
    //   type: Number,
    //   default: 0,
    // },
    // totalDonor: {
    //   type: Number,
    //   default: 0,
    // },
    // totalOnlineDonations: {
    //   type: Number,
    //   default: 0,
    // },
    status: {
      type: Boolean,
      default: false,
    },
    imageOfDeceased: {
      type: String,
    },
  },
  { timestamps: true }
);

funeralSchema.index({ nameOfDeceased: 1, startDate: 1 }, { unique: true });

module.exports = model('Funeral', funeralSchema);
