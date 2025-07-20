import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { User, LogOut, Settings, ShoppingCart, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
export const Header = () => {
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const {
    getCartCount
  } = useCart();
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Role-based dashboard routing
  const getDashboardRoute = () => {
    return profile?.role === 'admin' ? '/admin' : '/dashboard';
  };
  const getDashboardLabel = () => {
    return profile?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard';
  };
  return <header className="sticky top-0 z-50 w-full border-b glass-subtle">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://res.cloudinary.com/dknafpppp/image/upload/v1753029599/F8AB7FD9-8833-4CB2-B517-27BE0B1C6BA7_2_copy_bzt39k.png" alt="BoostMySites Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-foreground">BoostMySites</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" asChild className="hover:text-primary transition-all-smooth">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          {!user && <>
              <Button variant="ghost" asChild className="hover:text-primary transition-all-smooth">
                
              </Button>
              <Button variant="ghost" asChild className="hover:text-primary transition-all-smooth">
                
              </Button>
              <Button variant="ghost" asChild className="hover:text-primary transition-all-smooth">
                <Link to="/about">About</Link>
              </Button>
            </>}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? <>
              <Button variant="ghost" size="icon" asChild className="relative hover:scale-110 transition-all-smooth">
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {getCartCount() > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {getCartCount()}
                    </Badge>}
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-110 transition-all-smooth">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback className="gradient-primary text-white">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                      {profile?.role === 'admin' && <Badge variant="secondary" className="text-xs w-fit">Admin</Badge>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="hover:bg-primary/10 transition-all-smooth cursor-pointer">
                    <Link to={getDashboardRoute()}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{getDashboardLabel()}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary/10 transition-all-smooth cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-destructive/10 transition-all-smooth cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="hover:text-primary transition-all-smooth">
                <a href="/auth">Sign In</a>
              </Button>
              <Button asChild className="gradient-primary hover:scale-105 transition-all-smooth">
                <a href="/auth">Get Started</a>
              </Button>
            </div>}
        </div>
      </div>
    </header>;
};