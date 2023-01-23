/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
import React from 'react'
import ReactHtmlParser from 'react-html-parser';
import Configuration from 'Config';

/**
 * Render html content.
 * @param {int} props Props passing down from parent components.
 * @returns {JSX} React render output.
 */
export default function HTMLRender(props) {
    const {html} = props;
    // Extract html parser props from settings.json
    const { decodeEntities, tagsNotAllowed } = (Configuration.app && 
        Configuration.app.reactHTMLParser) ? Configuration.app.reactHTMLParser : {
            decodeEntities: true,
            tagsNotAllowed: [],
        };
    /**
     * Adds two numbers together.
     * https://www.npmjs.com/package/react-html-parser
     * @param {node} node node passed from react-html-parser
     * @param {int} index node index.
     * @returns {HTMLElement} HTML element to render.
     */
    function transform(node, index) {
        if (node.type === 'tag' && tagsNotAllowed.includes(node.name)) {
            return null;
        }
    }
    return (
        <>{ReactHtmlParser(html, { transform, decodeEntities })}</>
    )
}
