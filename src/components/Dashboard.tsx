type DashboardProps = {
  name: string
  generatedCount: number
  savedCount: number
  exploredCount: number
  onGenerate: () => void
}

function Dashboard({
  name,
  generatedCount,
  savedCount,
  exploredCount,
  onGenerate,
}: DashboardProps) {
  return (
    <>
      <section className="welcome">
        <p className="eyebrow">YOUR PERSONAL PROJECT ASSISTANT</p>
        <h1>Build something <span>extraordinary.</span></h1>
        <p>
          Welcome, {name}! Discover projects tailored to your
          skills, interests, and goals.
        </p>
        <button className="primary-button" onClick={onGenerate}>
          ✦ Generate project ideas →
        </button>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>💡</span>
          <p>Ideas generated</p>
          <h2>{generatedCount}</h2>
        </article>

        <article className="stat-card">
          <span>♥</span>
          <p>Saved projects</p>
          <h2>{savedCount}</h2>
        </article>

        <article className="stat-card">
          <span>🚀</span>
          <p>Projects explored</p>
          <h2>{exploredCount}</h2>
        </article>
      </section>
    </>
  )
}

export default Dashboard