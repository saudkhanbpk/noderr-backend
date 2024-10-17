import mongoose from "mongoose";

const Schema = mongoose.Schema;

const addFaqSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
})

const addFaq = mongoose.model("Faq", addFaqSchema);
export default addFaq;
