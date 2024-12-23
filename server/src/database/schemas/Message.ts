import { Schema, model, type Document } from "mongoose";

export interface IMessage extends Document {
  socket_id: string;
  room: string;
  name: string;
  text: string;
  created_at: Date;
}

const MessageSchema = new Schema({
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
  text: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Message = model<IMessage>("message", MessageSchema);

export { Message };
