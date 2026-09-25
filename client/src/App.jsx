import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'https://tvet-project.onrender.com/api'
const companies = [
  { name: 'TCS', color: '#2c67f2' }, { name: 'HCLTech', color: '#00a88f' },
  { name: 'Infosys', color: '#1475c9' }, { name: 'Wipro', color: '#7a36d7' },
  { name: 'Accenture', color: '#a100ff' }, { name: 'Cognizant', color: '#1769aa' },
  { name: 'Capgemini', color: '#0070ad' }, { name: 'Deloitte', color: '#86bc25' },
  { name: 'IBM', color: '#1261a0' }, { name: 'Amazon', color: '#e47911' },
]
const emptyForm = { name: '', email: '', rollNumber: '', dob: '', bloodGroup: '', phone: '', address: '', department: '', gender: '', year: '', section: '', arrears: '' }
function App() {
  const [activeView, setActiveView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [students, setStudents] = useState([])
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  useEffect(() => {
    fetch(`${API_URL}/registrations`)
      .then((response) => { if (!response.ok) throw new Error('Failed to load registrations'); return response.json() })
      .then(setStudents)
      .catch(() => setNotice('Could not connect to the registration server'))
  }, [])
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submitRegistration = async (preferences = []) => {
    try {
      const response = await fetch(`${API_URL}/registrations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, companies: preferences }) })
      if (!response.ok) throw new Error('Failed to save registration')
      const registration = await response.json()
      setStudents((current) => [registration, ...current]); setForm(emptyForm); setSelectedCompanies([]); setStep(1); setActiveView('admin'); setNotice('Registration saved successfully')
    } catch {
      setNotice('Could not save registration. Please try again.')
    }
  }
  const handleDetailsSubmit = (event) => { event.preventDefault(); Number(form.arrears) === 0 ? setStep(2) : submitRegistration() }
  const toggleCompany = (company) => setSelectedCompanies((current) => current.includes(company) ? current.filter((item) => item !== company) : current.length < 4 ? [...current, company] : current)
  const groupedStudents = useMemo(() => companies.map((company) => ({ ...company, students: students.filter((student) => student.companies?.includes(company.name)) })), [students])
  const filteredStudents = students.filter((student) => [student.name, student.rollNumber, student.department, student.email].join(' ').toLowerCase().includes(query.toLowerCase()))
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">CR</span><span>Campus<span>Registry</span></span></div><div className="sidebar-label">Workspace</div><button className={`nav-item ${activeView === 'register' ? 'active' : ''}`} onClick={() => { setActiveView('register'); setNotice('') }}><span>＋</span> New registration</button><button className={`nav-item ${activeView === 'admin' ? 'active' : ''}`} onClick={() => { setActiveView('admin'); setNotice('') }}><span>▦</span> Registration desk</button><div className="sidebar-footer"><div className="avatar">AD</div><div><strong>Admissions office</strong><small>Administrator</small></div><span className="more">•••</span></div></aside>
    <main className="main-content"><header className="topbar"><div><span className="eyebrow">ACADEMIC YEAR 2025 / 26</span><h1>{activeView === 'register' ? 'Student registration' : 'Registration desk'}</h1></div><div className="topbar-actions"><span className="status-dot">● Live</span><button className="icon-button" aria-label="Notifications">♢</button><div className="top-avatar">AD</div></div></header>
      {notice && <div className="notice">✓ {notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
      {activeView === 'register' ? <section className="registration-view"><div className="intro"><div><p className="kicker">WELCOME TO THE CAMPUS REGISTRY</p><h2>Let’s get you<br /><em>registered.</em></h2><p className="intro-copy">Enter your academic details carefully. This information will be used for placement eligibility and communication.</p></div><div className="intake-badge"><span>OPEN INTAKE</span><strong>01</strong><small>of 02 steps</small></div></div><div className="stepper"><div className={`step ${step === 1 ? 'current' : 'done'}`}><span>01</span><div><strong>Student details</strong><small>Personal & academic information</small></div></div><div className="step-line" /><div className={`step ${step === 2 ? 'current' : ''}`}><span>02</span><div><strong>Company preferences</strong><small>Only for students with 0 arrears</small></div></div></div>{step === 1 ? <DetailsForm form={form} updateField={updateField} onSubmit={handleDetailsSubmit} /> : <CompanyStep selectedCompanies={selectedCompanies} toggleCompany={toggleCompany} onBack={() => setStep(1)} onSubmit={() => submitRegistration(selectedCompanies)} />}</section> : <AdminView students={students} groupedStudents={groupedStudents} filteredStudents={filteredStudents} query={query} setQuery={setQuery} />}</main>
  </div>
}

function DetailsForm({ form, updateField, onSubmit }) {
  return <form className="form-panel" onSubmit={onSubmit}><div className="panel-heading"><div><span className="section-number">01</span><h3>Personal information</h3></div><span className="required-note">* Required fields</span></div><div className="form-grid"><Field label="Full name" name="name" value={form.name} onChange={updateField} placeholder="e.g. Ananya Sharma" required /><Field label="Student email" name="email" type="email" value={form.email} onChange={updateField} placeholder="you@university.edu" required /><Field label="Roll number" name="rollNumber" value={form.rollNumber} onChange={updateField} placeholder="e.g. 21CSE042" required /><Field label="Date of birth" name="dob" type="date" value={form.dob} onChange={updateField} required /><Select label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={updateField} options={['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']} required /><Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="+91 98765 43210" required /><div className="field full"><label htmlFor="address">Address <b>*</b></label><textarea id="address" name="address" value={form.address} onChange={updateField} placeholder="House number, street, city, state" rows="3" required /></div></div><div className="panel-heading academic-heading"><div><span className="section-number">02</span><h3>Academic information</h3></div></div><div className="form-grid"><Select label="Department / course" name="department" value={form.department} onChange={updateField} options={['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Artificial Intelligence & Data Science']} required /><Select label="Gender" name="gender" value={form.gender} onChange={updateField} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} required /><Select label="Year" name="year" value={form.year} onChange={updateField} options={['1st year', '2nd year', '3rd year', '4th year']} required /><Select label="Section" name="section" value={form.section} onChange={updateField} options={['A', 'B', 'C', 'D']} required /><Select label="Number of arrears" name="arrears" value={form.arrears} onChange={updateField} options={['0', '1', '2', '3', '4+']} required /></div><div className="form-actions"><span><b>⌁</b> Your information is kept private and secure.</span><button className="primary-button" type="submit">Continue <span>→</span></button></div></form>
}

function CompanyStep({ selectedCompanies, toggleCompany, onBack, onSubmit }) {
  return <div className="form-panel company-panel"><div className="panel-heading"><div><span className="section-number">02</span><h3>Company preferences</h3></div><span className="selection-count">{selectedCompanies.length} / 4 selected</span></div><div className="company-intro"><div className="lock-icon">✦</div><div><strong>You’re eligible for the placement track.</strong><p>Choose exactly four companies you would like to be considered for. Your preferences will be shared with the placement cell.</p></div></div><div className="company-grid">{companies.map((company) => <button type="button" key={company.name} className={`company-option ${selectedCompanies.includes(company.name) ? 'selected' : ''}`} onClick={() => toggleCompany(company.name)}><span className="company-logo" style={{ backgroundColor: company.color }}>{company.name.slice(0, 1)}</span><span><strong>{company.name}</strong><small>Preference {selectedCompanies.indexOf(company.name) + 1 || '—'}</small></span><span className="check">{selectedCompanies.includes(company.name) ? '✓' : '＋'}</span></button>)}</div><div className="form-actions"><button className="back-button" type="button" onClick={onBack}>← Back to details</button><button className="primary-button" type="button" disabled={selectedCompanies.length !== 4} onClick={onSubmit}>Submit registration <span>→</span></button></div></div>
}

function AdminView({ students, groupedStudents, filteredStudents, query, setQuery }) {
  return <section className="admin-view"><div className="admin-summary"><div><p className="kicker">PLACEMENT CELL / OVERVIEW</p><h2>Know your <em>intake.</em></h2><p className="intro-copy">A live view of student registrations and their preferred companies.</p></div><div className="summary-stats"><div><strong>{students.length}</strong><span>Total students</span></div><div><strong>{students.filter((student) => Number(student.arrears) === 0).length}</strong><span>Placement ready</span></div></div></div><div className="company-overview"><div className="admin-section-header"><div><h3>Company-wise interest</h3><p>Students who selected each company as a preference.</p></div><span className="updated">● Updated just now</span></div><div className="company-bars">{groupedStudents.map((company) => <div className="bar-row" key={company.name}><div className="bar-label"><span className="company-logo mini" style={{ backgroundColor: company.color }}>{company.name.slice(0, 1)}</span><strong>{company.name}</strong><span>{company.students.length}</span></div><div className="bar-track"><div className="bar-fill" style={{ width: `${students.length ? Math.max((company.students.length / students.length) * 100, company.students.length ? 5 : 0) : 0}%`, backgroundColor: company.color }} /></div></div>)}</div></div><div className="student-directory"><div className="admin-section-header"><div><h3>All registrations <span>{students.length}</span></h3><p>Search and review submitted student records.</p></div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students" /></label></div>{filteredStudents.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Department</th><th>Arrears</th><th>Preferences</th></tr></thead><tbody>{filteredStudents.map((student) => <tr key={student.id}><td><strong>{student.name}</strong><small>{student.email}</small></td><td>{student.rollNumber}</td><td>{student.department}</td><td><span className={`arrears ${Number(student.arrears) === 0 ? 'clear' : ''}`}>{student.arrears}</span></td><td>{student.companies?.length ? <div className="preference-pills">{student.companies.map((company) => <span key={company}>{company}</span>)}</div> : <span className="muted">Not eligible</span>}</td></tr>)}</tbody></table></div> : <div className="empty-state">No registrations match “{query}”.</div>}</div></section>
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required }) { return <div className="field"><label htmlFor={name}>{label} {required && <b>*</b>}</label><input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} /></div> }
function Select({ label, name, value, onChange, options, required }) { return <div className="field"><label htmlFor={name}>{label} {required && <b>*</b>}</label><select id={name} name={name} value={value} onChange={onChange} required={required}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div> }

export default App
