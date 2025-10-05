import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Video, Home, LogOut, User } from 'lucide-react';

function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform with title, description, difficulty, and test cases',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/20',
      textColor: 'text-success',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems, modify descriptions, test cases, or difficulty levels',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/20',
      textColor: 'text-warning',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove problems from the platform. This action cannot be undone',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/20',
      textColor: 'text-error',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Management',
      description: 'Upload, manage, and delete solution videos for different coding problems',
      icon: Video,
      color: 'btn-info',
      bgColor: 'bg-info/20',
      textColor: 'text-info',
      route: '/admin/video'
    }
  ];

  const handleNavigation = (route) => {
    navigate(route, { replace: true });
  };

  const handleHomeClick = () => {
    navigate('/', { replace: true });
  };

  const handleProfileClick = () => {
    navigate('/profile', { replace: true });
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-base-content/70 mb-6">You don't have permission to access the admin panel.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4 sticky top-0 z-50">
        <div className="flex-1">
          <button 
            onClick={handleHomeClick}
            className="btn btn-ghost text-xl"
          >
            Algonaut
          </button>
          <div className="badge badge-primary badge-lg ml-2">Admin</div>
        </div>

        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={user?.image || 'https://www.gravatar.com/avatar/?d=mp&s=200'} 
                  alt="admin avatar" 
                />
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <button onClick={handleProfileClick}>
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </li>
              <li>
                <button onClick={handleHomeClick}>
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </li>
              <li>
                <button onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Admin Panel
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Welcome back, <span className="font-semibold text-primary">{user?.firstName}</span>. 
            Manage your coding platform efficiently with the tools below.
          </p>
          
          {/* Admin Stats */}
          <div className="stats shadow-lg mt-8 bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="stat-title">Admin Role</div>
              <div className="stat-value text-primary">Administrator</div>
              <div className="stat-desc">Full system access</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <div className="stat-title">Management Tools</div>
              <div className="stat-value">4</div>
              <div className="stat-desc">Available modules</div>
            </div>
          </div>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-base-300"
                onClick={() => handleNavigation(option.route)}
              >
                <div className="card-body p-6">
                  {/* Icon and Title Row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${option.bgColor} p-3 rounded-2xl`}>
                      <IconComponent size={28} className={option.textColor} />
                    </div>
                    <h2 className="card-title text-xl flex-1">
                      {option.title}
                    </h2>
                  </div>
                  
                  {/* Description */}
                  <p className="text-base-content/70 mb-6 leading-relaxed">
                    {option.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="card-actions justify-end">
                    <button className={`btn ${option.color} btn-wide gap-2`}>
                      <IconComponent size={18} />
                      Access {option.title}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-16 text-center">
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleHomeClick}
                className="btn btn-outline gap-2"
              >
                <Home size={18} />
                Back to Home
              </button>
              <button 
                onClick={handleProfileClick}
                className="btn btn-outline gap-2"
              >
                <User size={18} />
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;