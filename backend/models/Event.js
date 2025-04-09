import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  leagueId: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  opposingTeam: { type: String, required: true },
  opposingTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: false },
  notes: { type: String },
});

const Event = mongoose.model("Event", eventSchema);
export default Event;