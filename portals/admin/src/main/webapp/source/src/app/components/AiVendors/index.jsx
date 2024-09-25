import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListAiVendors from './ListAiVendors';
import AddEditAiVendor from './AddEditAiVendor';

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function AiVendors() {
    return (
        <Switch>
            <Route exact path='/settings/ai-vendors' component={ListAiVendors} />
            <Route exact path='/settings/ai-vendors/create' component={AddEditAiVendor} />
            <Route exact path='/settings/ai-vendors/:id' component={AddEditAiVendor} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(AiVendors);
