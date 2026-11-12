import { useEffect, useState } from 'react';
import API from '../../services/api.js';
import INTERVIEW_ROLES from '../../constants/roles.js';
import toast from 'react-hot-toast';
import './index.css';

const EMPTY_CLASS = { title: '', description: '', category: 'Programming', level: 'Beginner', duration: '', videoUrl: '', published: true };
const EMPTY_QUESTION = { role: 'all', difficulty: 'medium', type: 'technical', text: '', codeType: 'write', codeLanguage: 'javascript', codeSnippet: '', isActive: true };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [classForm, setClassForm] = useState(EMPTY_CLASS);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);
  const [editingClass, setEditingClass] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, classRes, questionRes] = await Promise.all([
        API.get('/admin/summary'), API.get('/admin/classes'), API.get('/admin/questions'),
      ]);
      setSummary(summaryRes.data.data);
      setClasses(classRes.data.data || []);
      setQuestions(questionRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load admin data');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const saveClass = async (event) => {
    event.preventDefault();
    try {
      if (editingClass) await API.put(`/admin/classes/${editingClass}`, classForm);
      else await API.post('/admin/classes', classForm);
      toast.success(editingClass ? 'Class updated' : 'Class created');
      setClassForm(EMPTY_CLASS); setEditingClass(null); await loadAll();
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save class'); }
  };

  const editClass = (item) => {
    setClassForm({ title: item.title, description: item.description, category: item.category, level: item.level, duration: item.duration || '', videoUrl: item.videoUrl, published: item.published });
    setEditingClass(item._id); setTab('classes'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeClass = async (id) => {
    if (!window.confirm('Delete this learning class?')) return;
    try { await API.delete(`/admin/classes/${id}`); toast.success('Class deleted'); await loadAll(); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not delete class'); }
  };

  const saveQuestion = async (event) => {
    event.preventDefault();
    try {
      if (editingQuestion) await API.put(`/admin/questions/${editingQuestion}`, questionForm);
      else await API.post('/admin/questions', questionForm);
      toast.success(editingQuestion ? 'Interview question updated' : 'Interview question added');
      setQuestionForm(EMPTY_QUESTION); setEditingQuestion(null); await loadAll();
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save question'); }
  };

  const editQuestion = (item) => {
    setQuestionForm({ role: item.role, difficulty: item.difficulty, type: item.type, text: item.text, codeType: item.codeType || 'write', codeLanguage: item.codeLanguage || 'javascript', codeSnippet: item.codeSnippet || '', isActive: item.isActive });
    setEditingQuestion(item._id); setTab('questions'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeQuestion = async (id) => {
    if (!window.confirm('Delete this interview question?')) return;
    try { await API.delete(`/admin/questions/${id}`); toast.success('Question deleted'); await loadAll(); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not delete question'); }
  };

  return <main className="admin-page">
    <header className="admin-hero"><div><span className="admin-eyebrow">PLATFORM CONTROL CENTER</span><h1>Admin <span>workspace</span></h1><p>Manage learning content and the question bank used in new mock interviews.</p></div><div className="admin-shield">ADMIN</div></header>
    <nav className="admin-tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button><button className={tab === 'classes' ? 'active' : ''} onClick={() => setTab('classes')}>Learning classes</button><button className={tab === 'questions' ? 'active' : ''} onClick={() => setTab('questions')}>Interview questions</button></nav>

    {tab === 'overview' && <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">LIVE PLATFORM TOTALS</span><h2>Workspace overview</h2></div><button className="admin-secondary" onClick={loadAll} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh data'}</button></div><div className="admin-stat-grid">{[['Registered users', summary?.users ?? '—'], ['Interview sessions', summary?.interviews ?? '—'], ['Learning classes', summary?.classes ?? '—'], ['Question bank', summary?.questions ?? '—']].map(([label,value]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="admin-tip"><strong>How admin content is used</strong><p>Published learning classes appear in users’ Career Hub → Learning Classes. Active questions matching a selected role and difficulty are included in new interviews. Questions already inside an interview are not retroactively changed.</p></div><div className="admin-quick-actions"><button className="admin-primary" onClick={() => setTab('classes')}>＋ Add a learning class</button><button className="admin-secondary" onClick={() => setTab('questions')}>＋ Manage interview questions</button></div></section>}

    {tab === 'classes' && <section className="admin-layout"><form className="admin-panel admin-form" onSubmit={saveClass}><div className="admin-panel-heading"><div><span className="admin-eyebrow">CONTENT MANAGEMENT</span><h2>{editingClass ? 'Edit learning class' : 'Add a learning class'}</h2></div></div>
      <label>Class title<input required minLength={3} maxLength={120} value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} placeholder="e.g. JavaScript Fundamentals" /></label>
      <label>Description<textarea required minLength={10} maxLength={1200} rows={4} value={classForm.description} onChange={e => setClassForm({ ...classForm, description: e.target.value })} placeholder="What will students learn?" /></label>
      <div className="admin-form-row"><label>Category<input required value={classForm.category} onChange={e => setClassForm({ ...classForm, category: e.target.value })} placeholder="Programming" /></label><label>Level<select value={classForm.level} onChange={e => setClassForm({ ...classForm, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div>
      <div className="admin-form-row"><label>Duration<input value={classForm.duration} onChange={e => setClassForm({ ...classForm, duration: e.target.value })} placeholder="e.g. 4 hours" /></label><label>Video URL (HTTPS)<input type="url" required value={classForm.videoUrl} onChange={e => setClassForm({ ...classForm, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></label></div>
      <label className="admin-checkbox"><input type="checkbox" checked={classForm.published} onChange={e => setClassForm({ ...classForm, published: e.target.checked })} /> Publish for users immediately</label>
      <div className="admin-form-actions"><button className="admin-primary" type="submit">{editingClass ? 'Save class' : 'Create class'}</button>{editingClass && <button type="button" className="admin-secondary" onClick={() => { setClassForm(EMPTY_CLASS); setEditingClass(null); }}>Cancel edit</button>}</div>
    </form><section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">CURRENT LIBRARY</span><h2>Learning classes <small>({classes.length})</small></h2></div></div>{classes.map(item => <article className="admin-list-item" key={item._id}><div className="admin-list-copy"><strong>{item.title}</strong><p>{item.category} · {item.level} · {item.published ? 'Published' : 'Draft'}</p><small>{item.videoUrl}</small></div><div className="admin-item-actions"><button className="admin-secondary" onClick={() => editClass(item)}>Edit</button><button className="admin-danger" onClick={() => removeClass(item._id)}>Delete</button></div></article>)}{!classes.length && <p className="admin-empty">No learning classes yet. Add the first class using the form.</p>}</section></section>}

    {tab === 'questions' && <section className="admin-layout"><form className="admin-panel admin-form" onSubmit={saveQuestion}><div className="admin-panel-heading"><div><span className="admin-eyebrow">INTERVIEW CONTENT</span><h2>{editingQuestion ? 'Edit interview question' : 'Add an interview question'}</h2></div></div>
      <div className="admin-form-row"><label>Target role<select value={questionForm.role} onChange={e => setQuestionForm({ ...questionForm, role: e.target.value })}><option value="all">All roles</option>{INTERVIEW_ROLES.map(role => <option key={role.id} value={role.id}>{role.title}</option>)}</select></label><label>Difficulty<select value={questionForm.difficulty} onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}><option value="all">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div>
      <div className="admin-form-row"><label>Question type<select value={questionForm.type} onChange={e => setQuestionForm({ ...questionForm, type: e.target.value })}><option value="behavioral">Behavioral</option><option value="technical">Technical</option><option value="coding">Coding</option></select></label>{questionForm.type === 'coding' && <label>Coding task<select value={questionForm.codeType} onChange={e => setQuestionForm({ ...questionForm, codeType: e.target.value })}><option value="write">Write code</option><option value="fix">Fix code</option><option value="explain">Explain code</option></select></label>}</div>
      <label>Question text<textarea required minLength={10} maxLength={1600} rows={4} value={questionForm.text} onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })} placeholder="Write a clear interview question..." /></label>
      {questionForm.type === 'coding' && <><label>Programming language<input value={questionForm.codeLanguage} onChange={e => setQuestionForm({ ...questionForm, codeLanguage: e.target.value })} placeholder="javascript" /></label><label>Code snippet {questionForm.codeType !== 'write' ? '(required)' : '(optional)'}<textarea rows={5} value={questionForm.codeSnippet} onChange={e => setQuestionForm({ ...questionForm, codeSnippet: e.target.value })} placeholder="Paste the code shown to the candidate..." /></label></>}
      <label className="admin-checkbox"><input type="checkbox" checked={questionForm.isActive} onChange={e => setQuestionForm({ ...questionForm, isActive: e.target.checked })} /> Active for new interviews</label>
      <div className="admin-form-actions"><button className="admin-primary" type="submit">{editingQuestion ? 'Save question' : 'Add question'}</button>{editingQuestion && <button type="button" className="admin-secondary" onClick={() => { setQuestionForm(EMPTY_QUESTION); setEditingQuestion(null); }}>Cancel edit</button>}</div>
    </form><section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-eyebrow">MANAGED QUESTION BANK</span><h2>Questions <small>({questions.length})</small></h2></div></div>{questions.map(item => <article className="admin-list-item" key={item._id}><div className="admin-list-copy"><strong>{item.text}</strong><p>{item.role === 'all' ? 'All roles' : item.role} · {item.difficulty} · {item.type} · {item.isActive ? 'Active' : 'Inactive'}</p></div><div className="admin-item-actions"><button className="admin-secondary" onClick={() => editQuestion(item)}>Edit</button><button className="admin-danger" onClick={() => removeQuestion(item._id)}>Delete</button></div></article>)}{!questions.length && <p className="admin-empty">No managed questions yet. Add questions to customize upcoming interviews.</p>}</section></section>}
  </main>;
}
