import express from 'express';
import Team from '../models/Team.js';
import Event from '../models/Event.js';
import {connectDB} from '../config/db.js';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

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

// GET Single Team
router.get('/teams/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid team ID" });
    }

    const team = await Team.findById(req.params.id).populate('leagueId', 'sport ageGroup');
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    res.json({ success: true, data: team });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ success: false, message: "Server error" });
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

router.delete("/teams/:id", async (req, res) => {
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid team ID" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update events that reference this team
      await Event.updateMany(
        { opposingTeamId: req.params.id },
        { 
          $set: { 
            opposingTeamId: null, 
            opposingTeam: "Bayview Glen" 
          } 
        }
      ).session(session);

      const deleted = await Team.findByIdAndDelete(req.params.id).session(session);
      
      if (!deleted) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Team not found" });
      }

      await session.commitTransaction();
      res.json({ message: "Team deleted and events updated" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ 
      message: "Error deleting team",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT Update Team
router.put('/teams/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid team ID" });
    }

    const { leagueId, name, school, location } = req.body;

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { leagueId, name, school, location },
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    res.json({ 
      success: true, 
      message: "Team updated successfully",
      data: updatedTeam
    });
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message.includes('validation') 
        ? error.message 
        : "Server error"
    });
  }
});

export default router;