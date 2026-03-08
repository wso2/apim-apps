import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListGWEnvironments from './ListGWEnviornments';
import AddEditGWEnvironment from './AddEditGWEnvironment';
import PlatformGatewayManagement from './PlatformGatewayManagement';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function GatewayEnvironments() {
    return (
        <Switch>
            <Route exact path='/settings/environments' component={ListGWEnvironments} />
            <Route exact path='/settings/environments/create' component={AddEditGWEnvironment} />
            <Route exact path='/settings/environments/platform-gateways' component={PlatformGatewayManagement} />
            <Route
                exact
                path='/settings/environments/platform-gateways/:gatewayId'
                component={PlatformGatewayManagement}
            />
            <Route exact path='/settings/environments/:id' component={AddEditGWEnvironment} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(GatewayEnvironments);
