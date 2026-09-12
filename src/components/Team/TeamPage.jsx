// src/components/Team/TeamPage.jsx
import React from 'react';
import { useData } from '../../context/DataContext';
import styles from './TeamPage.module.css';

const TeamPage = () => {
  const { team, loading } = useData();

  return (
    <section className="container">
      <div className={styles.teamPage}>
        <div className="section-title">
          <span className="badge">Our Team</span>
          <h2>Meet the Experts</h2>
          <p>Passionate professionals dedicated to your success</p>
        </div>

        {loading && <p className={styles.empty}>Loading team...</p>}

        {!loading && team.length === 0 && (
          <div className={styles.empty}>
            <p>No team members yet.</p>
            <p className={styles.emptyHint}>Check back soon to meet the team!</p>
          </div>
        )}

        {!loading && team.length > 0 && (
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.id} className={styles.teamCard}>
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className={styles.teamImage}
                  />
                ) : (
                  <div className={styles.teamImageFallback}>
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <h3>{member.name}</h3>
                <span className={styles.position}>{member.position}</span>
                {member.bio && <p>{member.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamPage;