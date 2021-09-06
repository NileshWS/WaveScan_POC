import React, { Component } from 'react';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from 'react-places-autocomplete';
import './ProjectDetails.scss';
const electron = window.require('electron');
const remote = electron.remote;
const { dialog } = remote;


export class ProjectDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {

      projectFolderPath: '',
      projectName: '',

      // for google map places autocomplete
      address: '',

      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},

      mapCenter: {
        lat: 1.3521,
        lng: 103.8198
      }
    };

    //this.handleInputChange = this.handleInputChange.bind(this);
    //this.handleFolderBrowse = this.handleFolderBrowse(this);
    //this.handleCreateProject = this.handleCreateProject.bind(this);
    //this.handleOpenProject = this.handleOpenProject.bind(this);

  };

  handleChange = address => {
    this.setState({ address });
  };

  //handleInputChange(event) {

  //  console.log(handleInputChange(event));

  //  const target = event.target;
  //  const value = target.type === 'checkbox' ? target.checked : target.value;
  //  const name = target.name;

  //  this.setState({
  //    [name]: value
  //  });
  //};

  handleSelect = address => {
    this.setState({ address });
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        console.log('Success', latLng);

        // update center state
        this.setState({ mapCenter: latLng });
      })
      .catch(error => console.error('Error', error));
  };

  handleFolderBrowse() {

    console.log('Folder Browse function');

    //const window = BrowserWindow.getFocusedWindow();
    //const options = {
    //  title: 'Pick a Folder to Create Project Folder',
    //  properties: ['openDirectory'],
    //};

/*    const { dialog } = require('electron');*/

    const path = dialog.showOpenDialog({ properties: ['openDirectory'] });
    console.log(path);

    this.state.projectFolderPath = path;
  };

  handleAddLocationToList() {
    console.log('Add Location');


  }

  handleCreateProject() {

    var fs = require('fs');
    var dir = this.state.projectFolderPath + this.state.projectName;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }, e => {
        if (e) {
          console.error(e);
          return;
      } else {
        console.log('Success');
      }
      });
    }

     const sqlite3 = require('sqlite3').verbose();

     //Creating the SQLite DB.
     const db = new sqlite3.Database(dir + '/WaveScan.db', (err) => {
       if (err) {
         console.error(err.message);
         return;
       }
       console.log('Connected to the WaveScan database.');
     });

     //Closing the SQLite DB.
     db.close((err) => {
       if (err) {
         console.error(err.message);
         return;
       }
       console.log('Close the database connection.');
     });

  };

  handleOpenProject() {

  };

  render() {
    return (
      <div class="container">

        <div class="left">

          <h2 class="animation a1">Hello, User!</h2>

          <h4 class="animation a2">I hope you enjoy using WaveScan!</h4>

          <div class="form">
            <label for="pfolder">Project Folder:
              <input type="text" id="pfolder" name="pfolder" class="form-field animation a4"
                value={this.state.projectFolderPath}
                width="500px" />
{/*                onChange={(evt) => this.handleInputChange(evt)}*/}
            </label>
            <button onClick={this.handleFolderBrowse}>Browse Folder</button>
            <label for="pname">Project name:
              <input type="text" id="pname" name="pname" class="form-field animation a4"
                value={this.state.projectName}
                width="500px" />
                {/*onChange={(evt) => this.handleInputChange(evt)}*/}
            </label>

            <button onClick={this.handleCreateProject}>Create Project</button>
            <button onClick={this.handleOpenProject}>Open Project</button>
          </div>

        </div>

        <div class="right">

          <PlacesAutocomplete class="form-field animation a4"
            value={this.state.address}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                <input
                  {...getInputProps({
                    placeholder: 'Search Places ...',
                    className: 'location-search-input',
                  })}
                />
                <div className="autocomplete-dropdown-container">
                  {loading && <div>Loading...</div>}
                  {suggestions.map(suggestion => {
                    const className = suggestion.active
                      ? 'suggestion-item--active'
                      : 'suggestion-item';
                    // inline style for demonstration purpose
                    const style = suggestion.active
                      ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                      : { backgroundColor: '#ffffff', cursor: 'pointer' };
                    return (
                      <div
                        {...getSuggestionItemProps(suggestion, {
                          className,
                          style,
                        })}
                      >
                        <span>{suggestion.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PlacesAutocomplete>

          <label for="pname">Project Location:
            <input type="text" id="pname" name="pname" class="form-field animation a4"
              readOnly="true"
              value={this.state.address}
              width="500px" />
          </label>

          <button onClick={this.handleAddLocationToList}>Add to Locations</button>

          <Map class="right"
            google={this.props.google}
            initialCenter={{
              lat: this.state.mapCenter.lat,
              lng: this.state.mapCenter.lng
            }}
            center={{
              lat: this.state.mapCenter.lat,
              lng: this.state.mapCenter.lng
            }}
          >
            <Marker
              position={{
                lat: this.state.mapCenter.lat,
                lng: this.state.mapCenter.lng
              }} />
          </Map>

        </div>
      </div>
    )
  }
}

export default GoogleApiWrapper({
	apiKey: ('AIzaSyDoUtFw6dbxAuT51nS88GtIuouwmb2WxVM')
})(ProjectDetails)
