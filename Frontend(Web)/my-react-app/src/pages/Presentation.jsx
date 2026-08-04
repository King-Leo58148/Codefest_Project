import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import HowItWorks from '../components/HowItWorks';
import ForInvestors from '../components/ForInvestors';
import ForBusinesses from '../components/ForBusinesses';
import AdminLayer from '../components/AdminLayer';
import Footer from '../components/Footer';

export default function Presentation() {
  return (
    <div className="min-h-screen bg-navy text-white font-sans antialiased selection:bg-accent selection:text-navy">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <ForInvestors />
        <ForBusinesses />
        <AdminLayer />
      </main>
      <Footer />
    </div>
  );
}
