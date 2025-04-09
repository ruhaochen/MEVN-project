import express from 'express';
import dotenv from 'dotenv';

const router = express.Router(); 

dotenv.config();

// Get google maps API key
router.get('/maps-key', async (req, res) => {
    try {
      res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

// // Get lat and long from address
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

export default router; 