import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

const Auth = React.lazy(() => import('./user/pages/Auth'));
const ActivityTracker = React.lazy(() => import('./activities/pages/ActivityTracker'));
const Profile = React.lazy(() => import('./user/pages/ProfileV'));
const UpdateMoveGoal = React.lazy(() => import('./movegoals/pages/UpdateMoveGoal'));
const WorkoutReports = React.lazy(() => import('./reports/pages/WorkoutReports'));
const GoalProgressReport = React.lazy(() => import('./reports/pages/GoalProgressReport'));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        {/* <Route path="/" exact>
          <Users />
        </Route> */}
        <Route path="/activityTracker">
          <ActivityTracker />
        </Route>
        <Route path="/reports/workouts">
          <WorkoutReports />
        </Route>
        <Route path="/reports/goalProgress">
          <GoalProgressReport />
        </Route>
        <Route path="/movegoal">
          <UpdateMoveGoal />
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
        <Redirect to="/activityTracker" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        {/* <Route path="/" exact>
          <Auth />
        </Route> */}
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main><Suspense fallback={
          <div className='center'><LoadingSpinner /></div>
        }>{routes}</Suspense></main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
