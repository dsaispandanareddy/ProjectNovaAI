import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

type Profile = {
  name: string
  skills: string[]
  interests: string[]
  experience: string
}

const skillOptions = [
  'Python', 'JavaScript', 'React', 'Java', 'C++', 'SQL', 'Machine Learning'
]

const interestOptions = [
  'AI & ML', 'Web Development', 'Mobile Apps',
  'Data Science', 'Cybersecurity', 'Cloud Computing'
]

type Page = 'signup' | 'profile' | 'dashboard'

function App() {
  const [page, setPage] = useState<Page>('signup')
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [experience, setExperience] = useState('Beginner')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [savedProjects, setSavedProjects] = useState<any[]>([])
  const [generatedCount, setGeneratedCount] = useState(0)
  const [exploredCount, setExploredCount] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')

  async function loadProfile(id: string, fallbackName = '') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error

    setUserId(id)
    await loadSavedProjects(id)
    await loadGeneratedCount(id)
    await loadExploredCount(id)

    if (data) {
      const saved: Profile = {
        name: data.full_name,
        skills: data.skills ?? [],
        interests: data.interests ?? [],
        experience: data.experience_level ?? 'Beginner'
      }

      setProfile(saved)
      setName(saved.name)
      setSkills(saved.skills)
      setInterests(saved.interests)
      setExperience(saved.experience)
      setPage('dashboard')
    } else {
      setName(fallbackName)
      setProfile(null)
      setPage('profile')
    }
  }
  
async function loadSavedProjects(id: string) {
  const { data, error } = await supabase
    .from('saved_projects')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (error) throw error
  setSavedProjects(data ?? [])
}

async function loadGeneratedCount(id: string) {
  const { data, error } = await supabase
    .from('generation_history')
    .select('ideas_count')
    .eq('user_id', id)

  if (error) {
    console.error('Could not load generation count:', error)
    return
  }

  const total = (data ?? []).reduce(
    (sum, row) => sum + row.ideas_count,
    0
  )

  setGeneratedCount(total)
}
async function loadExploredCount(id: string) {
  const { count, error } = await supabase
    .from('explored_projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  if (error) {
    console.error('Could not load explored count:', error)
    return
  }

  setExploredCount(count ?? 0)
}



async function saveProject(project: any) {
  if (!userId) return

  const alreadySaved = savedProjects.some(
  saved => saved.title?.trim() === project.title?.trim()
)

  if (alreadySaved) {
    setMessage('This project is already saved!')
    return
  }

  setBusy(true)
  setMessage('')

  try {
    const { data, error } = await supabase
      .from('saved_projects')
      .insert({
        user_id: userId,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        difficulty: project.difficulty,

        problem: project.problem ?? null,
        features: project.features ?? [],
        estimated_duration: project.estimated_duration ?? null,

        objectives: project.objectives ?? [],
        target_users: project.target_users ?? null,
        required_skills: project.required_skills ?? [],
        expected_outcome: project.expected_outcome ?? null,
      })
      .select()
      .single()

    if (error) throw error

    setSavedProjects(previous => [data, ...previous])
    setMessage('Project saved successfully!')
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : 'Could not save project.'
    )
  } finally {
    setBusy(false)
  }
}

async function trackExploredProject(project: any) {
  if (!userId) return

  const { error } = await supabase
    .from('explored_projects')
    .upsert(
      {
        user_id: userId,
        project_title: project.title,
      },
      {
        onConflict: 'user_id,project_title',
        ignoreDuplicates: true,
      }
    )

  if (error) {
    console.error('Could not track explored project:', error)
    return
  }

  await loadExploredCount(userId)
}


