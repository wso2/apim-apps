import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListAiServiceProviders from './ListAiServiceProviders';
import AddEditAiServiceProvider from './AddEditAiServiceProvider';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function AiServiceProviders() {
    return (
        <Switch>
            <Route exact path='/settings/ai-service-providers' component={ListAiServiceProviders} />
            <Route exact path='/settings/ai-service-providers/create' component={AddEditAiServiceProvider} />
            <Route exact path='/settings/ai-service-providers/:id' component={AddEditAiServiceProvider} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(AiServiceProviders);
