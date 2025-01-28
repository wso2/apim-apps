import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import ListRulesets from './ListRulesets';
import AddEditRuleset from './AddEditRuleset';

/**
 * Render ruleset routes
 * @returns {JSX} Ruleset routing component
 */
function RulesetCatalog() {
    return (
        <Switch>
            <Route exact path='/governance/ruleset-catalog' component={ListRulesets} />
            <Route exact path='/governance/ruleset-catalog/create' component={AddEditRuleset} />
            <Route exact path='/governance/ruleset-catalog/:id' component={AddEditRuleset} />
            <Route component={ResourceNotFound} />
        </Switch>
    );
}

export default withRouter(RulesetCatalog);
