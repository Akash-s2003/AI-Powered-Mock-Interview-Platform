const fail = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

export const validateLearningClass = (input = {}) => {
  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const category = String(input.category || '').trim();
  const videoUrl = String(input.videoUrl || '').trim();
  const level = String(input.level || 'Beginner');
  const duration = String(input.duration || '').trim();

  if (title.length < 3 || title.length > 120) fail('Class title must be between 3 and 120 characters.');
  if (description.length < 10 || description.length > 1200) fail('Class description must be between 10 and 1200 characters.');
  if (!category || category.length > 80) fail('A category is required (maximum 80 characters).');
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) fail('Choose a valid class level.');
  let parsedUrl;
  try { parsedUrl = new URL(videoUrl); } catch { fail('Enter a valid HTTPS learning video URL.'); }
  if (parsedUrl.protocol !== 'https:') fail('Learning video URLs must use HTTPS.');

  return {
    title, description, category, level, duration, videoUrl,
    published: input.published !== false && input.published !== 'false',
  };
};

export const validateInterviewQuestion = (input = {}) => {
  const role = String(input.role || '').trim().toLowerCase();
  const difficulty = String(input.difficulty || 'medium').toLowerCase();
  const type = String(input.type || 'technical').toLowerCase();
  const text = String(input.text || '').trim();
  const codeType = String(input.codeType || 'write').toLowerCase();
  const codeLanguage = String(input.codeLanguage || 'javascript').trim().toLowerCase();
  const codeSnippet = String(input.codeSnippet || '').trim();
  if (!role || role.length > 80) fail('Select a role for this question.');
  if (!['all', 'easy', 'medium', 'hard'].includes(difficulty)) fail('Choose a valid difficulty.');
  if (!['behavioral', 'technical', 'coding'].includes(type)) fail('Choose a valid question type.');
  if (text.length < 10 || text.length > 1600) fail('Question text must be between 10 and 1600 characters.');
  if (!['write', 'fix', 'explain'].includes(codeType)) fail('Choose a valid coding task type.');
  if (codeLanguage.length > 40 || codeSnippet.length > 8000) fail('Coding language or snippet is too long.');
  if (type === 'coding' && !codeSnippet && (codeType === 'fix' || codeType === 'explain')) {
    fail('A code snippet is required for fix or explain questions.');
  }
  return { role, difficulty, type, text, codeType, codeLanguage, codeSnippet, isActive: input.isActive !== false && input.isActive !== 'false' };
};
