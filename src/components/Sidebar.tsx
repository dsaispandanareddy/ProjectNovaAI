
type SidebarProps = {
  busy: boolean
  logout: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

function Sidebar({
  busy,
  logout,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: '⌂ Dashboard' },
    { id: 'generate', label: '✧ Generate Ideas' },
    { id: 'saved', label: '♡ Saved Projects' },
    { id: 'profile', label: '◎ My Profile' },
    { id: 'settings', label: '⚙ Settings' },
  ]

  return (
    <aside className="sidebar">
      <h2>✦ ProjectNova</h2>
      <p className="nav-label">WORKSPACE</p>

      {navItems.slice(0, 3).map(item => (
        <button
          key={item.id}
          className={activeTab === item.id ? 'active' : ''}
          onClick={() => setActiveTab(item.id)}
        >
          {item.label}
        </button>
      ))}

      <p className="nav-label">PERSONAL</p>

      {navItems.slice(3).map(item => (
        <button
          key={item.id}
          className={activeTab === item.id ? 'active' : ''}
          onClick={() => setActiveTab(item.id)}
        >
          {item.label}
        </button>
      ))}

      <div className="sidebar-bottom">
        <button
          className="setup-back"
          disabled={busy}
          onClick={logout}
        >
          {busy ? 'Please wait...' : '↪ Log out'}
        </button>
        <p>Turn ideas into reality ✨</p>
      </div>
    </aside>
  )
}

export default Sidebar
