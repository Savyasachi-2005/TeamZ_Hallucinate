import { TubelightNavbar } from '@/components/ui/tubelight-navbar';
import { Home, TrendingUp, BarChart3, LayoutDashboard } from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Trends', url: '/niche-trends', icon: TrendingUp },
    { name: 'Analysis', url: '/channel-analysis', icon: BarChart3 },
    { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  ];

  return <TubelightNavbar items={navItems} />;
};

export default Navigation;
