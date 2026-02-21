import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar pageTitle="Home" />
      <div style={{ padding: '6rem 2rem 2rem 2rem', textAlign: 'center' }}>
        <h1>Nexus Management</h1>
        <p>Welcome to the employee scheduling system</p>
      </div>
    </>
  );
}
