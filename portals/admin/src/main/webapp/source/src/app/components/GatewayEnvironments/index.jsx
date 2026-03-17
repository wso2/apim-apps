import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListGWEnvironments from './ListGWEnviornments';
import AddEditGWEnvironment from './AddEditGWEnvironment';
import UniversalGatewayManagement from './UniversalGatewayManagement';

/**
 * Renders the gateway environment routes.
 * @returns {JSX.Element} Gateway environment route definitions.
 */
const GatewayEnvironments = () => {
    return (
        <Switch>
            <Route exact path='/settings/environments' component={ListGWEnvironments} />
            <Route exact path='/settings/environments/create' component={AddEditGWEnvironment} />
            <Route
                exact
                path='/settings/environments/universal-gateways/:gatewayId'
                component={UniversalGatewayManagement}
            />
            <Route exact path='/settings/environments/:id' component={AddEditGWEnvironment} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
};

export default GatewayEnvironments;
