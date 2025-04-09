import express from 'express';
import League from '../models/League.js';
import Team from '../models/Team.js'; 
import Event from '../models/Event.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all leagues
router.get('/leagues', async (req, res) => {
  try {
    const leagues = await League.find();
    res.json(leagues);
  } catch (error) {
    res.status(500).json({ 
      message: "Error getting leagues", 
      error: error.message 
    });
  }
});

// GET Single League
router.get('/leagues/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid league ID" });
    }

    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ success: false, message: "League not found" });
    }

    res.json({ success: true, data: league });
  } catch (error) {
    console.error("Error fetching league:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Create a new league
router.post('/leagues', async (req, res) => {
  try {
    const league = new League({
      season: req.body.season.toLowerCase(),
      sport: req.body.sport.toLowerCase(),
      ageGroup: req.body.ageGroup.toLowerCase(),
      division: req.body.division.toLowerCase(),
      gender: req.body.gender.toLowerCase()
    });
    
    const savedLeague = await league.save();
    res.status(201).json({ 
      message: "League created successfully", 
      _id: savedLeague._id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating league", 
      error: error.message 
    });
  }
});

router.delete("/leagues/:id", async (req, res) => {
  try {
    // Verify the ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid league ID" });
    }

    // Transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete associated teams and events
      await Team.deleteMany({ leagueId: req.params.id }).session(session);
      await Event.deleteMany({ leagueId: req.params.id }).session(session);
      
      const deleted = await League.findByIdAndDelete(req.params.id).session(session);
      
      if (!deleted) {
        await session.abortTransaction();
        return res.status(404).json({ message: "League not found" });
      }

      await session.commitTransaction();
      res.json({ message: "League and all associated data deleted successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting league:", error);
    res.status(500).json({ 
      message: "Error deleting league",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT Update League
router.put('/leagues/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid league ID" });
    }

    const { season, sport, ageGroup, division, gender } = req.body;

    const updatedLeague = await League.findByIdAndUpdate(
      req.params.id,
      {
        season: season.toLowerCase(),
        sport: sport.toLowerCase(),
        ageGroup: ageGroup.toLowerCase(),
        division: division.toLowerCase(),
        gender: gender.toLowerCase()
      },
      { new: true, runValidators: true }
    );

    if (!updatedLeague) {
      return res.status(404).json({ success: false, message: "League not found" });
    }

    res.json({ 
      success: true, 
      message: "League updated successfully",
      data: updatedLeague
    });
  } catch (error) {
    console.error("Error updating league:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message.includes('validation') 
        ? error.message 
        : "Server error"
    });
  }
});
export default router;