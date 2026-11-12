import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLearningClass, validateInterviewQuestion } from '../src/utils/adminValidation.js';
import { roleIsAllowed } from '../src/utils/roleAccess.js';

test('learning class accepts valid HTTPS course URLs', () => {
  const result = validateLearningClass({
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of modern JavaScript.',
    category: 'Programming',
    level: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=abc123',
  });
  assert.equal(result.title, 'JavaScript Fundamentals');
  assert.equal(result.published, true);
});

test('learning class rejects non-HTTPS URLs', () => {
  assert.throws(() => validateLearningClass({
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of modern JavaScript.',
    category: 'Programming',
    videoUrl: 'http://example.com/video',
  }), /must use HTTPS/);
});

test('interview question accepts a role-specific technical question', () => {
  const result = validateInterviewQuestion({
    role: 'frontend-developer', difficulty: 'medium', type: 'technical',
    text: 'How does React reconcile updates to the virtual DOM?',
  });
  assert.equal(result.role, 'frontend-developer');
  assert.equal(result.type, 'technical');
});

test('coding fix question requires a code snippet', () => {
  assert.throws(() => validateInterviewQuestion({
    role: 'all', difficulty: 'hard', type: 'coding', codeType: 'fix',
    text: 'Find and fix the bug in this function.',
  }), /code snippet is required/);
});

test('question bank supports all roles and all difficulty levels', () => {
  const result = validateInterviewQuestion({
    role: 'all', difficulty: 'all', type: 'behavioral', text: 'Tell me about a difficult team challenge you handled.', isActive: false,
  });
  assert.equal(result.role, 'all');
  assert.equal(result.difficulty, 'all');
  assert.equal(result.isActive, false);
});

test('only admin role can access admin-protected routes', () => {
  assert.equal(roleIsAllowed('admin', ['admin']), true);
  assert.equal(roleIsAllowed('user', ['admin']), false);
  assert.equal(roleIsAllowed(undefined, ['admin']), false);
});

test('admin role is not accidentally included in user-only routes', () => {
  assert.equal(roleIsAllowed('user', ['user']), true);
  assert.equal(roleIsAllowed('admin', ['user']), false);
});
