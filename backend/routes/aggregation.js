import express from 'express';
import { ObjectId } from 'mongodb';
import {connectDB} from '../config/db.js';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

const router = express.Router();

dotenv.config(); 

const db = await connectDB();

// Get a list of events that fits in query
router.get("/events", async (req, res) => {
    try {
        const query = {};
  
        if (req.query.leagueIds) {
            query.leagueId = { $in: req.query.leagueIds.split(",") };
        }
    
        if (req.query.opposingTeamId) {
            query.opposingTeamId = req.query.opposingTeamId;
        }
    
        if (req.query.startDate && req.query.endDate) {
            try {
                query.date = {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate),
                };
            } catch (dateError) {
                console.error("Invalid date format:", dateError);
                return res.status(400).json({ message: "Invalid date format" });
            }
        }
        const events = await Event.find(query);
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get a list of all leagues
router.get('/leagues', async (req, res) => {
    try {
        const result = await db.collection('leagues').find().toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error getting leagues", error });
    }
});

// Get a list of all teams
router.get('/teams', async (req, res) => {
  try {
      const result = await db.collection('teams').find().toArray();
      res.json(result);
  } catch (error) {
      res.status(500).json({ message: "Error getting teams", error });
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

// Get google maps API key
router.get('/maps-key', async (req, res) => {
    try {
      res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// Get lat and long from address
// router.get('/geocode', async (req, res) => {
//     const address = req.query.address;
//     if (!address) {
//         return res.status(400).json({ success: false, error: "Address is required" });
//     }

//     try {
//         const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
//             params: {
//                 address,
//                 key: process.env.GOOGLE_MAPS_API_KEY,
//             },
//         });

//         if (!response.data.results.length) {
//             return res.status(404).json({ success: false, error: "No results found" });
//         }

//         console.log("Incoming geocode request:", req.query.address);
//         res.json({
//             success: true,
//             location: response.data.results[0].geometry.location,
//             formattedAddress: response.data.results[0].formatted_address,
//         });
//     } catch (error) {
//         console.error("Geocoding error:", error.message);
//         res.status(500).json({ success: false, error: "Failed to geocode address" });
//     }
// });

// Create a new event
router.post('/events', async (req, res) => {
    try {
        const event = req.body;
        event.date = new Date(event.date)
        const result = await db.collection('events').insertOne(event);
        res.status(201).json({ message: "Event created", _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: "Error posting events", error });
    }
});

// Create a new team
router.post('/teams', async (req, res) => {
    try {
        const team = req.body;

        if (!ObjectId.isValid(team.leagueId)) {
            return res.status(400).json({ message: "Invalid league ID format" });
        }

        team.leagueId = new ObjectId(String(team.leagueId));

        const result = await db.collection('teams').insertOne(team);
        res.status(201).json({ message: "Team created", _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: "Error posting teams", error });
    }
});

// Create a new league
router.post('/leagues', async (req, res) => {
    try {
        const league = req.body;
        const result = await db.collection('leagues').insertOne(league);
        res.status(201).json({ message: "League created", _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: "Error posting leagues", error });
    }
});

//export default router; 