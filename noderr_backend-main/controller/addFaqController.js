import addFaq from "../models/faqModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";


const createAddFaq = TryCatch(async (req, res, next) => {
  const { question, answer } = req.body;
  const faq = await addFaq.create({
    question,
    answer,
  });
  res.status(201).json({
    status: "success",
    message: "FAQ created successfully",
    data: {
      faq,
    },
  });
}
);

const getAddFaq = TryCatch(async (req, res, next) => {
  const faq = await addFaq.find();
  res.status(200).json({
    status: "success",
    data: {
      faq,
    },
  });
}
);

const updateAddFaq = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  const faq = await addFaq.findByIdAndUpdate(id, {
    question,
    answer,
  }, {
    new: true,
  });
  if (!faq) {
    return next(new ErrorHandler("FAQ not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "FAQ updated successfully",
    data: {
      faq,
    },
  });
}
);

const deleteAddFaq = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const faq = await addFaq.findByIdAndDelete(id);
  if (!faq) {
    return next(new ErrorHandler("FAQ not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "FAQ deleted successfully",
    data: {},
  });
}
);


export { createAddFaq, getAddFaq, updateAddFaq, deleteAddFaq };