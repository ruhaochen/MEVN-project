import mongoose from "mongoose";

const leagueSchema = new mongoose.Schema({
  season: { type: String, required: true },
  sport: { type: String, required: true },
  ageGroup: { type: String, required: true },
  division: { type: String, required: true },
  gender: { type: String, required: true },
});

const League = mongoose.model("League", leagueSchema);
export default League;