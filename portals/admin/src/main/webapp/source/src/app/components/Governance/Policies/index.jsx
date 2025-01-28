import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListPolicies from './ListPolicies';
import AddEditPolicy from './AddEditPolicy';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function Policies() {
    return (
        <Switch>
            <Route exact path='/governance/policies' component={ListPolicies} />
            <Route exact path='/governance/policies/create' component={AddEditPolicy} />
            <Route exact path='/governance/policies/:id' component={AddEditPolicy} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(Policies);
