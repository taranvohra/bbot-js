import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: String,
  game_types: [
    {
      name: String,
      noOfPlayers: Number,
      noOfTeams: Number,
      pickingOrder: [Number],
      hasCoinFlipMapvoteDecider: Boolean,
    },
  ],
});

export default mongoose.model('game_types', schema);
