import React, { useState, useEffect, createContext, useContext } from 'react';

const RouterContext = createContext();

export const useRouter = () => {
    const context = useContext(RouterContext);
    if (!context) {
        return {
            currentRoute: 'connection-choice',
            navigate: (route) => {
                window.location.hash = route;
            },
            getCurrentRoute: () => 'connection-choice',
        };
    }
    return context;
};

export const RouterProvider = ({ children, defaultRoute = 'setup' }) => {
    const [currentRoute, setCurrentRoute] = useState(defaultRoute);

    const getBaseRoute = (hash) => {
        if (!hash) return '';
        const cleanHash = hash.replace('#', '');
        const baseRoute = cleanHash.split('?')[0].split('#')[0];
        return baseRoute;
    };

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '';
            const baseRoute = getBaseRoute(hash);
            if (baseRoute && baseRoute !== currentRoute) {
                setCurrentRoute(baseRoute);
            }
        };

        const connectionTypePreference = window.sureFeedbackAdmin?.connectionTypePreference || '';
        const initialHash = window.location.hash || '';
        const initialBaseRoute = getBaseRoute(initialHash);

        if (!connectionTypePreference || connectionTypePreference === '') {
            if (initialBaseRoute !== 'connection-choice') {
                setCurrentRoute('connection-choice');
                window.location.hash = 'connection-choice';
            } else {
                setCurrentRoute(initialBaseRoute);
            }
        } else if (initialBaseRoute) {
            setCurrentRoute(initialBaseRoute);
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentRoute]);

    const navigate = (route) => {
        setCurrentRoute(route);
        window.location.hash = route;
    };

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

export const Route = ({ path, children, exact = false }) => {
    const { currentRoute } = useRouter();

    const isMatch = exact
        ? currentRoute === path
        : currentRoute.startsWith(path);

    if (!isMatch) {
        return null;
    }

    if (!children) {
        return null;
    }

    if (typeof children === 'undefined') {
        return null;
    }

    if (Array.isArray(children)) {
        const validChildren = children.filter(child => child != null);
        if (validChildren.length === 0) {
            return null;
        }
        return <>{validChildren}</>;
    }

    return <>{children}</>;
};

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