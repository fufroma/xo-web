import _ from 'intl'
import React, { Component, cloneElement } from 'react'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'
import map from 'lodash/map'

import propTypes from '../prop-types'
import { propsEqual } from '../utils'

import GenericInput from './generic-input'

import {
  descriptionRender,
  forceDisplayOptionalAttr
} from './helpers'

// ===================================================================

class ObjectItem extends Component {
  get value () {
    return this.refs.input.value
  }

  set value (value) {
    this.refs.input.value = value
  }

  render () {
    const { props } = this

    return (
      <div className='pb-1'>
        {cloneElement(props.children, {
          ref: 'input'
        })}
      </div>
    )
  }
}

// ===================================================================

@propTypes({
  depth: propTypes.number,
  disabled: propTypes.bool,
  label: propTypes.any.isRequired,
  required: propTypes.bool,
  schema: propTypes.object.isRequired,
  uiSchema: propTypes.object,
  defaultValue: propTypes.object
})
export default class ObjectInput extends Component {
  constructor (props) {
    super(props)
    this.state = {
      use: Boolean(props.required) || forceDisplayOptionalAttr(props),
      children: this._makeChildren(props)
    }
  }

  get value () {
    if (!this.state.use) {
      return
    }

    const obj = {}

    forEach(this.refs, (instance, key) => {
      obj[key] = instance.value
    })

    return obj
  }

  set value (value = {}) {
    forEach(this.refs, (instance, id) => {
      instance.value = value[id]
    })
  }

  _handleOptionalChange = event => {
    const { checked } = event.target

    this.setState({
      use: checked
    })
  }

  _makeChildren (props) {
    const {
      depth = 0,
      schema,
      uiSchema = {},
      defaultValue = {}
    } = props
    const obj = {}
    const { properties } = uiSchema

    forEach(schema.properties, (childSchema, key) => {
      obj[key] = (
        <ObjectItem key={key}>
          <GenericInput
            depth={depth + 2}
            disabled={props.disabled}
            label={childSchema.title || key}
            required={includes(schema.required, key)}
            schema={childSchema}
            uiSchema={properties && properties[key]}
            defaultValue={defaultValue[key]}
          />
        </ObjectItem>
      )
    })

    return obj
  }

  componentWillReceiveProps (props) {
    if (
      !propsEqual(
        this.props,
        props,
        [ 'depth', 'disabled', 'label', 'required', 'schema', 'uiSchema' ]
      )
    ) {
      this.setState({
        children: this._makeChildren(props)
      })
    }
  }

  render () {
    const { props, state } = this
    const { use } = state
    const depth = props.depth || 0

    return (
      <div style={{'paddingLeft': `${depth}em`}}>
        <legend>{props.label}</legend>
        {descriptionRender(props.schema.description)}
        <hr />
        {!props.required &&
          <div className='checkbox'>
            <label>
              <input
                checked={use}
                disabled={props.disabled}
                onChange={this._handleOptionalChange}
                type='checkbox'
              /> {_('fillOptionalInformations')}
            </label>
          </div>
        }
        {use &&
          <div className='card-block'>
            {map(state.children, (child, index) =>
              cloneElement(child, { ref: index })
            )}
          </div>
        }
      </div>
    )
  }
}
