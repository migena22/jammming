import React, { Component } from 'react';
import './App.css';

import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';

import Spotify from '../../util/Spotify';

class App extends Component {
  constructor(props) {
    super(props);

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);

    this.state = {
      searchResults: [],
      playlist: [],
      playlistName: 'New Playlist'
    };
  }

  addTrack(track) {
    let ids = this.state.playlist.map(track => track.id);
    let searchResults = this.state.searchResults.filter(el => el !== track);

    if (!ids.includes(track.id)) {
      this.setState({
        playlist: [...this.state.playlist, track],
        searchResults: searchResults
      });
    }
  }

  removeTrack(track) {
    let tracks = this.state.playlist;
    tracks = tracks.filter(el => el.id !== track.id);

    this.setState({
      playlist: tracks
    });
  }

  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    });
  }

  savePlaylist() {
    let trackURIs = this.state.playlist.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs);

    this.setState({
      searchResults: [],
      playlist: [],
      playlistName: 'New Playlist'
    });
  }

  search(term) {
    Spotify.search(term).then(searchResults => {
      this.setState({ searchResults });
    })
  }

  render() {
    return (
      <div className="App">
        <SearchBar onSearch={this.search} />
        <div className="App-playlist">
          <SearchResults
            trackList={this.state.searchResults}
            onAdd={this.addTrack}
          />
          <Playlist
            trackList={this.state.playlist}
            playlistName={this.state.playlistName}
            onRemove={this.removeTrack}
            onNameChange={this.updatePlaylistName}
            onSave={this.savePlaylist}
          />
        </div>
      </div>
    );
  }
}

export default App;
