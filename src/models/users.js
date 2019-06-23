import mongoose from 'mongoose';

const schema = mongoose.Schema({
  id: String,
  username: String,
  server_id: String,
  last_pug: Object,
  stats: Object,
});

export default mongoose.model('users', schema);
