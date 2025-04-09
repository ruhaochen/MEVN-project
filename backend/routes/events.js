import express from 'express';
import Event from '../models/Event.js';
import League from '../models/League.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

function getSeasonFromMonth(month) {
    if ([8, 9, 10].includes(month)) 
        return 'fall';    // Sept-Nov
    if ([11, 0, 1, 2].includes(month)) 
        return 'winter';    // Jan–Mar
    if ([3, 4, 5].includes(month)) 
        return 'spring';    // Apr–Jun
    return null;
}

function getNextSeason(currentSeason) {
    if (currentSeason === 'fall') 
        return 'winter';
    if (currentSeason === 'winter') 
        return 'spring';
    if (currentSeason === 'spring')
        return 'fall';
    return null;
}

import mongoose from "mongoose";

// Get a list of events that fits query
router.get("/events", async (req, res) => {
    try {
        const query = {};
        let selectedLeagueIds = [];
        let seasonalLeagueIds = [];
  
        if (req.query.leagueIds) {
            selectedLeagueIds = req.query.leagueIds
            .split(",")
            .map(id => new mongoose.Types.ObjectId(String(id)));
        }
  
        if (req.query.dateRange === "thisSeason" || req.query.dateRange === "nextSeason") {
            const now = new Date();
            const currentSeason = getSeasonFromMonth(now.getMonth());
            const targetSeason = req.query.dateRange === "thisSeason"
            ? currentSeason
            : getNextSeason(currentSeason);
    
            const seasonalLeagues = await League.find({ season: targetSeason });
            seasonalLeagueIds = seasonalLeagues.map(l => new mongoose.Types.ObjectId(l._id));
        }
  
        if (selectedLeagueIds.length && seasonalLeagueIds.length) {
                const seasonalSet = new Set(seasonalLeagueIds.map(id => id.toString()));
                const intersected = selectedLeagueIds.filter(id =>
                    seasonalSet.has(id.toString())
                );
            if (intersected.length > 0) {
                query.leagueId = { $in: intersected };
            } else {
                return res.json([]);
            }
        } else if (selectedLeagueIds.length) {
            query.leagueId = { $in: selectedLeagueIds };
        } else if (seasonalLeagueIds.length) {
            query.leagueId = { $in: seasonalLeagueIds };
        }
    
        // if (req.query.opposingTeamId) {
        //     query.opposingTeamId = new mongoose.Types.ObjectId(req.query.opposingTeamId);
        // }

        if (req.query.opposingTeamId) {
            const teamIds = req.query.opposingTeamId
                .split(",")
                .map(id => new mongoose.Types.ObjectId(String(id)));
            query.opposingTeamId = { $in: teamIds };
        }
    
        if (req.query.startDate && req.query.endDate) {
            try {
                query.date = {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate),
                };
            } catch (err) {
                return res.status(400).json({ message: "Invalid date format" });
            }
        }
  
        const events = await Event.find(query).sort({ 
            date: 1,
            time: 1   
        });
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/events', async (req, res) => {
    try {
        // Validate IDs
        if (!ObjectId.isValid(req.body.leagueId)) {
            return res.status(400).json({ message: "Invalid league ID format" });
        }
        if (!ObjectId.isValid(req.body.opposingTeamId)) {
            return res.status(400).json({ message: "Invalid team ID format" });
        }

        const event = new Event({
            type: req.body.type,
            leagueId: req.body.leagueId,
            location: req.body.location,
            date: new Date(req.body.date),
            time: req.body.time,
            opposingTeam: req.body.opposingTeam,
            opposingTeamId: req.body.opposingTeamId,
            notes: req.body.notes
        });

        const savedEvent = await event.save();
        res.status(201).json({ 
            message: "Event created successfully", 
            _id: savedEvent._id 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating event", 
            error: error.message 
        });
    }
});

export default router;