async function removeSavedProject(id: string) {
  const { error } = await supabase
    .from('saved_projects')
    .delete()
    .eq('id', id)

  if (error) {
    setMessage(error.message)
    return
  }

  setSavedProjects(previous => previous.filter(project => project.id !== id))
}


  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        if (!active) return

        const user = data.session?.user

        if (user) {
          await loadProfile(
            user.id,
            user.user_metadata?.full_name ?? ''
          )
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : 'Could not load your account.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  const toggle = (
    item: string,
    list: string[],
    setter: (value: string[]) => void
  ) => {
    setter(
      list.includes(item)
        ? list.filter(value => value !== item)
        : [...list, item]
    )
  }

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() }
          }
        })

        if (error) throw error

        if (data.session && data.user) {
          await loadProfile(data.user.id, name.trim())
        } else {
          setMessage(
            'Account created! Check your email to confirm your account, then switch to Login.'
          )
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        if (!data.user) throw new Error('Unable to load your account.')

        await loadProfile(
          data.user.id,
          data.user.user_metadata?.full_name ?? ''
        )
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function saveProfile() {
    if (!userId) {
      setMessage('Please log in again before saving your profile.')
      setPage('signup')
      return
    }

    if (!name.trim() || !skills.length || !interests.length) {
      setMessage('Enter your name and select at least one skill and interest.')
      return
    }

    setBusy(true)
    setMessage('')

    const savedProfile: Profile = {
      name: name.trim(),
      skills,
      interests,
      experience
    }

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: savedProfile.name,
        skills: savedProfile.skills,
        interests: savedProfile.interests,
        experience_level: savedProfile.experience
      })

      if (error) throw error

      setProfile(savedProfile)
      setPage('dashboard')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save your profile.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setMessage('')

    const { error } = await supabase.auth.signOut()

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setUserId(null)
    setProfile(null)
    setName('')
    setEmail('')
    setPassword('')
    setSkills([])
    setInterests([])
    setExperience('Beginner')
    setAuthMode('login')
    setPage('signup')
  }

  if (loading) {
    return <main className="setup-page"><p>Loading ProjectNova AI...</p></main>
  }

  if (page === 'signup') {
    return (
      <main className="setup-page">
        <form className="setup-card" onSubmit={handleAuth}>
          <div className="setup-logo">✦ ProjectNova AI</div>
          <p className="eyebrow">YOUR PROJECT JOURNEY STARTS HERE</p>
          <h1>{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">
            {authMode === 'signup'
              ? 'Discover projects tailored to you.'
              : 'Log in to continue your journey.'}
          </p>

          {authMode === 'signup' && (
            <>
              <label>Full name</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </>
          )}

          <label>Email address</label>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />

          {message && <p role="status" className="setup-note">{message}</p>}

          <button className="setup-submit" type="submit" disabled={busy}>
            {busy
              ? 'Please wait...'
              : authMode === 'signup'
                ? 'Create account →'
                : 'Log in →'}
          </button>

          <p className="setup-note">
            {authMode === 'signup'
              ? 'Already have an account?'
              : 'New to ProjectNova AI?'}
            {' '}
            <button
              type="button"
              className="setup-back"
              onClick={() => {
                setAuthMode(authMode === 'signup' ? 'login' : 'signup')
                setMessage('')
              }}
            >
              {authMode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </form>
      </main>
    )
  }

  if (page === 'profile') {
    return (
      <main className="setup-page">
        <section className="setup-card profile-card">
          <div className="setup-logo">✦ ProjectNova AI</div>
          <p className="eyebrow">PERSONALIZE YOUR EXPERIENCE</p>
          <h1>Let's find your next project.</h1>
          <p className="muted">
            Choose your skills and interests. We'll save them to your account.
          </p>

          <label>Your name</label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />

          <label>Your skills</label>
          <div className="choice-list">
            {skillOptions.map(skill => (
              <button
                type="button"
                key={skill}
                className={skills.includes(skill) ? 'choice selected' : 'choice'}
                onClick={() => toggle(skill, skills, setSkills)}
              >
                {skill}
              </button>
            ))}
          </div>

          <label>Your interests</label>
          <div className="choice-list">
            {interestOptions.map(interest => (
              <button
                type="button"
                key={interest}
                className={interests.includes(interest) ? 'choice selected' : 'choice'}
                onClick={() => toggle(interest, interests, setInterests)}
              >
                {interest}
              </button>
            ))}
          </div>

          <label>Experience level</label>
          <div className="choice-list">
            {['Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button
                type="button"
                key={level}
                className={experience === level ? 'choice selected' : 'choice'}
                onClick={() => setExperience(level)}
              >
                {level}
              </button>
            ))}
          </div>

          {message && <p role="status" className="setup-note">{message}</p>}

          <button
            className="setup-submit"
            disabled={busy}
            onClick={saveProfile}
          >
            {busy ? 'Saving...' : 'Save profile & continue →'}
          </button>
          <button className="setup-back" disabled={busy} onClick={logout}>
            Log out
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="app">
    <Sidebar
         busy={busy}
          logout={logout}
          activeTab={activeTab}
        setActiveTab={(tab) => {
  setSelectedProject(null)
  setActiveTab(tab)
}}
          />

      <main className="main" id="dashboard">
        <header className="topbar">
          <span>Workspace / Dashboard</span>
          <span className="avatar">
            {profile?.name?.charAt(0).toUpperCase() || 'N'}
          </span>
        </header>

       {activeTab === 'dashboard' && (
  <Dashboard
    name={profile?.name || name}
    generatedCount={generatedCount}
    savedCount={savedProjects.length}
    exploredCount={exploredCount}
    onGenerate={() => setActiveTab('generate')}
  />
)}


        {activeTab === 'generate' && (
  <section className="section" id="generate">
          <h2>Ready for your next idea?</h2>
          <p>Choose a difficulty to discover 3 personalized projects.</p>
          <div className="generate-card">
            <div className="sparkle">✦</div>
            <div>
              <h3>Project Idea Generator</h3>
              <p>Start with your goals and experience.</p>
            </div>
          </div>
          <div className="difficulty">
            <h3>Select difficulty</h3>
            <div className="difficulty-options">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  onClick={async () => {
  try {
    setMessage('Generating your 3 project ideas...')

   
const { data: sessionData } = await supabase.auth.getSession()
const accessToken = sessionData.session?.access_token

if (!accessToken) {
  throw new Error('Session expired. Please log in again.')
}

const { data, error } = await supabase.functions.invoke(
  'generate-projects',
  {
    body: {
  difficulty: level,
  outputType: 'ideas',
},
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
)


    if (error) throw error

    
console.log('Generation response:', data)
const generatedIdeas = data?.projects ?? data?.result?.projects ?? []
setProjects(generatedIdeas)

const { error: historyError } = await supabase
  .from('generation_history')
  .insert({
    user_id: userId,
    ideas_count: generatedIdeas.length,
    difficulty: level,
  })

if (historyError) {
  console.error('Could not save generation history:', historyError)
}
else {
  if (userId) {
  await loadGeneratedCount(userId)
}
}
setMessage('')
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : 'Generation failed.'
    )
  }
}}
                >
                  {level}
                </button>
              ))}
            </div>
            {message && <p className="setup-note">{message}</p>}

<div className="project-grid">
  {projects.map((project, index) => (
    <article className="project-card" key={index}>
      <span>PROJECT {index + 1}</span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <p><strong>Technologies:</strong> {
        Array.isArray(project.technologies)
          ? project.technologies.join(', ')
          : project.technologies
      }</p>
      <p><strong>Difficulty:</strong> {project.difficulty}</p>
      


<button
  className="secondary-button"
  onClick={() => {
    setSelectedProject(project)
    void trackExploredProject(project)
  }}
>
  View Details →
</button>

<button
  className="secondary-button"
  disabled={busy}
  onClick={() => saveProject(project)}
>
  {savedProjects.some(
  saved => saved.title?.trim() === project.title?.trim()
)
  ? '♥ Saved'
  : '♡ Save Project'}
</button>


    </article>
  ))}
</div>
          </div>
        </section>
        )}
{selectedProject && (
  <div className="details-overlay">
    <section className="project-details">
      <button
        className="details-close"
        onClick={() => setSelectedProject(null)}
        aria-label="Close project details"
      >
        ✕
      </button>

      <h2>Project Details</h2>
      <h3>{selectedProject.title}</h3>
      <p>{selectedProject.description}</p>

      <p><strong>Problem:</strong> {selectedProject.problem || 'Not provided'}</p>

      <p><strong>Objectives:</strong></p>
      <ul>
        {(selectedProject.objectives ?? []).map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <p><strong>Target Users:</strong> {selectedProject.target_users || 'Not provided'}</p>

      <p><strong>Technologies:</strong></p>
      <ul>
        {(Array.isArray(selectedProject.technologies)
          ? selectedProject.technologies
          : selectedProject.technologies
            ? [selectedProject.technologies]
            : []
        ).map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <p><strong>Required Skills:</strong></p>
      <ul>
        {(selectedProject.required_skills ?? []).map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <p><strong>Features:</strong></p>
      <ul>
        {(selectedProject.features ?? []).map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <p><strong>Difficulty:</strong> {selectedProject.difficulty}</p>
      <p><strong>Estimated Duration:</strong> {selectedProject.estimated_duration || 'Not provided'}</p>
      <p><strong>Expected Outcome:</strong> {selectedProject.expected_outcome || 'Not provided'}</p>

      <button
        className="secondary-button"
        onClick={() => setSelectedProject(null)}
      >
        Close Details
      </button>
    </section>
  </div>
)}

        
{activeTab === 'saved' && (
  <section className="section" id="saved">
  <h2>Saved Projects</h2>
  <p>Your saved ideas are stored in your account.</p>

  {savedProjects.length === 0 ? (
    <div className="empty-state">
      <span>♡</span>
      <h3>No saved projects yet</h3>
      <p>Generate ideas and save the ones you like.</p>
    </div>
  ) : (
    <div className="project-grid">
      {savedProjects.map(project => (
        <article className="project-card" key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>
            <strong>Technologies:</strong>{' '}
            {Array.isArray(project.technologies)
              ? project.technologies.join(', ')
              : project.technologies}
          </p>
          <p>
            <strong>Difficulty:</strong> {project.difficulty}
          </p>
          <div className="project-actions">
  <button
    className="secondary-button"
    onClick={() => setSelectedProject(project)}
  >
    View Details →
  </button>

  <button
    className="secondary-button"
    onClick={() => removeSavedProject(project.id)}
  >
    Remove
  </button>
</div>
        </article>
      ))}
      
      


    </div>
  )}
</section>
)}
        
        {activeTab === 'profile' && (
        <section className="section" id="profile">
          <h2>My Profile</h2>
          <p>Name: {profile?.name}</p>
          <p>Skills: {profile?.skills.join(', ')}</p>
          <p>Interests: {profile?.interests.join(', ')}</p>
          <p>Experience: {profile?.experience}</p>
          <button
            className="secondary-button"
            onClick={() => {
              setMessage('')
              setPage('profile')
            }}
          >
            Edit profile
          </button>
        </section>
        )}

        {activeTab === 'settings' && (
  <section className="section" id="settings">
    <h2>Settings</h2>
    <p>Manage your ProjectNova preferences.</p>
  </section>
)}

        <footer>ProjectNova AI · From ideas to implementation ✨</footer>
      </main>
    </div>
  )
}

export default App
