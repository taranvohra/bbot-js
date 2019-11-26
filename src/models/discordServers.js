import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: String,
  pug_channel: String,
  query_channel: String,
  prefix: String,
});

export default mongoose.model('discord_servers', schema);
