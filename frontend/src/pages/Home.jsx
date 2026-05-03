import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-badge">💖 Commitment Made Meaningful</div>
        <h1>Strengthen Your <br/><span>Relationship Bond</span></h1>
        <p>
          TrueTie is the ultimate platform for couples who value loyalty. 
          Track your journey, earn rewards, and grow your trust together.
        </p>
        <div className="hero-btns">
          <Link to="/signup" className="btn btn-primary">Start Your Journey</Link>
          <Link to="/about" className="btn btn-outline">How it Works</Link>
        </div>
      </header>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Dynamic Loyalty Score</h3>
          <p>Watch your commitment grow with a real-time score based on consistency and engagement.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Daily Check-ins</h3>
          <p>Simple daily habits that build long-term trust and keep your connection strong.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Milestone Rewards</h3>
          <p>Unlock exclusive digital badges and rewards as you reach new levels of loyalty.</p>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to level up your love?</h2>
        <p>Join thousands of couples building a growth-driven relationship.</p>
        <Link to="/signup" className="btn btn-primary">Join TrueTie Today</Link>
      </section>
    </div>
  );
};

export default Home;
