const { Schema, model, default: mongoose } = require("mongoose");

const memoriesSchema = new Schema(
  {
    memory: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    funeralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Funeral",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Memories", memoriesSchema);
