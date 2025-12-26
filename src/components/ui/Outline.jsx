import { useEffect, useState } from 'react';

const Outline = ({ modules, activeModuleId, onModuleClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Show outline only if there are modules
  useEffect(() => {
    setIsVisible(modules.length > 0);
  }, [modules]);

  if (!isVisible || modules.length === 0) {
    return null;
  }

  return (
    <aside className="outline-sidebar">
      <div className="outline-header">
        <h3 className="outline-title">Outline</h3>
      </div>
      <nav className="outline-nav">
        <ul className="outline-list">
          {modules.map(module => (
            <li
              key={module.id}
              className={`outline-item ${activeModuleId === module.id ? 'active' : ''}`}
            >
              <button
                className="outline-button"
                onClick={() => onModuleClick(module.id)}
              >
                {module.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Outline;
