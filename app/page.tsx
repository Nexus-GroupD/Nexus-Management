import Navbar from '@/components/Navbar';
import { getGreeting } from '@/lib/time';

export default function Home() {
  return (
    <>
      <Navbar pageTitle="Home" />
      <div style={{ padding: '6rem 2rem 2rem 2rem', textAlign: 'center' }}>
        <h1>Nexus Management</h1>
        <p>Welcome to the Nexus scheduling system</p>
        
        <p>{getGreeting()}! Welcome to the Nexus scheduling system</p>
      </div>
    </>
  );
}
