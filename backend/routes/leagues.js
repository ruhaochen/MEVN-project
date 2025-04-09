import express from 'express';
import League from '../models/League.js';

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

export default router;