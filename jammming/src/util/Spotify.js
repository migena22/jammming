const apiClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = 'http://localhost:3000/';
const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${apiClientId}&response_type=token&scope=playlist-modify-private&redirect_uri=${redirectUri}`;
let userAccessToken = '';
let expiresIn;

const Spotify = {
  getAccessToken() {
    let accessTokenRegex = /access_token=([^&]*)/;
    let expiresInRegex = /expires_in=([^&]*)/;
    let redirectedUrl = window.location.href;

    let checkUrl = () => {
      return redirectedUrl.match(accessTokenRegex) &&
        redirectedUrl.match(expiresInRegex)
    }

    if (userAccessToken) {
      return userAccessToken;
    } else if (checkUrl()) {
      userAccessToken = redirectedUrl.match(accessTokenRegex)[1];
      expiresIn = redirectedUrl.match(expiresInRegex)[1];

      window.setTimeout(() => {
        window.history.pushState('Access Token', null, '/');
        userAccessToken = '';
      }, expiresIn * 1000);
    } else {
      window.location = authorizeUrl;
    }
  },

  search(term) {
    let url = `https://api.spotify.com/v1/search?type=track&q=${term}`;

    if (!userAccessToken) {
      this.getAccessToken();
    }

    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`
      }
    })
    .then(response => response.ok ? response.json() : {})
    .then(jsonResponse => jsonResponse.tracks ?
      jsonResponse.tracks.items.map(track => {
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          previewUrl: track.preview_url,
          uri: track.uri
        }
      }) : []
    );
  },

  getUserId() {
    let url = 'https://api.spotify.com/v1/me';

    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`
      }
    })
    .then(response => response.ok ? response.json() : {})
    .then(jsonResponse => jsonResponse.id ? jsonResponse.id : '');
  },

  createPlaylistId(userId, name) {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const data = { name, public: false };

    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.ok ? response.json() : {})
    .then(jsonResponse => jsonResponse.id ? jsonResponse.id : '');
  },

  addTrackURIs(userId, playlistId, trackURIs) {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
    const data = { uris: trackURIs };

    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.ok? response.json() : {})
    .then(jsonResponse => jsonResponse.snapshot_id ?
      jsonResponse.snapshot_id : ''
    );
  },

  savePlaylist(name, trackURIs) {
    if (!userAccessToken) {
      this.getAccessToken();
    } else if (trackURIs.length <= 0) {
      return;
    }

    let userId = '';
    let playlistId = '';

    this.getUserId().then(id => {
      userId = id;
      return this.createPlaylistId(userId, name);
    }).then(id => {
      playlistId = id;
      return this.addTrackURIs(userId, playlistId, trackURIs);
    }).then(id => {
      playlistId = id;
    });
  }
};

export default Spotify;
