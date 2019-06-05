import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: Number,
  pug_channel: Number,
  query_channel: Number,
});

export default mongoose.model('discord_servers', schema);
