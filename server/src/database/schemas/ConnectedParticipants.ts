import { Schema, model, type Document } from "mongoose";

export interface IConnectedParticipants extends Document {
  socket_id: string;
  room: string;
  name: string;
  text: string;
  isHost: boolean;
  created_at: Date;
}

const ConnectedParticipantsSchema = new Schema({
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
  isHost: {
    type: Boolean,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const ConnectedParticipants = model<IConnectedParticipants>(
  "connectedParticipants",
  ConnectedParticipantsSchema
);

export { ConnectedParticipants };
