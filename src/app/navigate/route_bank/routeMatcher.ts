import type { RouteId } from './types';

export function get360RouteId(startNode: string, endNode: string): RouteId | null {
  const key = `${startNode}->${endNode}`;

  const routeMap: Record<string, RouteId> = {
    // a routes
    'a->g': 'lobby-gblock',
    'a->r': 'lobby-mph',
    'a->c': 'lobby-dining',
    'a->d2': 'lobby-SV',
    'a->d': 'lobby-shub',
    'a->b4': 'lobby-borneo',

    // g routes
    'g->r': 'gblock-mph',
    'g->c': 'gblock-dining',
    'g->d2': 'gblock-SV',
    'g->d': 'gblock-shub',
    'g->b4': 'gblock-borneo',

    // mph routes
    'r->g': 'mph-gblock',
    'r->c': 'mph-dining',
    'r->d2': 'mph-SV',
    'r->d': 'mph-shub',
    'r->b4': 'mph-borneo',

    // dining hall routes
    'c->g': 'dining-gblock',
    'c->r': 'dining-mph',
    'c->d2': 'dining-SV',
    'c->d': 'dining-shub',
    'c->b4': 'dining-borneo',

    // sv routes
    'd2->g': 'SV-gblock',
    'd2->r': 'SV-mph',
    'd2->c': 'SV-dining',
    'd2->d': 'SV-shub',
    'd2->b4': 'SV-borneo',

    // shub routes
    'd->g': 'shub-gblock',
    'd->r': 'shub-mph',
    'd->c': 'shub-dining',
    'd->d2': 'shub-SV',
    'd->b4': 'shub-borneo',

    // borneo atrium routes
    'b4->g': 'borneo-gblock',
    'b4->r': 'borneo-mph',
    'b4->c': 'borneo-dining',
    'b4->d2': 'borneo-SV',
    'b4->d': 'borneo-shub',
  };

  return routeMap[key] ?? null;
}