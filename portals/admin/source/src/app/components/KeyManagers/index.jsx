import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListKeyManagers from './ListKeyManagers';
import AddEditKeyManager from './AddEditKeyManager';
import AddEditTokenExchangeIDP from "AppComponents/KeyManagers/AddEditTokenExchangeIDP";

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function KeyManagers() {
    return (
        <Switch>
            <Route exact path='/settings/key-managers' component={ListKeyManagers} />
            <Route exact path='/settings/key-managers/external-key-manager/create' component={AddEditKeyManager} />
            <Route exact path='/settings/key-managers/token-exchange-endpoint/create'
                   component={AddEditTokenExchangeIDP} />
            <Route exact path='/settings/key-managers/external-key-manager/:id' component={AddEditKeyManager} />
            <Route exact path='/settings/key-managers/token-exchange-endpoint/:id'
                   component={AddEditTokenExchangeIDP} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(KeyManagers);
