import React from 'react';
import Footer from './Footer';

describe.skip('Test scenarios for <Footer/> component', () => {
    test.skip('should match with the existing snapshot', () => {
        const wrapper = DEPRECATED_renderer.create(<Footer />).toJSON();
        expect(wrapper).toMatchSnapshot();
    });
});
