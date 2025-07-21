
import express from 'express';
import { generateJobs, chatWithAI, getAvailableCompanies, scrapeJobs } from '../controller/jobScraper.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Job search with resume customization
router.post('/search-jobs', scrapeJobs);

// Alternative route for job search
router.post('/generate-jobs', generateJobs);

// Chatbot endpoint for job portal assistant
router.post('/chat', chatWithAI);

// Health check
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "AI job assistant routes are working",
        timestamp: new Date().toISOString()
    });
});

// Test scrape endpoint 
router.get('/test-scrape', (req, res) => {
    res.json({
        success: true,
        message: "Scrape endpoint is available",
        endpoint: "/external/search-jobs",
        method: "POST"
    });
});

// Debug scrape endpoint
router.post('/debug-scrape', (req, res) => {
    res.json({
        success: true,
        message: "Debug scrape endpoint working",
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

// Companies endpoint
router.get('/companies', getAvailableCompanies);

export default router;
