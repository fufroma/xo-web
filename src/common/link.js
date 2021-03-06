import Link from 'react-router/lib/Link'
import React from 'react'
import { routerShape } from 'react-router/lib/PropTypes'

import Component from './base-component'
import propTypes from './prop-types'

// ===================================================================

export { Link as default }

// -------------------------------------------------------------------

const _IGNORED_TAGNAMES = {
  A: true,
  BUTTON: true,
  INPUT: true,
  SELECT: true
}

@propTypes({
  tagName: propTypes.string
})
export class BlockLink extends Component {
  static contextTypes = {
    router: routerShape
  }

  _style = { cursor: 'pointer' }
  _onClickCapture = event => {
    const { currentTarget } = event
    let element = event.target
    while (element !== currentTarget) {
      if (_IGNORED_TAGNAMES[element.tagName]) {
        return
      }
      element = element.parentNode
    }
    event.stopPropagation()
    if (event.ctrlKey || event.button === 1) {
      window.open(this.context.router.createHref(this.props.to))
    } else {
      this.context.router.push(this.props.to)
    }
  }

  render () {
    const { children, tagName = 'div' } = this.props
    const Component = tagName
    return (
      <Component
        style={this._style}
        onClickCapture={this._onClickCapture}
      >
        {children}
      </Component>
    )
  }
}
