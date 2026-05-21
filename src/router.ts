type PathPattern = string | RegExp | ((pathname: string) => boolean | Promise<boolean>);

type RouteHandler = () => void;

interface Route {
  pattern: PathPattern;
  handler: RouteHandler;
}

function route(pattern: PathPattern, handler: RouteHandler): Route {
  return { pattern, handler };
}

async function match(pattern: PathPattern, pathname: string): Promise<boolean> {
  if (typeof pattern === 'string') {
    return pattern === pathname;
  } else if (pattern instanceof RegExp) {
    return pattern.test(pathname);
  } else if (typeof pattern === 'function') {
    return pattern(pathname);
  }
  return false;
}

async function register(route: Route): Promise<void> {
  const pathname = window.location.pathname;
  const isMatch = await match(route.pattern, pathname);
  if (isMatch) {
    route.handler();
  }
}

export { route, register };
export type { Route, PathPattern, RouteHandler };