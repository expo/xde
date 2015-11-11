# react-prop-types

[![Travis Build Status][build-badge]][build]

This is a library of some custom validators for React components properties.
Initially they were part of the [React-Bootstrap](https://github.com/react-bootstrap/react-bootstrap/) project.

### Usage

All validators can be imported as
```js
import elementType from 'react-prop-types/elementType';
// or
import { elementType } from 'react-prop-types';
...
propTypes: {
  someProp: elementType
```
or
```js
import CustomPropTypes from 'react-prop-types';
// and then used as usual
propTypes: {
  someProp: CustomPropTypes.elementType
```

If you use `webpack` and only want to bundle the validators you need, prefer the following approach:
```js
import elementType from 'react-prop-types/elementType'
```

---
#### all(...arrayOfValidators)

This validator allows to have complex validation like this:
```js
propTypes: {
  vertical:  React.PropTypes.bool,
  /**
   * Display block buttons, only useful when used with the "vertical" prop.
   * @type {bool}
   */
  block: CustomPropTypes.all(
    React.PropTypes.bool,
    function(props, propName, componentName) {
      if (props.block && !props.vertical) {
        return new Error('The block property requires the vertical property to be set to have any effect');
      }
    }
  )
```

All validators will be validated one by one, stopping on the first failure.

The `all()` validator will only succeed when all validators provided also succeed.

---
#### elementType

Checks whether a property provides a type of element.
The type of element can be provided in two forms:
- tag name (string)
- a return value of `React.createClass(...)`

Example
```js
propTypes: {
  componentClass: CustomPropTypes.elementType
```
Then, `componentClass` can be set by doing:
```js
<Component componentClass='span' />
```
or
```js
const Button = React.createClass(...);
...
<Component componentClass={Button} />
```

---
#### isRequiredForA11y(requiredType)

This is kind of `React.PropTypes.<type>.isRequired` with the custom error message:
`The prop <propName> is required for users using assistive technologies`

Example
```js
propTypes: {
  /**
   * An html id attribute, necessary for accessibility
   * @type {string}
   * @required
   */
  id: CustomPropTypes.isRequiredForA11y(React.PropTypes.string)
```

---
#### keyOf(object)

Checks whether provided string value is one of provided object's keys.

Example
```js
const SIZES = {
  'large': 'lg',
  'small': 'sm'
}

propTypes: {
  size: CustomPropTypes.keyOf(SIZES)
}

// this validates OK
<Component size="large" />

// this throws the error `expected one of ["large", "small"]`
<Component size="middle" />
```

A more extended example
```js
const styleMaps = {
  CLASSES: {
    'alert': 'alert',
    'button': 'btn'
  ...
  SIZES: {
    'large': 'lg',
    'medium': 'md',
    'small': 'sm',
    'xsmall': 'xs'
  }
...
propTypes: {
  /**
   * bootstrap className
   * @private
   */
  bsClass: CustomPropTypes.keyOf(styleMaps.CLASSES),
  /**
   * Style variants
   * @type {("default"|"primary"|"success"|"info"|"warning"|"danger"|"link")}
   */
  bsStyle: CustomPropTypes.keyOf(styleMaps.STYLES),
  /**
   * Size variants
   * @type {("xsmall"|"small"|"medium"|"large")}
   */
  bsSize: CustomPropTypes.keyOf(styleMaps.SIZES)
}
```

---
#### mountable

Checks whether a prop provides a DOM element
The element can be provided in two forms:
- Directly passed
- Or passed an object that has a `render` method

Example
```js
propTypes: {
  modal: React.PropTypes.node.isRequired,
  /**
   * The DOM Node that the Component will render it's children into
   */
  container: CustomPropTypes.mountable
```

A variant of usage `<Overlay container={this}>`
```js
const Example = React.createClass({
  getInitialState(){ return { show: true } },
  toggle(){ this.setState({ show: !this.state.show }) },

  render(){
    const tooltip = <Tooltip>Tooltip overload!</Tooltip>;

    return (
      <div>
        <Button ref='target' onClick={this.toggle}>
          Click me!
        </Button>

        <Overlay container={this}>
          { tooltip }
        </Overlay>
      </div>
    );
  }
});

React.render(<Example/>, mountNode);
```

---
#### singlePropFrom(...propertyNames)

Used when it needs to assure that only one of properties can be used.

Imagine we need the `value` for our `ButtonInput` component could be set
by only one of two ways:
- through `children`
- through `value` preperty
But not both.

Like this:
```js
<ButtonInput> ButtonValue </ButtonInput>
```
or
```js
<ButtonInput value="ButtonValue" />
```

But this should throw the `only one of the following may be provided` error
```js
<ButtonInput value="ButtonValue"> SomeChildren </ButtonInput>
```

The possible solution
```js
import { singlePropFrom } from 'react-prop-types/singlePropFrom';

const typeList = [React.PropTypes.number, React.PropTypes.string];

function childrenValueValidation(props, propName, componentName) {
  let error = singlePropFrom('children', 'value')(props, propName, componentName);
  if (!error) {
    const oneOfType = React.PropTypes.oneOfType(typeList);
    error = oneOfType(props, propName, componentName);
  }
  return error;
}

...

ButtonInput.propTypes = {
  children: childrenValueValidation,
  value: childrenValueValidation
```

---
#### deprecated(propType, explanation)

Helps with properties deprecations

Example
```js
propTypes: {
  collapsable: deprecated(React.PropTypes.bool, 'Use "collapsible" instead.')
```

In development mode it will write to the development console of a browser:
```
"collapsable" property of "ComponentName" has been deprecated.
Use "collapsible" instead.
```

_Notice: this custom validator uses 'warning' package under the hood.
And this package uses `console.error` channel instead of `console.warn`._

[build-badge]: https://travis-ci.org/react-bootstrap/react-prop-types.svg?branch=master
[build]: https://travis-ci.org/react-bootstrap/react-prop-types
