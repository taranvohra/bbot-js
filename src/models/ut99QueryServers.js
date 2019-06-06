import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: Number,
  query_servers: [
    {
      key: String,
      name: String,
      host: String,
      port: String,
      timestamp: Number,
    },
  ],
});

export default mongoose.model('ut99_query_servers', schema);
