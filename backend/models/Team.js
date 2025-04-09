import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  leagueId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "League", 
    required: true 
  },
  name: { type: String, required: true },
  school: { type: String, required: true },
  location: { type: String, required: true },
});

const Team = mongoose.model("Team", teamSchema);
export default Team;