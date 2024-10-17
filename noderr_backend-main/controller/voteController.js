import Vote from "../models/voteModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

const createPool = TryCatch(async (req, res, next) => {
  const { voteTitle, voteOptions, durationInDays } = req.body;
  const endTime = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);
  const vote = await Vote.create({
    voteTitle,
    voteOptions,
    endTime,
  });
  res.status(201).json({
    status: "success",
    data: {
      vote,
    },
  });
});

const updatePoll = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { voteTitle, voteOptions, durationInDays } = req.body;
  if (!voteTitle || !voteOptions || !durationInDays) {
    return next(new ErrorHandler("All fields are required", 400));
  }
  const endTime = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);
  const vote = await Vote.findByIdAndUpdate(
    id,
    {
      voteTitle,
      voteOptions,
      endTime,
    },
    {
      new: true,
    }
  );
  if (!vote) {
    return next(new ErrorHandler("Vote not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      vote,
    },
  });
});

const deletePoll = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const vote = await Vote.findByIdAndDelete(id);
  if (!vote) {
    return next(new ErrorHandler("Vote not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: vote,
  });
});

const casteVoteByUser = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { optionIndex } = req.body;
  const vote = await Vote.findById(id);
  if (!vote) {
    return next(new ErrorHandler("Vote not found", 404));
  }
  if (vote.endTime < Date.now()) {
    return next(new ErrorHandler("Voting has ended", 400));
  }
  if (optionIndex >= vote.voteOptions.length) {
    return next(new ErrorHandler("Invalid option index", 400));
  }
  const userVote = vote.votes.find(
    (vote) => vote.userId.toString() === req.user.id
  );
  if (userVote) {
    return next(new ErrorHandler("You have already voted", 400));
  }
  vote.votes.push({ userId: req.user.id, optionIndex });
  await vote.save();
  res.status(200).json({
    status: "success",
    data: vote,
  });
});

const getPolls = TryCatch(async (req, res, next) => {
  const votes = await Vote.find();
  res.status(200).json({
    status: "success",
    data: votes,
  });
});
const getSinglePoll = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const vote = await Vote.findById(id);
  if (!vote) {
    return next(new ErrorHandler("Vote not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: vote,
  });
});
const userVote = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const vote = await Vote.findById(id);
  if (!vote) {
    return next(new ErrorHandler("Vote not found", 404));
  }
  const userVote = vote.votes.find(
    (vote) => vote.userId.toString() === req.user.id
  );
  if (!userVote) {
    return next(new ErrorHandler("You have not voted", 400));
  }
  res.status(200).json({
    status: "success",
    data: userVote,
  });
});

export {
  createPool,
  deletePoll,
  updatePoll,
  casteVoteByUser,
  userVote,
  getPolls,
  getSinglePoll,
};
