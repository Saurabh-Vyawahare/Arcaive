/**
 * Page URL mapping for Arcaive
 */
export function createPageUrl(pageName) {
  const routes = {
    'Landing': '/',
    'Auth': '/auth',
    'Dashboard': '/dashboard',
    'Documents': '/documents',
    'Query': '/query',
    'Upload': '/upload',
  };
  return routes[pageName] || '/dashboard';
}
