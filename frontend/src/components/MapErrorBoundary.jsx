import { Component } from 'react'

export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          📍 Map unavailable
        </div>
      )
    }
    return this.props.children
  }
}
