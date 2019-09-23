import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: String,
  name: String,
  timestamp: Date,
  pug: Object,
  winner: Number,
});

export default mongoose.model('pugs', schema);
