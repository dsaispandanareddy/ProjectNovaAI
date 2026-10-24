
type GenerateIdeasProps = {
  message: string
  generateIdeas: (level: string) => Promise<void>
  projects: any[]
  savedProjects: any[]
  busy: boolean
  setSelectedProject: (project: any) => void
  trackExploredProject: (project: any) => void
  saveProject: (project: any) => void
}

function GenerateIdeas({
  message,
  generateIdeas,
  projects,
  savedProjects,
  busy,
  setSelectedProject,
  trackExploredProject,
  saveProject,
}: GenerateIdeasProps) {
  return (
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
              disabled={busy}
              onClick={() => void generateIdeas(level)}
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
              <p>
                <strong>Technologies:</strong>{' '}
                {Array.isArray(project.technologies)
                  ? project.technologies.join(', ')
                  : project.technologies}
              </p>
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
  )
}

export default GenerateIdeas
