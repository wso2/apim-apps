import React from 'react'
import ReactHtmlParser from 'react-html-parser';
import Settings from 'Settings';

export default function HTMLRender({ html }) {
    // Extract html parser props from settings.json
    const { decodeEntities, tagsNotAllowed } = (Settings.app && Settings.app.reactHTMLParser) ? Settings.app.reactHTMLParser : {
        decodeEntities: true,
        tagsNotAllowed: [],
    };
    function transform(node, index) {
        if (node.type === 'tag' && tagsNotAllowed.includes(node.name)) {
            return null;
        }
    }
    return (
        <>{ReactHtmlParser(html, { transform, decodeEntities })}</>
    )
}
