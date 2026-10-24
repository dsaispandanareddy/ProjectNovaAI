
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
    { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
    { id: 'generate', icon: '✧', label: 'Generate Ideas' },
    { id: 'saved', icon: '♡', label: 'Saved Projects' },
    { id: 'profile', icon: '◎', label: 'My Profile' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ]

  const renderItem = (item: (typeof navItems)[number]) => (
    <button
      key={item.id}
      type="button"
      className={`sidebar-nav-button ${
        activeTab === item.id ? 'active' : ''
      }`}
      onClick={() => setActiveTab(item.id)}
    >
      <span className="sidebar-nav-icon">{item.icon}</span>
      <span>{item.label}</span>
      {activeTab === item.id && (
        <span className="sidebar-active-indicator" />
      )}
    </button>
  )

  return (
    <aside className="sidebar">
      <h2>✦ ProjectNova</h2>

      <p className="nav-label">WORKSPACE</p>
      {navItems.slice(0, 3).map(renderItem)}

      <p className="nav-label">PERSONAL</p>
      {navItems.slice(3).map(renderItem)}

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout-button"
          disabled={busy}
          onClick={logout}
        >
          <span className="sidebar-nav-icon">↪</span>
          {busy ? 'Please wait...' : 'Log out'}
        </button>
        <p>Turn ideas into reality ✨</p>
      </div>
    </aside>
  )
}

export default Sidebar
