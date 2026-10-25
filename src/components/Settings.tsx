
import './Settings.css'

type SettingsProps = {
  name: string
  email: string
  onLogout: () => void
}

function Settings({ name, email, onLogout }: SettingsProps) {
  return (
    <section className="section settings-section">
      <h2>Settings</h2>
      <p>Manage your account and preferences.</p>

      <div className="settings-card">
        <h3>Account Information</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      <div className="settings-card">
        <h3>Security</h3>
        <p>Your account is protected by Supabase authentication.</p>
        <button className="secondary-button" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </section>
  )
}

export default Settings
