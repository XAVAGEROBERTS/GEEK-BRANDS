// src/components/Portfolio/PortfolioPage.jsx
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import styles from './PortfolioPage.module.css';

const PortfolioPage = () => {
  const { portfolio, loading } = useData();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Work' },
    { id: 'product', label: 'Product Branding' },
    { id: 'vehicle', label: 'Vehicle Branding' },
    { id: 'signage', label: 'Signages' },
    { id: 'largeformat', label: 'Large Format' },
    { id: 'marketing', label: 'Marketing Materials' },
    { id: 'school', label: 'School & Learning Materials' },
    { id: 'corporate', label: 'Corporate Branding' }
  ];

  const filteredProjects =
    activeCategory === 'all'
      ? portfolio
      : portfolio.filter((p) => p.category === activeCategory);

  return (
    <section className="container">
      <div className={styles.portfolioPage}>
        <div className="section-title">
          <span className="badge">Our Work</span>
          <h2>Enough talking. See what we've been cooking.</h2>
          <p>A showcase of our recent branding and printing projects</p>
        </div>

        <div className={styles.categoryFilter}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && <p className={styles.empty}>Loading projects...</p>}

        {!loading && filteredProjects.length === 0 && (
          <div className={styles.empty}>
            <p>No projects in this category yet.</p>
            <p className={styles.emptyHint}>
              {portfolio.length === 0
                ? 'Check back soon — new work coming!'
                : 'Try a different category.'}
            </p>
          </div>
        )}

        {!loading && filteredProjects.length > 0 && (
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.projectImage}>
                  <img src={project.image} alt={project.name} />
                </div>
                <div className={styles.projectInfo}>
                  {/* ✅ Service badge moved below image */}
                  {project.service && (
                    <span className={styles.serviceBadge}>{project.service}</span>
                  )}
                  <span className={styles.projectCategory}>{project.client}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.portfolioCta}>
          <h3>Ready to add your project to our portfolio?</h3>
          <a href="/order" className="btn-primary">Start Your Project</a>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPage;