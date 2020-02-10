import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: String,
  name: String,
  timestamp: Date,
  pug: Object,
  winner: Number,
  duel: Boolean,
});

export default mongoose.model('pugs', schema);
