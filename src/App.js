import {
  faBus,
  faCar,
  faComment,
  faExclamationTriangle,
  faIdCard,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000"); // Back-end URL

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 16.544893, // Default map center (Bhimavaram coordinates)
  lng: 81.521240,
};

function App() {
  const [activeForm, setActiveForm] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [feedback, setFeedback] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [busLocation, setBusLocation] = useState(center); // Default to center

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "0UpH3jRxaXAh2zD7k5zV", // Replace with your actual API key
  });

  useEffect(() => {
    socket.on("busLocationUpdate", (data) => {
      setBusLocation(data.location);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const showForm = (formId) => {
    setActiveForm(formId);
    setSearchResults([]);
    setTrackingInfo(null);
  };

  const searchBuses = async () => {
    try {
      const response = await axios.post("http://localhost:3000/searchBuses", {
        from,
        to,
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching buses:", error);
    }
  };

  const trackBus = async () => {
    try {
      const response = await axios.post("http://localhost:3000/trackBus", {
        serviceNumber,
      });
      setTrackingInfo(response.data);
      setBusLocation(response.data.location); // Update bus location on the map
    } catch (error) {
      console.error("Error tracking bus:", error);
    }
  };

  const searchByVehicle = async () => {
    try {
      const response = await axios.post("http://localhost:3000/searchByVehicle", {
        vehicleNumber,
      });
      setTrackingInfo(response.data);
      setBusLocation(response.data.location); // Update bus location on the map
    } catch (error) {
      console.error("Error searching by vehicle:", error);
    }
  };

  const searchByService = async () => {
    try {
      const response = await axios.post("http://localhost:3000/searchByService", {
        serviceNumber,
      });
      setTrackingInfo(response.data);
      setBusLocation(response.data.location); // Update bus location on the map
    } catch (error) {
      console.error("Error searching by service:", error);
    }
  };

  const submitFeedback = async () => {
    try {
      await axios.post("http://localhost:3000/submitFeedback", {
        feedback,
      });
      alert("Feedback submitted successfully!");
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };
  if (loadError) {
    console.error("Google Maps load error:", loadError);
    return <div>Error loading maps. Check the console for details.</div>;
  }

  if (!isLoaded) return <div>Loading Maps...</div>;


  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Online Bus Tracking System</h1>
        <p>Track your bus in real-time and plan your journey with ease!</p>
        <img
          src="apsrtc.jpeg"
          alt="Bus Tracking System Banner"
          className="banner-image"
        />
      </header>

      {/* Main Content */}
      <div className="container">
        <div className="options">
          <button className="option" onClick={() => showForm("searchNearby")}>
            <FontAwesomeIcon icon={faBus} className="button-icon" />
            <span>Search Buses between Locations</span>
          </button>
          <br></br>
          <button className="option" onClick={() => showForm("trackBus")}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className="button-icon" />
            <span>Bus Tracking</span>
          </button>
          <br></br>
          <button className="option" onClick={() => showForm("searchByVehicle")}>
            <FontAwesomeIcon icon={faCar} className="button-icon" />
            <span>Search Bus by Vehicle Number</span>
          </button>
          <br></br>
          <button className="option" onClick={() => showForm("searchByService")}>
            <FontAwesomeIcon icon={faIdCard} className="button-icon" />
            <span>Search Bus by Service Number</span>
          </button>
          <br></br>
          <button className="option" onClick={() => showForm("feedback")}>
            <FontAwesomeIcon icon={faComment} className="button-icon" />
            <span>Customer Feedback</span>
          </button>
          <br></br>
          <button
            className="option" onClick={() => showForm("emergency")}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="button-icon" />
            <span>Emergency</span>
          </button>
        </div>

        {/* Search Buses Near Me */}
        {activeForm === "searchNearby" && (
          <div className="form">
            <h2>Search Buses between 2 Locations</h2>
            <input
              type="text"
              placeholder="Enter From Location"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter To Location"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <button onClick={searchBuses}>Search</button>
            {searchResults.length > 0 && (
              <div className="results">
                <h3>Available Buses:</h3>
                <ul>
                  {searchResults.map((bus) => (
                    <li key={bus.id}>
                      {bus.serviceNumber} - {bus.from} to {bus.to}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Bus Tracking */}
        {activeForm === "trackBus" && (
          <div className="form">
            <h2>Bus Tracking</h2>
            <input
              type="text"
              placeholder="Enter Service Number"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
            />
            <button onClick={trackBus}>Track</button>
            {trackingInfo && (
              <div className="results">
                <h3>Bus Details:</h3>
                <p>Speed: {trackingInfo.speed}</p>
                <p>
                  Location: Latitude {trackingInfo.location.lat}, Longitude{" "}
                  {trackingInfo.location.lng}
                </p>
              </div>
            )}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={busLocation}
            >
              <Marker position={busLocation} />
            </GoogleMap>
          </div>
        )}

        {/* Search Bus by Vehicle Number */}
        {activeForm === "searchByVehicle" && (
          <div className="form">
            <h2>Search Bus by Vehicle Number</h2>
            <input
              type="text"
              placeholder="Enter Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
            <button onClick={searchByVehicle}>Search</button>
            {trackingInfo && (
              <div className="results">
                <h3>Bus Details:</h3>
                <p>
                  Location: Latitude {trackingInfo.location.lat}, Longitude{" "}
                  {trackingInfo.location.lng}
                </p>
              </div>
            )}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={busLocation}
            >
              <Marker position={busLocation} />
            </GoogleMap>
          </div>
        )}

        {/* Search Bus by Service Number */}
        {activeForm === "searchByService" && (
          <div className="form">
            <h2>Search Bus by Service Number</h2>
            <input
              type="text"
              placeholder="Enter Service Number"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
            />
            <button onClick={searchByService}>Search</button>
            {trackingInfo && (
              <div className="results">
                <h3>Bus Details:</h3>
                <p>
                  Location: Latitude {trackingInfo.location.lat}, Longitude{" "}
                  {trackingInfo.location.lng}
                </p>
              </div>
            )}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={busLocation}
            >
              <Marker position={busLocation} />
            </GoogleMap>
          </div>
        )}

        {/* Customer Feedback */}
        {activeForm === "feedback" && (
          <div className="form">
            <h2>Customer Feedback</h2>
            <textarea
              placeholder="Enter your feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button onClick={submitFeedback}>Submit</button>
          </div>
        )}

        {/* Emergency */}
        {activeForm === "emergency" && (
          <div className="form">
           <h2>Emergency</h2>
            <p>Please call 911 or contact the nearest authority.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Online Bus Tracking System. All rights reserved.</p>
        <p>Contact us: support@bustracking.com</p>
        <p>Created by PALAVALASA SRINU and Team EEE</p>
      </footer>
    </div>
  );
}

export default App;