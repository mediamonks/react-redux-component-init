import stringify from 'json-stable-stringify';

export default (componentId, propsArray) => `${componentId}${stringify(propsArray)}`;
