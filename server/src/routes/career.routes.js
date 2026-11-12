import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import Interview from '../models/Interview.model.js';
import Resume from '../models/Resume.model.js';
import { safeApplyUrl } from '../utils/safeApplyUrl.js';
import { isHeaderSafeCredential } from '../utils/apiCredential.js';

const router = Router();
router.use(authenticate);

const STOP = new Set('the and for with from that this your have will are you our job role work skills experience using use into about able good strong'.split(' '));
const words = (s = '') => [...new Set((s.toLowerCase().match(/[a-z][a-z+#.]{1,}/g) || []).filter(w => !STOP.has(w)))];

router.post('/ats-score', async (req, res, next) => {
  try {
    const { resumeText = '', targetRole = '' } = req.body || {};
    if (typeof resumeText !== 'string' || resumeText.trim().length < 30) return res.status(400).json({ success:false, message:'Paste resume text (at least 30 characters) or upload a PDF first.' });
    const text = resumeText.trim();
    const lower = text.toLowerCase();
    const roleTerms = words(targetRole);
    const present = roleTerms.filter(w => lower.includes(w));
    const missing = roleTerms.filter(w => !lower.includes(w));
    const sections = { contact: /@|\+?\d[\d ()-]{7,}/.test(text), skills: /skills|technologies|technical/i.test(text), experience: /experience|internship|employment|work history/i.test(text), projects: /projects|built|developed|implemented/i.test(text), education: /education|university|college|degree|bachelor/i.test(text) };
    const sectionScore = Object.values(sections).filter(Boolean).length / 5 * 30;
    const keywordScore = roleTerms.length ? present.length / roleTerms.length * 35 : Math.min(words(text).length / 60, 1) * 35;
    const impactScore = (/\b(increased|reduced|improved|saved|achieved|delivered|%|\d+\+?)\b/i.test(text) ? 15 : 5);
    const lengthScore = text.length >= 500 && text.length <= 3500 ? 20 : text.length >= 250 ? 12 : 5;
    const score = Math.round(Math.min(100, sectionScore + keywordScore + impactScore + lengthScore));
    const suggestions = [];
    if (!sections.contact) suggestions.push('Add a professional email and phone number.');
    if (!sections.skills) suggestions.push('Add a clearly labeled Skills section with role-relevant tools.');
    if (!sections.projects) suggestions.push('Add 2–3 projects with your contribution, technologies, and outcome.');
    if (!sections.experience) suggestions.push('Include internship, work, volunteering, or practical experience where relevant.');
    if (!sections.education) suggestions.push('Add education, degree, institution, and expected graduation year.');
    if (!/\b(increased|reduced|improved|achieved|delivered|\d+%)/i.test(text)) suggestions.push('Use measurable impact in bullet points (numbers only when truthful).');
    if (missing.length) suggestions.push(`Consider adding relevant keywords if you genuinely have these skills: ${missing.slice(0, 12).join(', ')}.`);
    res.json({ success:true, data:{ score, targetRole, presentKeywords:present, missingKeywords:missing, sections, suggestions, disclaimer:'This is a transparent heuristic check, not a guarantee of any employer ATS score or interview.' } });
  } catch (e) { next(e); }
});

router.get('/roadmap', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId:req.user._id });
    const interviews = await Interview.find({ userId:req.user._id, status:'completed' }).sort({ updatedAt:-1 }).limit(20).lean();
    const resumeText = resume?.extractedText || '';
    const allText = `${resumeText} ${interviews.map(i => JSON.stringify(i.feedback || '')).join(' ')}`.toLowerCase();
    const skills = [
      ['JavaScript fundamentals', /javascript|typescript/.test(allText), 'Review scope, closures, promises, async/await and write 3 small exercises.'],
      ['Data structures & algorithms', /algorithm|data structure|leetcode|complexity/.test(allText), 'Practice arrays, strings, hash maps, stacks and time-complexity analysis.'],
      ['SQL and databases', /sql|mongodb|database|mongoose/.test(allText), 'Build queries, model relationships, indexes and explain query trade-offs.'],
      ['Projects and impact', /project|developed|implemented|built/.test(resumeText.toLowerCase()), 'Document one project with problem, architecture, your contribution and measurable outcome.'],
      ['Behavioral answers', interviews.some(i => (i.feedback?.areasOfImprovement || []).length), 'Practice STAR answers for teamwork, conflict, failure and learning.'],
      ['Communication practice', interviews.length >= 2, 'Record a 60–90 second answer, then remove filler and lead with the main point.'],
    ];
    const items = skills.map(([title,done,action],i)=>({ id:i+1,title,status:done?'Review & strengthen':'Priority to learn',completed:Boolean(done),action,week:i<2?'Week 1':i<4?'Week 2':'Week 3' }));
    res.json({ success:true, data:{ items, resumeUploaded:Boolean(resume), completedInterviews:interviews.length, note:'Recommendations are generated from saved resume text and interview records; they are guidance, not a formal skills certification.' } });
  } catch(e) { next(e); }
});

router.get('/analytics', async (req,res,next)=>{
  try {
    const interviews = await Interview.find({ userId:req.user._id }).sort({ createdAt:1 }).lean();
    const completed = interviews.filter(i=>i.status==='completed');
    const scored = completed.filter(i=>Number.isFinite(i.overallScore));
    const average = scored.length ? Math.round(scored.reduce((s,i)=>s+i.overallScore,0)/scored.length) : 0;
    const recent = scored.slice(-8).map(i=>({ date:i.createdAt, role:i.role, score:i.overallScore }));
    const roles = Object.entries(completed.reduce((acc,i)=>{acc[i.role]=(acc[i.role]||0)+1;return acc;},{})).map(([role,count])=>({role,count})).sort((a,b)=>b.count-a.count);
    res.json({success:true,data:{total:interviews.length,completed:completed.length,inProgress:interviews.length-completed.length,averageScore:average,scoredCount:scored.length,recent,roles}});
  } catch(e) { next(e); }
});

router.get('/jobs', async (req,res,next)=>{
  try {
    const query = String(req.query.q || 'software developer').slice(0,100);
    const location = String(req.query.location || 'India').slice(0,80);
    const results = [];
    const providerWarnings = [];
    const add = (job) => { const applyUrl=safeApplyUrl(job.applyUrl || job.url); if (!applyUrl) return; results.push({ id:String(job.id || applyUrl), title:String(job.title || 'Opportunity'), company:String(job.company || 'Company not listed'), location:String(job.location || 'Location not specified'), description:String(job.description || '').replace(/<[^>]*>/g,' ').slice(0,500), type:String(job.type || 'Job'), source:String(job.source || 'Job provider'), applyUrl, published:job.published || null }); };
    const indianApiKey = String(process.env.INDIANAPI_JOBS_API_KEY || '').trim();
    if (indianApiKey && !isHeaderSafeCredential(indianApiKey)) {
      providerWarnings.push('IndianAPI key is not valid text for an HTTP header. It may have been copied from the masked display (for example, sk-liv••••••YhxF). Use the API dashboard Copy button to copy the full, unmasked key, update server/.env, and restart the backend.');
    } else if (indianApiKey) {
      const params = new URLSearchParams({ limit:'50', title:query, location });
      const response = await fetch(`https://jobs.indianapi.in/jobs?${params}`, { headers:{ 'X-Api-Key':indianApiKey }, signal:AbortSignal.timeout(10000) });
      if (response.ok) {
        const payload = await response.json();
        const candidateRows = Array.isArray(payload) ? payload : (payload.jobs || payload.data || payload.results || []);
        const rows = Array.isArray(candidateRows) ? candidateRows : [];
        for (const j of rows) add({ id:j.id, title:j.title || j.job_title, company:j.company || j.company_name, location:j.location, description:j.job_description || j.role_and_responsibility || j.education_and_skills, url:j.apply_link, type:j.job_type || (/intern/i.test(j.title || '')?'Internship':'Job'), source:'IndianAPI Jobs', published:j.posted_date });
      } else {
        providerWarnings.push(`IndianAPI Jobs returned HTTP ${response.status}. Verify that the key is copied correctly and the subscription is active.`);
      }
    }
    if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY && results.length < 10) {
      const params = new URLSearchParams({ app_id:process.env.ADZUNA_APP_ID, app_key:process.env.ADZUNA_APP_KEY, results_per_page:'20', what:query, where:location, 'content-type':'application/json' });
      const response = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/1?${params}`, { signal:AbortSignal.timeout(10000) });
      if (response.ok) { const data=await response.json(); for(const j of data.results||[]) add({id:j.id,title:j.title,company:j.company?.display_name,location:j.location?.display_name,description:j.description,url:j.redirect_url,type:/intern/i.test(j.title)?'Internship':'Job',source:'Adzuna',published:j.created}); }
    }
    // Remotive is a supplementary remote-only feed. Keep only records whose source URLs are valid HTTPS links.
    if (results.length < 5 && /remote|worldwide|india/i.test(location)) {
      try { const response=await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`,{signal:AbortSignal.timeout(9000)}); if(response.ok){const data=await response.json();for(const j of (data.jobs||[]).slice(0,20)) add({id:j.id,title:j.title,company:j.company_name,location:'Remote (check country eligibility)',description:j.description,url:j.url,type:/intern/i.test(j.title)?'Internship':'Remote job',source:'Remotive',published:j.publication_date});} } catch { /* optional provider */ }
    }
    const defaultMessage = results.length
      ? 'Listings returned by configured public job feeds. Check the employer page for current availability.'
      : 'No live listings were returned. Configure valid provider credentials in server/.env for India-specific search. No sample jobs are substituted.';
    res.json({success:true,data:{jobs:results,providers:{indianApiConfigured:Boolean(indianApiKey && isHeaderSafeCredential(indianApiKey)),adzunaConfigured:Boolean(process.env.ADZUNA_APP_ID&&process.env.ADZUNA_APP_KEY),remoteFallback:'Remotive'},message:[...providerWarnings,defaultMessage].join(' ')}});
  } catch(e) { next(e); }
});
export default router;
