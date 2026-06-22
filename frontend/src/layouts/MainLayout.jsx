import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout({ children }) {
  return (
    <div style={styles.layoutWrapper}>
      {/* Sticky Header Navbar */}
      <Navbar />
      
      {/* Page Body Wrap */}
      <main style={styles.mainContent}>
        {children}
      </main>
      
      {/* Dynamic Global Footer */}
      <Footer />
    </div>
  );
}

const styles = {
  layoutWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#ffffff'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative'
  }
};

export default MainLayout;
