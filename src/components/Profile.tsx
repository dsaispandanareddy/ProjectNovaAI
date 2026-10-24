
import { useState } from 'react'
import './Profile.css'
type ProfileData = {
  name: string
  skills: string[]
  interests: string[]
  experience: string
}

type ProfileProps = {
  profile: ProfileData | null
  userId: string | null
  onSave: (updates: ProfileData) => Promise<void>
}

const skillOptions = [
  'Python', 'JavaScript', 'React', 'Java', 'C++', 'SQL',
  'Machine Learning',
]

const interestOptions = [
  'AI & ML', 'Web Development', 'Mobile Apps',
  'Data Science', 'Cybersecurity', 'Cloud Computing',
]

function Profile({ profile, userId, onSave }: ProfileProps) {
  const [skills, setSkills] = useState(profile?.skills ?? [])
  const [interests, setInterests] = useState(profile?.interests ?? [])
  const [editing, setEditing] = useState(false)
  const [showId, setShowId] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const currentProfile = profile ?? {
    name: 'ProjectNova Member',
    skills: [],
    interests: [],
    experience: 'Beginner',
  }

  const toggle = (
    value: string,
    values: string[],
    setter: (values: string[]) => void,
  ) => {
    setter(
      values.includes(value)
        ? values.filter(item => item !== value)
        : [...values, value],
    )
  }

  // Chart shows selected skill/interest distribution,
  // not a measured proficiency score.
  const axes = [
    {
      label: 'Programming',
      value: skills.some(s =>
        ['Python', 'Java', 'C++', 'JavaScript'].includes(s),
      ) ? 1 : 0,
    },
    {
      label: 'Web',
      value: skills.includes('React') ||
        interests.includes('Web Development') ? 1 : 0,
    },
    {
      label: 'Data & AI',
      value: skills.includes('Machine Learning') ||
        skills.includes('SQL') ||
        interests.some(i => ['AI & ML', 'Data Science'].includes(i))
        ? 1 : 0,
    },
    {
      label: 'Security',
      value: interests.includes('Cybersecurity') ? 1 : 0,
    },
    {
      label: 'Cloud',
      value: interests.includes('Cloud Computing') ? 1 : 0,
    },
  ]

  const center = 120
  const radius = 70
  const points = axes.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2
    const distance = radius * (axis.value ? 1 : 0.12)
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`
  }).join(' ')

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      await onSave({
        name: currentProfile.name,
        skills,
        interests,
        experience: currentProfile.experience,
      })
      setEditing(false)
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="profile-page">
      <div className="profile-heading">
        <div>
          <h2>My Profile</h2>
          <p>Your skills, interests, and project journey.</p>
        </div>
        <button
          className="profile-edit-button"
          onClick={() => {
            setSkills(profile?.skills ?? [])
            setInterests(profile?.interests ?? [])
            setEditing(!editing)
            setMessage('')
          }}
        >
          {editing ? 'Cancel' : '✎ Edit Profile'}
        </button>
      </div>

      <article className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar">
            {currentProfile.name.charAt(0).toUpperCase() || 'N'}
          </div>
          <div>
            <h3>{currentProfile.name}</h3>
            <p>ProjectNova Member</p>
            <span className="profile-level">
              {currentProfile.experience}
            </span>
          </div>
        </div>

        <div className="profile-member-id">
          <div>
            <strong>Personalized Member ID</strong>
            <p>{showId ? userId ?? 'Not available' : '••••••••••••'}</p>
          </div>
          <button onClick={() => setShowId(!showId)}>
            {showId ? 'Hide ID' : 'Reveal ID'}
          </button>
        </div>
      </article>

      <div className="profile-grid">
        <article className="profile-panel">
          <div className="profile-panel-heading">
            <h3>My Skills</h3>
            <span>{skills.length} selected</span>
          </div>

          {editing ? (
            <div className="profile-options">
              {skillOptions.map(skill => (
                <label key={skill} className="profile-option">
                  <input
                    type="checkbox"
                    checked={skills.includes(skill)}
                    onChange={() => toggle(skill, skills, setSkills)}
                  />
                  {skill}
                </label>
              ))}
            </div>
          ) : (
            <div className="profile-tags">
              {skills.length ? skills.map(skill => (
                <span key={skill}>{skill}</span>
              )) : <p>Add your skills using Edit Profile.</p>}
            </div>
          )}
        </article>

        <article className="profile-panel">
          <div className="profile-panel-heading">
            <h3>My Interests</h3>
            <span>{interests.length} selected</span>
          </div>

          {editing ? (
            <div className="profile-options">
              {interestOptions.map(interest => (
                <label key={interest} className="profile-option">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() =>
                      toggle(interest, interests, setInterests)
                    }
                  />
                  {interest}
                </label>
              ))}
            </div>
          ) : (
            <div className="profile-tags">
              {interests.length ? interests.map(interest => (
                <span key={interest}>{interest}</span>
              )) : <p>Add your interests using Edit Profile.</p>}
            </div>
          )}
        </article>
      </div>

      <article className="profile-panel profile-analytics">
        <div>
          <h3>Skills Analytics</h3>
          <p>Your selected skills and interests at a glance.</p>
        </div>
        <svg
          viewBox="0 0 240 240"
          role="img"
          aria-label="Radar chart of selected skill and interest categories"
        >
          {[0.25, 0.5, 0.75, 1].map(scale => {
            const ring = axes.map((_, i) => {
              const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2
              return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`
            }).join(' ')
            return (
              <polygon
                key={scale}
                points={ring}
                fill="none"
                stroke="#e8e2f3"
              />
            )
          })}
          {axes.map((axis, i) => {
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2
            return (
              <text
                key={axis.label}
                x={center + Math.cos(angle) * 100}
                y={center + Math.sin(angle) * 100}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#746b87"
                fontSize="10"
              >
                {axis.label}
              </text>
            )
          })}
          <polygon
            points={points}
            fill="rgba(124, 92, 230, 0.2)"
            stroke="#7c5ce6"
            strokeWidth="2"
          />
        </svg>
        <p className="profile-chart-note">
          Categories reflect your current selections, not skill proficiency.
        </p>
      </article>

      {editing && (
        <button
          className="profile-save-button"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      )}

      {message && <p className="profile-message">{message}</p>}
    </section>
  )
}

export default Profile
