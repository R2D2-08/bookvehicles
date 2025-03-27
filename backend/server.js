require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize, syncDatabase, User } = require("./models");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const http = require("http");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const path = require("path");
const Ride = require("./models/Rides");
const Location = require("./models/Locations");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const adminRoutes = require("./routes/user");
const Driver = require("./models/Drivers");
const Vehicle = require("./models/Vehicles");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

const activeDrivers = {};
const driverLocations = {};
const booking_requests = {};
const activeRiders = {};

// Helper function to find a rider's socket by their user ID
function findRiderSocket(userId) {
  // First check in our active riders map
  if (activeRiders[userId]) {
    return activeRiders[userId];
  }
  
  // If not found in our map, search through all sockets
  for (const [id, socket] of Object.entries(io.sockets.sockets)) {
    if (socket.userId === userId) {
      // Update our map for future lookups
      activeRiders[userId] = socket;
      return socket;
    }
  }
  
  // Not found
  return null;
}
const driverDeails = {};

io.on("connection", (socket) => {
  // Parse cookies to extract the access token
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const accessToken = cookies.accessToken;
  console.log("Access Token:", accessToken);
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);
      socket.userId = decoded.id;
      console.log(`User connected with ID: ${socket.userId}`);
    } catch (err) {
      console.log("Invalid or expired access token");
    }
  }

  // Register rider explicitly (new handler)
  socket.on("register_rider", ({ userId }) => {
    if (userId) {
      socket.userId = userId;
      activeRiders[userId] = socket;
      console.log(`Rider ${userId} registered with socket ${socket.id}`);
    }
  });
  
  // Track specific driver (new handler)
  socket.on("tracking_driver", ({ driverId, requestId }) => {
    console.log(`Rider ${socket.userId} is tracking driver ${driverId} for request ${requestId}`);
    // If we have location for this driver, send it immediately
    if (driverLocations[driverId]) {
      socket.emit("driver_location_update", driverLocations[driverId]);
    }
  });

  // Register driver
  socket.on("driver_register", async ({ driverId }) => {
    const driverId = socket.userId;
    if (!driverId) return; // Prevent unnecessary DB queries

    try {
      const driver = await Driver.findOne({ where: { user_id: driverId } });
      const vehicle = await Vehicle.findOne({
        where: { id: driver.vehicle_id },
      });
      driverDeails[socket.id] = { driver, vehicle };
      if (driverId) {
      socket.driverId = driverId;  // Store driverId on socket object
      activeDrivers[socket.id] = socket;
        console.log(`Driver ${driverId} registered with socket ${socket.id}`);
    } catch (error) {
      console.error("Error fetching driver details:", error);
    }
    }
  });

  // Update driver location
  socket.on("update_location", (locationData) => {
    // Store location by socket ID using standardized lat/lng format
    const { lat, lng } = locationData;
    driverLocations[socket.id] = { lat, lng };
    console.log(`Driver ${socket.id} updated location: lat=${lat}, lng=${lng}`);

    // Find requests where this driver's socket is the assigned driver
    Object.keys(booking_requests).forEach((requestId) => {
      const request = booking_requests[requestId];
      if (request.accepted && 
          (request.driverSocketId === socket.id || 
           (socket.driverId && request.driverId === socket.driverId))) {
        // Use our improved rider lookup
        const riderUserId = request.riderUserId;
        const riderSocket = activeRiders[riderUserId] || findRiderSocket(riderUserId);
        if (riderSocket) {
          console.log(`Sending location update to rider ${riderUserId} (socket ${riderSocket.id})`);
          riderSocket.emit("driver_location_update", { lat, lng });
        }
      }
    });
  });

  // Rider requests a ride
  socket.on("book_request", async (data) => {
    console.log("New ride request: ", data);
    const requestId = `ride_${Date.now()}`;
    const vehicleTypes = ["premium", "standard", "auto", "bike"];

    // Ensure we have the rider's user ID
    if (!socket.userId && data.id) {
      socket.userId = data.id;
      activeRiders[data.id] = socket;
      console.log(`Registered rider ${data.id} with socket ${socket.id} during booking`);
    }

    try {
      const newPickupLocation = await Location.create({
        coordinates: {
          type: "Point",
          coordinates: [data.pickCoordinates[1], data.pickCoordinates[0]], // Note: GeoJSON uses [longitude, latitude]
        },
        address: data.pickLoc,
      });

      const newDropoffLocation = await Location.create({
        coordinates: {
          type: "Point",
          coordinates: [data.dropCoordinates[1], data.dropCoordinates[0]], // Note: GeoJSON uses [longitude, latitude]
        },
        address: data.dropLoc,
      });

      const newRide = await Ride.create({
        driver_id: null,
        passenger_id: data.id,
        start_location_id: newPickupLocation.id,
        end_location_id: newDropoffLocation.id,
        fare: data.price,
        booking_date: data.booking_date,
        status: "pending",
        vehicle_requested: vehicleTypes[data.rideType],
        distance: data.distance,
      });

      console.log("Ride created successfully:", newRide);
      
      // Store the ride request with all necessary information
      booking_requests[requestId] = {
        rideId: newRide.ride_id,
        riderUserId: data.id,
        riderSocketId: socket.id,
        data,
        accepted: false,
        driverId: null,
        driverSocketId: null
      };

      console.log(`Booking request ${requestId} created for rider ${data.id} (socket ${socket.id})`);
      console.log("Active booking requests:", Object.keys(booking_requests).length);

      // Notify all active drivers about the new ride request
      Object.values(activeDrivers).forEach((driverSocket) => {
        if (
          driverDeails[driverSocket.id].vehicle.type ===
          vehicleTypes[data.rideType]
        ) {
          driverSocket.emit("new_ride_request", { requestId, data });
        }
      });
    } catch (error) {
      console.error("Error creating ride:", error);
      socket.emit("booking_error", { message: "Failed to create ride request" });
    }
  });

  socket.on("driver_location", async ({ driverId, lat, lng }) => {
    console.log(`Driver ${driverId} (socket ${socket.id}) location: ${lat}, ${lng}`);
    
    // Store location by both socket ID and driver ID for redundancy
    driverLocations[socket.id] = { lat, lng };
    driverLocations[driverId] = { lat, lng };

    try {
      // Find the driver
      const driver = await User.findOne({ where: { id: driverId } });

      if (!driver) {
        console.error(`Driver ${driverId} not found`);
        return;
      }

      if (!driver.location_id) {
        // Create new location if it doesn't exist
        const newLocation = await Location.create({
          coordinates: {
            type: "Point",
            coordinates: [lng, lat], // Note: GeoJSON uses [longitude, latitude]
          },
        });

        driver.location_id = newLocation.id;
        await driver.save(); // Ensure the driver record is updated
      } else {
        const location = await Location.findOne({
          where: { id: driver.location_id },
        });

        if (location) {
          location.coordinates = {
            type: "Point",
            coordinates: [lng, lat], // Note: GeoJSON uses [longitude, latitude]
          };
          await location.save();
        } else {
          console.error(`Location ${driver.location} not found`);
        }
      }

      // Find ride requests that are accepted by this driver
      const rideRequests = Object.values(booking_requests).filter(
        (req) => req.accepted && (req.driverId === driverId || req.driverSocketId === socket.id)
      );

      // Send location updates to all associated riders
      rideRequests.forEach(request => {
        const riderSocket = activeRiders[request.riderUserId] || findRiderSocket(request.riderUserId);
        if (riderSocket) {
          console.log(`Sending driver_location_update to rider ${request.riderUserId}`);
          riderSocket.emit("driver_location_update", { lat, lng });
        }
      });
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  });

  // Driver accepts a ride
  socket.on("accept_ride", async ({ requestId, driverId }) => {
    console.log(`Driver ${driverId} (socket ${socket.id}) accepted ride ${requestId}`);

    if (!booking_requests[requestId]) {
      console.error(`Ride request ${requestId} not found`);
      return;
    }

    if (!booking_requests[requestId].accepted) {
      booking_requests[requestId].accepted = true;
      booking_requests[requestId].driverId = driverId;
      booking_requests[requestId].driverSocketId = socket.id; // Store both driver ID and socket ID

      try {
        // Get driver info from database
        const driver = await User.findByPk(driverId);
        if (!driver) {
          console.error(`Driver ${driverId} not found in database`);
          return;
        }

        // Create simplified driver info
        const driverInfo = {
          id: driverId,
          name: driver.first_name + ' ' + driver.last_name || "Driver",
          phone: driver.phone_number || "Contact through app",
          vehicle: {
            model: "Vehicle",
            color: "Not specified",
            plate: "Not specified"
          }
        };

        // Find and notify the rider
        const riderUserId = booking_requests[requestId].riderUserId;
        console.log(`Looking for rider ${riderUserId} for ride ${requestId}`);
        
        // Get all sockets to debug
        console.log("Active rider sockets:", Object.keys(activeRiders));
        const allSockets = Array.from(io.sockets.sockets.values());
        console.log("Total connected sockets:", allSockets.length);
        allSockets.forEach(s => {
          console.log(`Socket ${s.id} has userId: ${s.userId}`);
        });
        
        // First check in our activeRiders map
        let riderSocket = activeRiders[riderUserId];
        
        // If not found, try to find by userId in all sockets
        if (!riderSocket) {
          riderSocket = allSockets.find(s => s.userId == riderUserId);
          if (riderSocket) {
            console.log(`Found rider socket ${riderSocket.id} for user ${riderUserId} by searching all sockets`);
            // Update our map for future lookups
            activeRiders[riderUserId] = riderSocket;
          }
        }

        if (riderSocket) {
          console.log(`Notifying rider ${riderUserId} of ride acceptance through socket ${riderSocket.id}`);
          
          // Send driver info to rider
          riderSocket.emit("ride_accepted", {
            requestId,
            driverId,
            driverInfo
          });
          
          // Send current driver location if available
          if (driverLocations[socket.id]) {
            riderSocket.emit("driver_location_update", driverLocations[socket.id]);
          }
        } else {
          console.error(`Could not find socket for rider ${riderUserId}`);
        }

        // Notify other drivers that this ride is taken
        Object.values(activeDrivers).forEach(driverSocket => {
          if (driverSocket.id !== socket.id) {
            driverSocket.emit("ride_taken", requestId);
          }
        });

        // Update ride status in database
        await Ride.update(
          { driver_id: driverId, status: "accepted" },
          { where: { ride_id: booking_requests[requestId].rideId } }
        );
        
        console.log(`Successfully updated ride ${requestId} status in database`);
      } catch (error) {
        console.error("Error processing ride acceptance:", error);
      }
    }
  });

  // Handle rider reconnection
  socket.on("reconnect_rider", async () => {
    if (!socket.userId) return;

    console.log(`Rider ${socket.userId} reconnected`);
    
    // Update the active riders map with the reconnected socket
    if (socket.userId) {
      activeRiders[socket.userId] = socket;
    }

    // Find if this rider has any active ride requests
    const rideRequest = Object.entries(booking_requests).find(
      ([id, req]) => req.riderUserId === socket.userId && req.accepted
    );

    if (rideRequest) {
      const [requestId, request] = rideRequest;
      console.log(`Found active ride ${requestId} for reconnected rider ${socket.userId}`);
      
      try {
        // Fetch driver details from database
        const driver = await User.findOne({ 
          where: { id: request.driverId },
          include: [
            { 
              model: Driver,
              as: 'driver_details',
              attributes: ['vehicle_model', 'vehicle_color', 'license_plate'] 
            }
          ] 
        });

        if (!driver) {
          console.error(`Driver with ID ${request.driverId} not found in database during rider reconnect`);
          socket.emit("ride_error", {
            message: "Could not retrieve driver details"
          });
          return;
        }

        // Create driver info object to send to passenger
        const driverInfo = {
          id: driver.id,
          name: `${driver.first_name} ${driver.last_name}`,
          phone: driver.phone_number || "Contact through app",
          rating: driver.rating || 4.5,
          vehicle: {
            model: driver.driver_details?.vehicle_model || "Vehicle",
            color: driver.driver_details?.vehicle_color || "Not specified",
            plate: driver.driver_details?.license_plate || "Not specified"
          },
          profile_pic: driver.profile_pic || null
        };
      
        console.log(`Sending ride acceptance update to reconnected rider ${socket.userId}`);
        
        socket.emit("ride_accepted", {
          driverId: request.driverId,
          requestId: requestId,
          driverInfo // Include driver details
        });

        // Also send current ride status
        if (request.status === "arrived") {
          socket.emit("driver_arrived", {
            requestId,
            message: "Your driver has arrived at the pickup location"
          });
        }

        // Send the latest driver location if available
        if (driverLocations[request.driverId] || driverLocations[request.driverSocketId]) {
          socket.emit(
            "driver_location_update",
            driverLocations[request.driverId] || driverLocations[request.driverSocketId]
          );
        }
      } catch (error) {
        console.error(`Error during rider reconnection: ${error}`);
        socket.emit("ride_error", {
          message: "Failed to fetch driver info"
        });
      }
    }
  });

  // Handle driver reconnection
  socket.on("reconnect_driver", async ({ driverId }) => {
    if (!driverId) return;
    
    console.log(`Driver ${driverId} reconnected with socket ${socket.id}`);
    
    // Update driver socket references
    socket.driverId = driverId;
    activeDrivers[socket.id] = socket;
    
    try {
      // Fetch driver details from database to ensure we have current info
      const driver = await User.findOne({ 
        where: { id: driverId },
        include: [
          { 
            model: Driver,
            as: 'driver_details',
            attributes: ['vehicle_model', 'vehicle_color', 'license_plate'] 
          }
        ] 
      });

      if (!driver) {
        console.error(`Driver with ID ${driverId} not found in database during reconnect`);
        return;
      }
      
      // Check if this driver has any active rides
      const activeRideRequests = Object.entries(booking_requests)
        .filter(([id, req]) => req.accepted && req.driverId === driverId);
      
      if (activeRideRequests.length > 0) {
        console.log(`Driver ${driverId} has ${activeRideRequests.length} active ride(s)`);
        
        // Update all active rides with the new socket ID
        activeRideRequests.forEach(([requestId, request]) => {
          request.driverSocketId = socket.id;
          console.log(`Updated ride ${requestId} with new driver socket ID ${socket.id}`);
          
          // Send confirmation to the driver
          socket.emit("ride_status", {
            requestId,
            riderUserId: request.riderUserId,
            pickup: request.data.pickLoc,
            dropoff: request.data.dropLoc,
            status: "accepted"
          });
          
          // Also update passenger with the refreshed driver connection
          const riderUserId = request.riderUserId;
          const riderSocket = activeRiders[riderUserId] || findRiderSocket(riderUserId);
          
          if (riderSocket) {
            console.log(`Notifying rider ${riderUserId} of driver reconnection`);
            
            // Create driver info object to send to passenger
            const driverInfo = {
              id: driver.id,
              name: `${driver.first_name} ${driver.last_name}`,
              phone: driver.phone_number || "Contact through app",
              rating: driver.rating || 4.5,
              vehicle: {
                model: driver.driver_details?.vehicle_model || "Vehicle",
                color: driver.driver_details?.vehicle_color || "Not specified",
                plate: driver.driver_details?.license_plate || "Not specified"
              },
              profile_pic: driver.profile_pic || null
            };
            
            // Notify passenger of driver reconnection with driver details
            riderSocket.emit("driver_reconnected", {
              requestId,
              driverId,
              driverInfo
            });
          }
        });
      } else {
        console.log(`Driver ${driverId} has no active rides`);
      }
    } catch (error) {
      console.error(`Error during driver reconnection: ${error}`);
    }
  });

  // Driver notifies passenger of arrival
  socket.on("driver_arrived", ({ requestId, driverId }) => {
    console.log(`Driver ${driverId} (socket ${socket.id}) has arrived for ride ${requestId}`);
    
    const request = booking_requests[requestId];
    if (!request) {
      console.error(`Ride request ${requestId} not found`);
      return;
    }
    
    // Update ride status in memory
    request.status = "arrived";
    
    // Find the rider through all possible methods
    const riderUserId = request.riderUserId;
    
    // Log debug info
    console.log(`Looking for rider ${riderUserId} to notify of driver arrival`);
    console.log("Active rider sockets:", Object.keys(activeRiders));
    
    // Try to find in activeRiders map first
    let riderSocket = activeRiders[riderUserId];
    
    // If not found, search all sockets
    if (!riderSocket) {
      console.log("Searching all sockets for rider");
      const allSockets = Array.from(io.sockets.sockets.values());
      riderSocket = allSockets.find(s => s.userId == riderUserId);
      
      if (riderSocket) {
        console.log(`Found rider socket ${riderSocket.id} by searching all sockets`);
        // Update our map for future
        activeRiders[riderUserId] = riderSocket;
      }
    }
    
    if (riderSocket) {
      console.log(`Sending driver_arrived event to rider ${riderUserId} (socket ${riderSocket.id})`);
      riderSocket.emit("driver_arrived", {
        requestId,
        message: "Your driver has arrived at the pickup location",
        shouldRedirect: true,
        redirectTo: "/ride"
      });
    } else {
      console.error(`Could not find socket for rider ${riderUserId}`);
    }
    
    // Update ride status in database
    Ride.update(
      { status: "in_progress" },
      { where: { ride_id: request.rideId } }
    ).catch(err => {
      console.error(`Error updating ride status: ${err}`);
    });
  });
  
  // Driver ends journey
  socket.on("end_journey", ({ requestId, driverId }) => {
    console.log(`Driver ${driverId} (socket ${socket.id}) has ended ride ${requestId}`);
    
    const request = booking_requests[requestId];
    if (!request) {
      console.error(`Ride request ${requestId} not found`);
      return;
    }
    
    // Update ride status in memory
    request.status = "completed";
    
    // Find the rider through all possible methods
    const riderUserId = request.riderUserId;
    
    // Log debug info
    console.log(`Looking for rider ${riderUserId} to notify of journey end`);
    console.log("Active rider sockets:", Object.keys(activeRiders));
    
    // Try to find in activeRiders map first
    let riderSocket = activeRiders[riderUserId];
    
    // If not found, search all sockets
    if (!riderSocket) {
      console.log("Searching all sockets for rider");
      const allSockets = Array.from(io.sockets.sockets.values());
      riderSocket = allSockets.find(s => s.userId == riderUserId);
      
      if (riderSocket) {
        console.log(`Found rider socket ${riderSocket.id} by searching all sockets`);
        // Update our map for future
        activeRiders[riderUserId] = riderSocket;
      }
    }
    
    if (riderSocket) {
      console.log(`Sending journey_ended event to rider ${riderUserId} (socket ${riderSocket.id})`);
      riderSocket.emit("journey_ended", {
        requestId,
        fare: request.data.price,
        message: "Your journey has ended. Please proceed to payment.",
        shouldRedirect: true,
        redirectTo: "/pay"
      });
    } else {
      console.error(`Could not find socket for rider ${riderUserId}`);
    }
    
    // Update ride status in database
    Ride.update(
      { status: "completed" },
      { where: { ride_id: request.rideId } }
    ).catch(err => {
      console.error(`Error updating ride status: ${err}`);
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
    
    // Remove from activeDrivers if this was a driver
    if (socket.driverId) {
      console.log(`Driver ${socket.driverId} disconnected`);
      delete activeDrivers[socket.id];
    }
    
    // Remove from activeRiders if this was a rider
    if (socket.userId) {
      console.log(`Rider ${socket.userId} disconnected`);
      // Only remove if this is the current socket for this user ID
      if (activeRiders[socket.userId]?.id === socket.id) {
        delete activeRiders[socket.userId];
      }
    }
    
    // Always clean up location data
    delete driverLocations[socket.id];
  });
});

app.get("/", (req, res) => {
  res.send("Taxi Booking API is running...");
});

const startServer = async () => {
  try {
    await syncDatabase();
    console.log("All tables synced successfully");

    server.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      await sequelize.close();
      server.close(() => {
        console.log("Server shut down gracefully.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("Received termination signal. Closing server...");
      await sequelize.close();
      server.close(() => {
        console.log("Server shut down due to termination signal.");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
