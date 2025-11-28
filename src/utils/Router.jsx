import React, { useState, useEffect, createContext, useContext } from 'react';

// Create Router Context
const RouterContext = createContext();

// Custom hook to use router
export const useRouter = () => {
    const context = useContext(RouterContext);
    if (!context) {
        throw new Error('useRouter must be used within a RouterProvider');
    }
    return context;
};

// Router Provider Component
export const RouterProvider = ({ children, defaultRoute = 'setup' }) => {
    const [currentRoute, setCurrentRoute] = useState(defaultRoute);
    
    // Listen for hash changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== currentRoute) {
                setCurrentRoute(hash);
            }
        };
        
        // Set initial route from URL hash
        const initialHash = window.location.hash.replace('#', '');
        if (initialHash) {
            setCurrentRoute(initialHash);
        }
        
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentRoute]);
    
    // Navigate function
    const navigate = (route) => {
        setCurrentRoute(route);
        window.location.hash = route;
    };
    
    // Get current route
    const getCurrentRoute = () => currentRoute;
    
    const routerValue = {
        currentRoute,
        navigate,
        getCurrentRoute,
    };
    
    return (
        <RouterContext.Provider value={routerValue}>
            {children}
        </RouterContext.Provider>
    );
};

// Route Component
export const Route = ({ path, children, exact = false }) => {
    const { currentRoute } = useRouter();
    
    const isMatch = exact 
        ? currentRoute === path 
        : currentRoute.startsWith(path);
    
    return isMatch ? children : null;
};

// Navigation Link Component
export const NavLink = ({ to, children, className = '', activeClassName = 'active', ...props }) => {
    const { currentRoute, navigate } = useRouter();
    
    const handleClick = (e) => {
        e.preventDefault();
        navigate(to);
    };
    
    const isActive = currentRoute === to || currentRoute.startsWith(to);
    const linkClassName = `${className} ${isActive ? activeClassName : ''}`.trim();
    
    return (
        <a 
            href={`#${to}`} 
            onClick={handleClick}
            className={linkClassName}
            {...props}
        >
            {children}
        </a>
    );
};

// Simple Router Component (alternative to RouterProvider)
export const SimpleRouter = ({ routes, defaultRoute = 'setup', children }) => {
    const [currentRoute, setCurrentRoute] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || defaultRoute;
    });
    
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            setCurrentRoute(hash || defaultRoute);
        };
        
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [defaultRoute]);
    
    // Find matching route
    const matchedRoute = routes.find(route => {
        if (route.exact) {
            return currentRoute === route.path;
        }
        return currentRoute.startsWith(route.path);
    });
    
    const routerValue = {
        currentRoute,
        navigate: (route) => {
            setCurrentRoute(route);
            window.location.hash = route;
        },
        getCurrentRoute: () => currentRoute,
    };
    
    return (
        <RouterContext.Provider value={routerValue}>
            <div className="surefeedback-router w-full min-h-screen overflow-x-hidden" style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>
                {matchedRoute ? matchedRoute.component : (
                    <div className="route-not-found">
                        <p>Route not found: {currentRoute}</p>
                    </div>
                )}
                {children}
            </div>
        </RouterContext.Provider>
    );
};

export default RouterProvider;