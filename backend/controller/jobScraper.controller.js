import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

function initializeGeminiClient() {
    if (!genAI && process.env.GEMENI_API_KEY) {
        try {
            genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);
        } catch (error) {
            
        }
    }
}

initializeGeminiClient();

// Generate customized jobs based on search term and user resume
export async function generateJobs(req, res) {
    try {
        const { searchTerm, location = '', userResume = '', userProfile = {} } = req.body;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                error: 'Search term is required'
            });
        }

        if (!genAI) {
            return res.status(500).json({
                success: false,
                error: 'AI service not available'
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const jobSearchPrompt = `You are an AI job search assistant. Based on the user's search and profile, generate personalized job recommendations.

USER SEARCH: "${searchTerm}"
LOCATION PREFERENCE: "${location || 'Any location'}"
USER RESUME/PROFILE: ${userResume || 'No resume provided'}
USER PREFERENCES: ${JSON.stringify(userProfile)}

ANALYSIS REQUIRED:
1. If the search is NOT job-related (random text, food, etc.), provide guidance
2. If job-related, analyze user background and match relevant opportunities
3. Consider user's experience level, skills, and preferences from resume

RESPONSE FORMAT:

For NON-JOB searches, respond with:
{
    "type": "guidance",
    "message": "I'm your job search assistant. Your query doesn't seem job-related.",
    "suggestions": ["Software Developer", "Marketing Manager", "Remote Jobs", "Entry Level Positions"]
}

For JOB searches, generate 20 personalized job postings in this format:
{
    "type": "jobs",
    "jobs": [
        {
            "title": "Job title matching search and user background",
            "company": "Realistic company name",
            "location": "City, State/Country",
            "description": "Detailed job description tailored to user's level",
            "requirements": ["Req 1", "Req 2", "Req 3"],
            "skills": ["Skill 1", "Skill 2", "Skill 3"],
            "experienceLevel": "Entry/Mid/Senior based on user profile",
            "jobType": "Full-time/Part-time/Contract/Remote",
            "salaryRange": "Realistic salary based on location and level",
            "benefits": ["Health Insurance", "401k", "PTO"],
            "companySize": "Startup/Small/Medium/Large",
            "industry": "Relevant industry",
            "matchScore": "85% (based on user profile alignment)",
            "whyMatch": "Explanation of why this job matches user's background",
            "postedDaysAgo": "1-30"
        }
    ]
}

Make jobs highly relevant to user's background. If resume shows React experience, prioritize React jobs. If entry-level profile, show junior positions.`;

        const result = await model.generateContent(jobSearchPrompt);
        const response = await result.response;
        const text = response.text();

        try {
            const aiResponse = JSON.parse(text);
            
            if (aiResponse.type === 'guidance') {
                return res.json({
                    success: true,
                    data: {
                        message: aiResponse.message,
                        suggestions: aiResponse.suggestions,
                        isGuidance: true,
                        searchTerm,
                        location
                    }
                });
            }

            if (aiResponse.type === 'jobs' && aiResponse.jobs) {
                return res.json({
                    success: true,
                    data: {
                        jobs: aiResponse.jobs,
                        totalCount: aiResponse.jobs.length,
                        searchTerm,
                        location,
                        isAIGenerated: true,
                        generatedAt: new Date().toISOString()
                    }
                });
            }

        } catch (parseError) {
            // Fallback response for job search - always generate jobs if we get here
            
            return res.json({
                success: true,
                data: {
                    message: "I found your search interesting but couldn't generate specific jobs right now. Please try a more specific job-related search.",
                    suggestions: ["Software Developer", "Marketing Manager", "Data Analyst", "Sales Representative"],
                    isGuidance: true,
                    searchTerm,
                    location
                }
            });
        }

    } catch (error) {
        
        res.status(500).json({
            success: false,
            error: 'Failed to generate job recommendations'
        });
    }
}

// Chatbot functionality for job portal
export async function chatWithAI(req, res) {
    try {
        const { message, userContext = {}, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        if (!genAI) {
            return res.status(500).json({
                success: false,
                error: 'AI service not available'
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const chatPrompt = `You are a friendly AI assistant and student career guide. Your job is to help students with career advice, resolve doubts, and provide guidance on jobs, internships, skills, and personal growth. Respond in a dynamic, conversational style.

USER MESSAGE: "${message}"
USER CONTEXT: ${JSON.stringify(userContext)}
CONVERSATION HISTORY: ${JSON.stringify(conversationHistory.slice(-5))} // Last 5 messages for context

YOUR ROLE & CAPABILITIES:
- Enthusiastic career mentor and job search assistant for students
- Help with resume writing, optimization, and career planning
- Provide interview preparation tips and strategies
- Explain job market trends and industry insights
- Guide students through career transitions and skill development
- Answer salary and career progression questions
- Suggest personalized skill development paths
- Help with internship and entry-level job searches
- Provide guidance on networking and professional development

RESPONSE GUIDELINES:
1. Be encouraging, supportive, and optimistic about their career journey
2. Provide actionable, specific advice tailored to students
3. Use a friendly, conversational tone (not overly formal)
4. Ask follow-up questions to better understand their goals
5. Share relevant examples and success stories when appropriate
6. For job searches, encourage them to use our platform's features
7. For career doubts, provide reassurance and practical next steps
8. Be dynamic - adapt your responses based on their experience level and interests

RESPONSE EXAMPLES:
- Career guidance: "That's exciting that you're exploring data science! Based on your background, here are some specific steps to get started..."
- Job search help: "I'd love to help you find the perfect role! What type of position interests you most? I can search our database for relevant opportunities."
- Resume advice: "Great question about resume optimization! For a student in your field, I'd recommend highlighting these key areas..."
- Interview prep: "Interview nerves are totally normal! Here are some proven strategies that have helped many students land their dream jobs..."
- Skill development: "Learning new skills is one of the best investments you can make! For someone in your situation, I'd suggest focusing on..."

Remember: You're specifically helping students and young professionals, so keep advice practical, encouraging, and relevant to their career stage. Always end with a question or next step to keep the conversation flowing.`;

        const result = await model.generateContent(chatPrompt);
        const response = await result.response;
        const aiReply = response.text();

        res.json({
            success: true,
            content: aiReply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message',
            content: "I'm having trouble right now. Please try again in a moment."
        });
    }
}

// Get available companies (placeholder for now)


async function generateCustomizedFallbackJobs(searchTerm, location, numberOfJobs = 30) {
   
    
    try {
        if (!genAI) {
            
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `You are an advanced AI job search assistant. Analyze and interpret ANY job-related search query creatively and intelligently: "${searchTerm}"

        INTELLIGENT SEARCH INTERPRETATION:
        Accept and process ANY of these search patterns:
        - Direct job titles: "React Developer", "Software Engineer", "Data Scientist"
        - Technology/Skills: "Python", "JavaScript", "Machine Learning", "AI", "Blockchain"
        - Industry terms: "FinTech", "Healthcare", "E-commerce", "Gaming", "Startup"
        - Job levels: "Junior", "Senior", "Lead", "Principal", "Entry level", "Internship"
        - Job types: "Remote", "Part-time", "Contract", "Freelance", "Full-time"
        - Company types: "Startup", "Big Tech", "FAANG", "Fortune 500"
        - Salary ranges: "100k+", "High paying", "Six figures", "Competitive salary"
        - Benefits: "Good benefits", "Stock options", "Flexible hours", "Work from home"
        - Career stage: "New grad", "Career change", "First job", "Dream job"
        - Casual terms: "Cool jobs", "Interesting work", "Creative roles", "Challenging positions"
        - Combinations: "Remote Python developer startup", "Entry level data science", "High paying frontend jobs"

        CREATIVE INTERPRETATION EXAMPLES:
        - "Python" → Python Developer, Data Scientist, Backend Engineer, ML Engineer roles
        - "AI" → AI Engineer, ML Scientist, Data Scientist, Research Scientist, AI Product Manager
        - "Startup" → Various roles at startup companies across different functions
        - "Remote" → Remote-friendly positions across all job types
        - "High paying" → Senior roles with competitive salaries (100k+)
        - "Entry level" → Junior positions requiring 0-2 years experience
        - "Creative" → Designer, Content Creator, Marketing, Product roles
        - "Tech" → Software Engineer, DevOps, Product Manager, Technical Writer
        - "Finance" → Financial Analyst, FinTech roles, Investment Banking, Accounting

        RESPONSE GUIDELINES:
        
        FOR ANY JOB-RELATED QUERIES (be very liberal in interpretation):
        Generate ${numberOfJobs} diverse, realistic job postings that creatively match "${searchTerm}".
        Always include REAL company websites and job board links.
        
        FOR TRULY NON-JOB-RELATED QUERIES:
        ONLY if the query is completely unrelated to work/careers (e.g., "pizza recipe", "weather today", "random gibberish"), respond with:
        {
            "message": "I'm a job search assistant designed to help you find employment opportunities. Your search '${searchTerm}' doesn't appear to be job-related. Here are some examples of job searches I can help with:",
            "suggestions": [
                "Software Developer jobs",
                "Remote work opportunities", 
                "Entry level positions",
                "High paying tech jobs",
                "Startup careers",
                "Data science roles",
                "Creative design jobs",
                "Marketing positions"
            ],
            "type": "guidance"
        }

        RESPONSE FORMAT FOR JOB-RELATED QUERIES:
        Return ONLY this JSON array structure with REAL working links and diverse content:
        [
            {
                "title": "UNIQUE, specific job title that varies significantly from others (avoid repetitive patterns)",
                "company": "Use diverse mix: Tech giants (Google, Microsoft, Apple), startups (Stripe, Discord, Figma), traditional companies (JPMorgan, Goldman Sachs, Johnson & Johnson), unicorns (SpaceX, OpenAI, Databricks)",
                "location": "Vary locations: major tech hubs (SF, NYC, Seattle), emerging cities (Austin, Denver, Atlanta), international (London, Toronto, Berlin), or Remote${location ? ` (prioritize ${location})` : ''}",
                "description": "UNIQUE description for each job - avoid templates. Include specific technologies, projects, team size, company culture, growth opportunities. Make each description feel like a real company wrote it.",
                "requirements": ["Vary requirements significantly", "Include specific years of experience", "Mention unique technologies/tools", "Add domain-specific knowledge", "Include soft skills that differ per role"],
                "skills": ["Mix technical and soft skills", "Include trending technologies", "Add industry-specific tools", "Vary skill combinations", "Include certifications where relevant"],
                "experienceLevel": "Distribute across Entry-Level (20%), Mid-Level (40%), Senior (25%), Lead (10%), Principal (5%)",
                "jobType": "Mix: Full-time (60%), Contract (15%), Remote (20%), Part-time (5%)",
                "salaryRange": "REALISTIC ranges: Entry $60k-80k, Mid $80k-120k, Senior $120k-180k, Lead $150k-220k, Principal $200k-300k+",
                "benefits": ["Vary benefits per company type", "Startups: equity, flexible hours", "Big tech: comprehensive health, learning budget", "Traditional: 401k match, stable PTO"],
                "companySize": "Distribute: Startup (25%), Small (20%), Medium (25%), Large (20%), Enterprise (10%)",
                "industry": "Diversify: Technology, FinTech, HealthTech, E-commerce, Gaming, AI/ML, Cybersecurity, EdTech, CleanTech, Automotive",
                "workEnvironment": "Make each unique: 'Fast-paced startup environment', 'Collaborative enterprise culture', 'Research-focused team', 'Customer-obsessed culture', etc.",
                "originalUrl": "https://jobs.lever.co/{companyname}/{unique-slug} OR https://careers.{company}.com/jobs/{job-id} OR https://boards.greenhouse.io/{company}/jobs/{id}",
                "applyUrl": "https://apply.workable.com/{company}/j/{job-id} OR https://{company}.greenhouse.io/jobs/{id} OR https://jobs.lever.co/{company}/{id}/apply",
                "jobBoardUrl": "https://www.linkedin.com/jobs/view/{8-10-digit-number} OR https://www.indeed.com/viewjob?jk={16-char-alphanumeric} OR https://www.glassdoor.com/job-listing/{job-title}-{company}-JV_{random-id}",
                "postedDaysAgo": "Realistic distribution: 1-7 days (60%), 8-14 days (25%), 15-30 days (15%)"
            }
        ]

        IMPORTANT URL REQUIREMENTS:
        - originalUrl: Use REAL company career page formats:
          * https://jobs.lever.co/netflix/abc123def 
          * https://careers.google.com/jobs/results/456789
          * https://microsoft.careers.com/us/en/job/123456
          * https://boards.greenhouse.io/stripe/jobs/789012
          * https://jobs.ashbyhq.com/openai/abc123
        - applyUrl: Use REAL application system formats:
          * https://apply.workable.com/spotify/j/def456ghi
          * https://amazon.greenhouse.io/jobs/345678
          * https://jobs.lever.co/uber/789012/apply
        - jobBoardUrl: Use REAL job board formats with proper IDs:
          * https://www.linkedin.com/jobs/view/3847562190
          * https://www.indeed.com/viewjob?jk=a1b2c3d4e5f6g7h8
          * https://www.glassdoor.com/job-listing/software-engineer-google-JV_IC1147401_KO0,17_KE18,24.htm

        DIVERSITY REQUIREMENTS:
        1. NO repetitive job titles - each must be unique and specific
        2. NO template descriptions - each must sound like different companies wrote them
        3. VARY salary ranges realistically based on location and experience
        4. MIX company types: 30% big tech, 25% startups, 20% mid-size, 15% enterprise, 10% non-tech
        5. DIVERSIFY benefits: don't repeat the same 4 benefits for every job
        6. VARY work environments: remote-first, hybrid, in-office, distributed teams
        7. INCLUDE trending technologies and tools relevant to search term
        8. MAKE requirements specific to each role and company

        REALISM CHECKLIST:
        ✓ Each job feels like it came from a different company
        ✓ Job titles are specific and avoid generic patterns
        ✓ Descriptions mention actual projects/technologies/team structure
        ✓ Requirements vary significantly between jobs
        ✓ Salary ranges match market reality for location/level
        ✓ URLs follow real company patterns and look clickable
        ✓ Benefits reflect company type (startup vs enterprise)
        ✓ Posted dates are distributed realistically

        INTELLIGENT MATCHING EXAMPLES:
        - "React" → React Developer, Frontend Engineer, Full-Stack Developer roles
        - "Python" → Python Developer, Data Scientist, Backend Engineer, ML Engineer
        - "AI" → AI Engineer, ML Scientist, Data Scientist, Research Scientist
        - "Remote" → Various remote-friendly positions across all fields
        - "Startup" → Diverse roles at innovative startup companies
        - "Entry level" → Junior positions perfect for new graduates
        - "High paying" → Senior roles with competitive salaries (100k+)
        - "Creative" → Designer, Content Creator, Marketing, Product roles
        - "Finance" → Financial Analyst, FinTech, Investment roles
        - "Healthcare" → Medical, Biotech, Health IT positions

        DYNAMIC SEARCH CAPABILITIES:
        - Accept single words, phrases, or complex queries
        - Interpret casual language and slang terms
        - Handle typos and alternative spellings
        - Combine multiple concepts intelligently
        - Always find relevant jobs for reasonable search terms
        - Be creative but professional in job generation

        IMPORTANT RULES:
        1. Be VERY liberal in interpreting job-related searches
        2. Only reject truly non-work-related queries (food, weather, etc.)
        3. For ambiguous terms, lean towards job interpretation
        4. Generate diverse, realistic job postings with real company URLs
        5. Always include working originalUrl, applyUrl, and jobBoardUrl
        6. Match salary ranges to experience levels and locations
        7. Return ONLY JSON - no additional text or markdown formatting

        Now analyze "${searchTerm}" and respond accordingly.`;

        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        
        
        
        let cleanedText = text.trim();
        
        
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        
        try {
            const parsedResponse = JSON.parse(cleanedText);
            
            // Check if this is a guidance response - be much more restrictive about what counts as "non-job-related"
            if (parsedResponse.type === 'guidance' && parsedResponse.message) {
                
                
                
                // For now, let's generate jobs anyway since most searches should be job-related
                
                
                // Generate basic fallback jobs for the search term
                const fallbackJobs = generateBasicJobsForTerm(searchTerm, location);
                return fallbackJobs;
            }
            
            
            const aiJobs = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
            
            if (aiJobs.length === 0) {
                
                return null;
            }
            
            
            // Transform AI jobs with enhanced URL generation
            const transformedJobs = aiJobs.map((job, index) => {
                const jobId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const companySlug = (job.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s+/g, '');
                
                // Generate realistic URLs based on company patterns
                let originalUrl, applyUrl, jobBoardUrl;
                
                // Use AI-provided URLs if they exist and look realistic, otherwise generate proper ones
                if (job.originalUrl && (job.originalUrl.includes('lever.co') || job.originalUrl.includes('greenhouse.io') || job.originalUrl.includes('careers.'))) {
                    originalUrl = job.originalUrl;
                } else {
                    // Generate realistic company career page URLs
                    const urlPatterns = [
                        `https://jobs.lever.co/${companySlug}/${jobId}`,
                        `https://careers.${companySlug}.com/jobs/${jobId}`,
                        `https://boards.greenhouse.io/${companySlug}/jobs/${Math.floor(Math.random() * 9000000) + 1000000}`,
                        `https://${companySlug}.careers.com/job/${jobId}`,
                        `https://jobs.ashbyhq.com/${companySlug}/${jobId}`
                    ];
                    originalUrl = urlPatterns[index % urlPatterns.length];
                }
                
                if (job.applyUrl && (job.applyUrl.includes('apply.') || job.applyUrl.includes('greenhouse.io') || job.applyUrl.includes('lever.co'))) {
                    applyUrl = job.applyUrl;
                } else {
                    const applyPatterns = [
                        `https://apply.workable.com/${companySlug}/j/${jobId}`,
                        `https://${companySlug}.greenhouse.io/jobs/${Math.floor(Math.random() * 9000000) + 1000000}`,
                        `https://jobs.lever.co/${companySlug}/${jobId}/apply`,
                        `https://${companySlug}.applytojob.com/apply/${jobId}`
                    ];
                    applyUrl = applyPatterns[index % applyPatterns.length];
                }
                
                if (job.jobBoardUrl && (job.jobBoardUrl.includes('linkedin.com') || job.jobBoardUrl.includes('indeed.com') || job.jobBoardUrl.includes('glassdoor.com'))) {
                    jobBoardUrl = job.jobBoardUrl;
                } else {
                    const boardPatterns = [
                        `https://www.linkedin.com/jobs/view/${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                        `https://www.indeed.com/viewjob?jk=${Math.random().toString(36).substr(2, 16)}`,
                        `https://www.glassdoor.com/job-listing/${job.title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${companySlug}-JV_${Math.floor(Math.random() * 900000) + 100000}`,
                        `https://www.ziprecruiter.com/jobs/${companySlug}-${jobId}`
                    ];
                    jobBoardUrl = boardPatterns[index % boardPatterns.length];
                }
                
                const postedDate = new Date();
                const daysAgo = job.postedDaysAgo ? parseInt(job.postedDaysAgo) : Math.floor(Math.random() * 30) + 1;
                postedDate.setDate(postedDate.getDate() - daysAgo);
                
                return {
                    _id: `ai_${index + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    title: job.title || `${job.experienceLevel || 'Mid-Level'} ${searchTerm} Specialist`,
                    company: job.company || `Company ${index + 1}`,
                    location: job.location || location || 'Remote',
                    description: job.description || `Join our team as a ${job.title} and make an impact in the ${searchTerm} space.`,
                    requirements: job.requirements || [
                        'Strong technical foundation',
                        'Problem-solving abilities',
                        'Team collaboration',
                        'Communication skills',
                        'Growth mindset'
                    ],
                    skills: job.skills || ['Technical Skills', 'Problem Solving', 'Communication'],
                    experienceLevel: job.experienceLevel || 'Mid-Level',
                    jobType: job.jobType || 'Full-time',
                    salaryRange: job.salaryRange || '$70,000 - $90,000',
                    benefits: job.benefits || ['Health Insurance', '401k', 'Flexible Hours', 'Remote Work'],
                    companySize: job.companySize || 'Medium',
                    industry: job.industry || 'Technology',
                    workEnvironment: job.workEnvironment || 'Collaborative and professional workplace',
                    originalUrl: originalUrl,
                    applyUrl: applyUrl,
                    jobBoardUrl: jobBoardUrl,
                    link: originalUrl, // For backward compatibility
                    postedDate: postedDate.toISOString(),
                    isExternal: true,
                    isAIGenerated: true,
                    isFallback: false,
                    uniqueId: jobId
                };
            });
            
            // Validate uniqueness and quality
            const uniqueTitles = new Set(transformedJobs.map(job => job.title));
            const uniqueCompanies = new Set(transformedJobs.map(job => job.company));
            
            
            
            
            
            // Debug URL generation for first few jobs
            
            
            transformedJobs.slice(0, 3).forEach((job, index) => {
                
                
                
                
                
                
            });
            
            return transformedJobs;
            
        } catch (parseError) {
            
            return generateBasicJobsForTerm(searchTerm, location);
        }
        
    } catch (error) {
        
        
        
        
        // Enhanced error logging
        if (error.message && error.message.includes('JSON')) {
            
            
        } else if (error.message && error.message.includes('API')) {
            
        } else if (error.message && error.message.includes('timeout')) {
            
        } else if (error.message && error.message.includes('quota')) {
            
        } else if (error.message && error.message.includes('SAFETY')) {
            
        } else if (error.message && error.message.includes('BLOCKED')) {
            
        } else if (error.message && error.message.includes('RECITATION')) {
            
        } else {
            
        }
        
        // Always generate fallback jobs instead of returning null
        
        return generateBasicJobsForTerm(searchTerm, location);
    }
}

export const scrapeJobs = async (req, res) => {
    const { searchTerm, location } = req.body;
    
    try {
        // Input validation
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Search term is required and must be a non-empty string'
            });
        }

        const trimmedSearchTerm = searchTerm.trim();

        // Enhanced search term validation
        if (trimmedSearchTerm.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search term must be at least 2 characters long",
                suggestion: "Try searching for job titles like 'Developer', 'Engineer', 'Manager', 'Analyst', etc."
            });
        }

        // Allowing all search terms for Gemini API testing

        // Check if searchTerm looks like a location instead of a job title
        // Only check if the ENTIRE search term is a location, not if it contains location words
        const locationKeywords = ['united states', 'usa', 'america', 'india', 'canada', 'uk', 'united kingdom', 'australia', 'germany', 'france'];
        const isLocationOnly = locationKeywords.some(loc =>
            trimmedSearchTerm.toLowerCase() === loc ||
            trimmedSearchTerm.toLowerCase().startsWith(loc + ' ') ||
            trimmedSearchTerm.toLowerCase().endsWith(' ' + loc)
        );

        if (isLocationOnly) {
            return res.status(400).json({
                success: false,
                message: "Please enter a job title (e.g., 'React Developer', 'Software Engineer') instead of a location. Use the location field for geographic preferences.",
                suggestion: "Try searching for job titles like 'Developer', 'Engineer', 'Manager', 'Analyst', etc."
            });
        }

        // Location validation - make location optional and default to empty
        const searchLocation = location && typeof location === 'string' && location.trim() !== '' ? location.trim() : '';

        if (searchLocation && searchLocation !== '') {
            const locationPattern = /^[A-Za-z\s,.-]+$/;
            if (!locationPattern.test(searchLocation)) {
                return res.status(400).json({
                    success: false,
                    error: 'Location contains invalid characters'
                });
            }
        }

        // Only Gemini AI response
        // Only Gemini AI job generation will be used
        const aiResponse = await generateCustomizedFallbackJobs(trimmedSearchTerm, searchLocation, 30);
        if (aiResponse && aiResponse.isGuidance) {
            // AI provided guidance for non-job-related query
            return res.status(200).json({
                success: true,
                message: aiResponse.message,
                data: {
                    isGuidance: true,
                    suggestions: aiResponse.suggestions,
                    searchTerm: trimmedSearchTerm,
                    location: searchLocation || 'All locations',
                    responseType: 'guidance',
                    dataSource: 'AI Guidance System'
                }
            });
        } else if (aiResponse && aiResponse.length > 0) {
            // AI SUCCESS: Generated jobs
            return res.status(200).json({
                success: true,
                message: `Showing ${aiResponse.length} AI-generated jobs based on your search`,
                data: {
                    jobs: aiResponse,
                    totalCount: aiResponse.length,
                    searchTerm: trimmedSearchTerm,
                    location: searchLocation || 'All locations',
                    scrapedAt: new Date().toISOString(),
                    isFallback: false,
                    isAIGenerated: true,
                    scrapingFailed: false,
                    dataSource: 'Gemini AI Job Generation',
                    suggestions: [
                        'These jobs are intelligently generated based on your search query',
                        'AI analyzed your search intent and created relevant job opportunities',
                        'Try different search terms for more specific results'
                    ]
                }
            });
        } else {
            // AI job generation failed
            return res.status(500).json({
                success: false,
                message: "AI job generation failed",
                error: "Unable to generate job data - AI fallback failed",
                details: {
                    scrapingSkipped: true,
                    aiFallbackFailed: true,
                    searchTerm: trimmedSearchTerm,
                    location: searchLocation || 'All locations'
                },
                suggestions: [
                    'Check your Gemini API key configuration',
                    'Verify internet connectivity',
                    'Try a different search term',
                    'Try again later - this might be a temporary issue'
                ]
            });
        }

    } catch (error) {
        
        
        res.status(500).json({
            success: false,
            message: "Internal server error during job scraping",
            error: error.message,
            details: "Please try again later or contact support if the issue persists."
        });
    }
};


// Function to enhance job data using Gemini AI
async function enhanceJobsWithGemini(rawJobs, searchTerm) {
    try {
        if (!genAI) {
            throw new Error('Gemini AI client not initialized');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const enhancedJobs = [];

        // Process jobs in smaller batches to avoid timeouts
        const batchSize = 3;
        for (let i = 0; i < rawJobs.length; i += batchSize) {
            const batch = rawJobs.slice(i, i + batchSize);
            
            const prompt = `
            You are a job data enhancement AI. Please enhance the following job listings with additional details and structure them properly.

            Search Term: ${searchTerm}
            
            Raw Job Data:
            ${JSON.stringify(batch, null, 2)}

            Please enhance each job with:
            1. Refined job description with key responsibilities
            2. Required skills and qualifications
            3. Experience level (Entry, Mid, Senior)
            4. Job type classification (Full-time, Part-time, Contract, Remote)
            5. Salary estimation if not provided (based on role and location)
            6. Clean and professional formatting

            Return the response as a valid JSON array with enhanced job objects. Each job should have these fields:
            - title
            - company
            - location
            - description (enhanced)
            - requirements (array of strings)
            - skills (array of relevant skills)
            - experienceLevel
            - jobType
            - salaryRange (estimated if not provided)
            - originalUrl (if available)
            - postedDate
            
            Only return the JSON array, no additional text.
            `;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // Parse the JSON response
                const cleanedText = text.replace(/```json|```/g, '').trim();
                const enhancedBatch = JSON.parse(cleanedText);
                
                if (Array.isArray(enhancedBatch)) {
                    enhancedJobs.push(...enhancedBatch.map((job, index) => ({
                        ...job,
                        _id: job.originalUrl || job.link || `enhanced_${i + index}_${Date.now()}`,
                        originalUrl: job.originalUrl || job.link || '',
                        isExternal: true
                    })));
                }
            } catch (geminiError) {
                
                
                
                const fallbackJobs = batch.map((job, index) => ({
                    _id: job.id || `fallback_${i + index}_${Date.now()}`,
                    title: job.title || 'Job Title Not Available',
                    company: job.company || 'Company Not Specified',
                    location: job.location || 'Location Not Specified',
                    description: job.description || job.summary || 'Description not available',
                    requirements: ['Details to be confirmed'],
                    skills: extractSkillsFromText(job.title + ' ' + (job.summary || '')),
                    experienceLevel: 'Mid-Level',
                    jobType: 'Full-time',
                    salaryRange: job.salary || 'Competitive',
                    originalUrl: job.link || job.url || '',
                    postedDate: job.postedAt || job.scrapedAt || new Date().toISOString(),
                    isExternal: true
                }));
                
                enhancedJobs.push(...fallbackJobs);
            }

            // Add longer delay between batches
            if (i + batchSize < rawJobs.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return enhancedJobs;

    } catch (error) {
        
        throw error; 
    }
}


function extractSkillsFromText(text) {
    const commonSkills = [
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'HTML', 'CSS',
        'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'TypeScript', 'Express',
        'Next.js', 'Vue.js', 'Angular', 'PHP', 'C++', 'C#', '.NET', 'Ruby',
        'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native'
    ];

    const foundSkills = [];
    const textLower = text.toLowerCase();

    commonSkills.forEach(skill => {
        if (textLower.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    });

    return foundSkills.length > 0 ? foundSkills.slice(0, 5) : ['Technical Skills Required'];
}


function generateBasicJobsForTerm(searchTerm, location) {
    
    
    const term = searchTerm.toLowerCase();
    let jobTitles = [];
    let skills = [];
    let companies = [];
    let salaryRanges = [];
    let jobTypes = [];
    let experienceLevels = [];
    
    // Create more diverse and realistic job variations
    if (term.includes('ai') || term.includes('artificial intelligence')) {
        jobTitles = [
            'AI Research Scientist', 'Machine Learning Engineer', 'AI Product Manager', 
            'Computer Vision Engineer', 'NLP Engineer', 'AI Ethics Researcher',
            'MLOps Engineer', 'AI Software Developer', 'Deep Learning Specialist',
            'AI Solutions Architect', 'Conversational AI Developer', 'AI Data Scientist'
        ];
        skills = ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP', 'Scikit-learn', 'Keras'];
        companies = ['OpenAI', 'DeepMind', 'Google AI', 'Microsoft Research', 'NVIDIA', 'Anthropic', 'Hugging Face', 'Stability AI', 'Cohere', 'Scale AI'];
        salaryRanges = ['$120,000 - $180,000', '$150,000 - $220,000', '$180,000 - $280,000', '$100,000 - $150,000', '$200,000 - $350,000'];
        experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Principal'];
        jobTypes = ['Full-time', 'Contract', 'Remote', 'Research'];
    } else if (term.includes('react')) {
        jobTitles = [
            'React Developer', 'Frontend Engineer', 'React Native Developer', 
            'Full Stack Developer', 'UI Engineer', 'JavaScript Developer',
            'Senior React Engineer', 'React Technical Lead', 'Frontend Architect',
            'React.js Specialist', 'Mobile App Developer', 'Web Developer'
        ];
        skills = ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js', 'Redux', 'Next.js', 'React Native', 'Jest'];
        companies = ['Meta', 'Netflix', 'Airbnb', 'Uber', 'Discord', 'Spotify', 'Slack', 'Shopify', 'Stripe', 'Vercel'];
        salaryRanges = ['$80,000 - $120,000', '$100,000 - $150,000', '$130,000 - $180,000', '$160,000 - $220,000', '$90,000 - $130,000'];
        experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead'];
        jobTypes = ['Full-time', 'Contract', 'Remote', 'Part-time'];
    } else if (term.includes('python')) {
        jobTitles = [
            'Python Developer', 'Backend Engineer', 'Data Scientist', 
            'DevOps Engineer', 'Python Software Engineer', 'API Developer',
            'Django Developer', 'Flask Developer', 'Python Automation Engineer',
            'Data Engineer', 'Python Full Stack Developer', 'Systems Engineer'
        ];
        skills = ['Python', 'Django', 'Flask', 'FastAPI', 'SQL', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'REST APIs'];
        companies = ['Instagram', 'Dropbox', 'Pinterest', 'Reddit', 'Spotify', 'NASA', 'Google', 'Microsoft', 'Amazon', 'Tesla'];
        salaryRanges = ['$75,000 - $110,000', '$95,000 - $140,000', '$120,000 - $170,000', '$85,000 - $125,000', '$150,000 - $200,000'];
        experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead'];
        jobTypes = ['Full-time', 'Contract', 'Remote', 'Hybrid'];
    } else if (term.includes('remote')) {
        jobTitles = [
            'Remote Software Engineer', 'Remote Data Analyst', 'Remote Product Manager', 
            'Remote UX Designer', 'Remote Marketing Manager', 'Remote Sales Engineer',
            'Remote DevOps Engineer', 'Remote Content Writer', 'Remote Customer Success',
            'Remote QA Engineer', 'Remote Technical Writer', 'Remote Project Manager'
        ];
        skills = ['Communication', 'Self-motivation', 'Time Management', 'Collaboration Tools', 'Zoom', 'Slack', 'Asana', 'Problem Solving'];
        companies = ['GitLab', 'Buffer', 'Zapier', 'Automattic', 'Basecamp', 'InVision', 'Toptal', 'Remote.com', 'FlexJobs', 'We Work Remotely'];
        salaryRanges = ['$60,000 - $95,000', '$80,000 - $120,000', '$100,000 - $150,000', '$70,000 - $105,000', '$120,000 - $180,000'];
        experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior'];
        jobTypes = ['Remote', 'Full-time', 'Contract', 'Part-time'];
    } else if (term.includes('startup')) {
        jobTitles = [
            'Startup Software Engineer', 'Product Manager', 'Growth Hacker', 
            'Business Development Representative', 'Full Stack Developer', 'Marketing Manager',
            'Startup Founder', 'Technical Co-founder', 'Startup Operations Manager',
            'Early Stage Engineer', 'Startup Sales Manager', 'Product Designer'
        ];
        skills = ['Versatility', 'Fast Learning', 'Innovation', 'Risk Taking', 'Adaptability', 'Scrappy Execution', 'MVP Development', 'Growth Hacking'];
        companies = ['Y Combinator', 'Techstars', 'AngelPad', 'Sequoia', 'a16z Portfolio', 'Kleiner Perkins', 'Greylock Partners', 'Bessemer Venture'];
        salaryRanges = ['$50,000 - $80,000 + Equity', '$70,000 - $110,000 + Equity', '$90,000 - $140,000 + Equity', '$60,000 - $95,000 + Equity'];
        experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior'];
        jobTypes = ['Full-time', 'Contract', 'Equity-based', 'Hybrid'];
    } else {
        // Generic fallback with more variety
        const jobCategories = [
            { title: `${searchTerm} Specialist`, company: 'TechCorp', salary: '$70,000 - $95,000' },
            { title: `Senior ${searchTerm} Engineer`, company: 'InnovateInc', salary: '$100,000 - $140,000' },
            { title: `${searchTerm} Analyst`, company: 'DataDriven Solutions', salary: '$60,000 - $85,000' },
            { title: `${searchTerm} Manager`, company: 'LeadershipCo', salary: '$90,000 - $130,000' },
            { title: `Junior ${searchTerm} Developer`, company: 'StartupHub', salary: '$55,000 - $75,000' },
            { title: `${searchTerm} Consultant`, company: 'Advisory Partners', salary: '$80,000 - $120,000' },
            { title: `Lead ${searchTerm} Architect`, company: 'Enterprise Solutions', salary: '$130,000 - $180,000' },
            { title: `${searchTerm} Product Owner`, company: 'Product Innovations', salary: '$95,000 - $135,000' }
        ];
        
        jobTitles = jobCategories.map(cat => cat.title);
        companies = jobCategories.map(cat => cat.company);
        salaryRanges = jobCategories.map(cat => cat.salary);
        skills = ['Problem Solving', 'Communication', 'Teamwork', 'Leadership', 'Technical Skills', 'Project Management', 'Critical Thinking'];
        experienceLevels = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead'];
        jobTypes = ['Full-time', 'Contract', 'Remote', 'Hybrid'];
    }
    
    const locations = location ? [location] : ['New York, NY', 'San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA'];
    const benefits = [
        ['Health Insurance', '401k Match', 'Stock Options', 'Flexible PTO'],
        ['Medical Coverage', 'Dental', 'Vision', 'Life Insurance', 'Flexible Hours'],
        ['Health Benefits', 'Retirement Plan', 'Equity', 'Learning Budget', 'Gym Membership'],
        ['Healthcare', '401k', 'Stock Options', 'Unlimited PTO', 'Work from Home'],
        ['Medical', 'Dental', 'Vision', 'FSA', 'Professional Development Fund']
    ];
    
    const descriptions = [
        `Join our innovative team as a ${jobTitles[0]} and help shape the future of ${searchTerm}. Work with cutting-edge technologies and passionate professionals.`,
        `We're seeking a talented ${jobTitles[1]} to drive our ${searchTerm} initiatives. Excellent growth opportunities and competitive compensation.`,
        `Exciting opportunity for a ${jobTitles[2]} to make a significant impact in the ${searchTerm} domain. Collaborative environment with top-tier benefits.`,
        `Looking for a skilled ${jobTitles[3]} to join our dynamic team. Work on challenging projects and advance your career in ${searchTerm}.`,
        `Great opportunity for a ${jobTitles[4]} to grow with our expanding ${searchTerm} division. Supportive culture and excellent mentorship.`
    ];
    
    const jobs = [];
    const numberOfJobs = Math.min(15, Math.max(jobTitles.length, 8));
    
    for (let i = 0; i < numberOfJobs; i++) {
        const jobTitle = jobTitles[i % jobTitles.length];
        const company = companies[i % companies.length];
        const salary = salaryRanges[i % salaryRanges.length];
        const expLevel = experienceLevels[i % experienceLevels.length];
        const jobType = jobTypes[i % jobTypes.length];
        const jobLocation = locations[i % locations.length];
        const jobBenefits = benefits[i % benefits.length];
        const description = descriptions[i % descriptions.length];
        const jobId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Generate realistic and diverse URLs
        const urlPatterns = [
            `https://jobs.lever.co/${companySlug}/${jobId}`,
            `https://careers.${companySlug}.com/jobs/${jobId}`,
            `https://boards.greenhouse.io/${companySlug}/jobs/${Math.floor(Math.random() * 9000000) + 1000000}`,
            `https://${companySlug}.careers.com/job/${jobId}`,
            `https://jobs.ashbyhq.com/${companySlug}/${jobId}`
        ];
        
        const applyPatterns = [
            `https://apply.workable.com/${companySlug}/j/${jobId}`,
            `https://${companySlug}.greenhouse.io/jobs/${Math.floor(Math.random() * 9000000) + 1000000}`,
            `https://jobs.lever.co/${companySlug}/${jobId}/apply`,
            `https://${companySlug}.applytojob.com/apply/${jobId}`
        ];
        
        const boardPatterns = [
            `https://www.linkedin.com/jobs/view/${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            `https://www.indeed.com/viewjob?jk=${Math.random().toString(36).substr(2, 16)}`,
            `https://www.glassdoor.com/job-listing/${jobTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${companySlug}-JV_${Math.floor(Math.random() * 900000) + 100000}`,
            `https://www.ziprecruiter.com/jobs/${companySlug}-${jobId}`
        ];
        
        jobs.push({
            _id: `fallback_${i + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            title: jobTitle,
            company: company,
            location: jobLocation,
            description: description,
            requirements: [
                `${Math.floor(Math.random() * 5) + 1}+ years of experience in ${searchTerm}`,
                'Strong problem-solving and analytical skills',
                'Excellent communication and teamwork abilities',
                'Proven track record of delivering quality results',
                'Continuous learning mindset and adaptability'
            ],
            skills: skills.slice(0, Math.floor(Math.random() * 3) + 4), // Vary skill count
            experienceLevel: expLevel,
            jobType: jobType,
            salaryRange: salary,
            benefits: jobBenefits,
            companySize: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'][i % 5],
            industry: ['Technology', 'FinTech', 'HealthTech', 'E-commerce', 'SaaS'][i % 5],
            workEnvironment: [
                'Fast-paced startup environment with equity opportunities',
                'Collaborative enterprise culture with comprehensive benefits',
                'Research-focused team with academic partnerships',
                'Customer-obsessed culture with data-driven decisions',
                'Innovation-first workplace with flexible working arrangements'
            ][i % 5],
            originalUrl: urlPatterns[i % urlPatterns.length],
            applyUrl: applyPatterns[i % applyPatterns.length],
            jobBoardUrl: boardPatterns[i % boardPatterns.length],
            link: urlPatterns[i % urlPatterns.length],
            postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isExternal: true,
            isAIGenerated: true,
            isFallback: true,
            uniqueId: jobId
        });
    }
    
    
    
    
    return jobs;
}


export const getAvailableCompanies = async (req, res) => {
    try {
        const popularCompanies = [
            { name: 'Google', id: 'google-1441' },
            { name: 'Microsoft', id: 'microsoft-1815218' },
            { name: 'Amazon', id: 'amazon-10667' },
            { name: 'Apple', id: 'apple-162479' },
            { name: 'Meta', id: 'meta-facebook' }, 
            { name: 'Netflix', id: 'netflix-11891' },
            { name: 'Tesla', id: 'tesla-15564' },
            { name: 'Spotify', id: 'spotify-408251' },
            { name: 'Uber', id: 'uber-transport' }, 
            { name: 'Airbnb', id: 'airbnb-481941' }
        ];

        return res.status(200).json({
            success: true,
            companies: popularCompanies
        });
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch companies'
        });
    }
};

export { generateCustomizedFallbackJobs };
