import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    gigName: {
      type: String,
      required: true,
      trim: true,
    },
    gigContractAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    gigDescription: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    budget: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Number,
      required: true,
    },
    clientAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    clientUID: {
      type: String,
      required: true,
    },
    freelancerUID: {
      type: String,
    },
    freelancerAddress: {
      type: String,
      lowercase: true,
    },
    isAccepted: {
      type: Boolean,
    },
    AggrementUid: {
      type: String,
      unique: true,
    },
    AIAttestationUID: {
      type: String,
      unique: true,
    },
    AIScore: {
      type: Number,
    },
    isDisputeRaised: {
      type: Boolean,
    },
    disputeAttestationUID: {
      type: String,
      unique: true,
    },
    disputeDescription: {
      type: String,
    },
    isDisputed: {
      type: Boolean,
    },
    decision: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "gigs",
  }
);

export const Gig = mongoose.model("Gig", gigSchema);
