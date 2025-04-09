import express from 'express';
import eventRoutes from './events.js';
import leagueRoutes from './leagues.js';
import teamRoutes from './teams.js';
import mapRoutes from './maps.js'

const router = express.Router();

// Prefix all routes with '/api'
router.use('/', eventRoutes);
router.use('/', leagueRoutes);
router.use('/', teamRoutes);
router.use('/', mapRoutes);

export default router;