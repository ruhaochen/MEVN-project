import express from 'express';
import Team from '../models/Team.js';
import {connectDB} from '../config/db.js';
import { ObjectId } from 'mongodb';

const db = await connectDB();
const router = express.Router();

// Get all teams
router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ 
            message: "Error getting teams", 
            error: error.message 
        });
    }
});

// Get all teams in a league
router.get('/leagues/:leagueId/teams', async (req, res) => {
    try {
        const leagueId = req.params.leagueId;
        
        if (!ObjectId.isValid(leagueId)) {
            return res.status(400).json({ message: "Invalid league ID format" });
        }

        const result = await db.collection('teams').aggregate([
            { 
                $match: { 
                    leagueId: new ObjectId(leagueId) 
                } 
            }
        ]).toArray();
        
        if (result.length === 0) {
            return res.status(404).json({ message: "No teams found for this league" });
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error getting teams for league", error });
    }
});

// Create a new team
router.post('/teams', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.body.leagueId)) {
      return res.status(400).json({ message: "Invalid league ID format" });
    }

    const team = new Team({
      leagueId: req.body.leagueId,
      name: req.body.name,
      school: req.body.school,
      location: req.body.location
    });

    const savedTeam = await team.save();
    res.status(201).json({ 
      message: "Team created successfully", 
      _id: savedTeam._id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating team", 
      error: error.message 
    });
  }
});

export default router;