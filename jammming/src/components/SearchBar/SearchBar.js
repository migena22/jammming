import React, { Component } from 'react';
import './SearchBar.css';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.search = this.search.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.state = {
      term: ''
    }
  }

  search() {
    this.props.onSearch(this.state.term);
  }

  handleTermChange(event) {
    this.setState({
      term: event.target.value
    });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  render() {
    return (
      <div className="SearchBar">
        <input
          placeholder="Enter A Song Title"
          onChange={this.handleTermChange}
          onKeyPress={this.handleKeyPress}
        />
        <a onClick={this.search} >SEARCH</a>
      </div>
    );
  }
}

export default SearchBar;
