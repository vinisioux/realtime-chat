import { Schema, model, type Document } from "mongoose";

export interface IPendingRequests extends Document {
  socket_id: string;
  room: string;
  name: string;
  requestStatus: string;
  created_at: Date;
}

const PendingRequestsSchema = new Schema({
  socket_id: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  requestStatus: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const PendingRequests = model<IPendingRequests>(
  "pendingRequests",
  PendingRequestsSchema
);

export { PendingRequests };
