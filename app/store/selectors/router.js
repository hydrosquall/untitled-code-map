
import { createSelector } from 'reselect';

// Connected react router
const router$ = state => state.router;

const pathname$ = createSelector(
  router$, (router) => router.location.pathname
)

export {
  pathname$
}
