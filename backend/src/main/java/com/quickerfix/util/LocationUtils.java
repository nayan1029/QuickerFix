package com.quickerfix.util;

import org.springframework.stereotype.Component;

@Component
public class LocationUtils {

    /**
     * Calculates the distance between two points in latitude and longitude.
     * Uses Haversine method.
     *
     * @returns Distance in Meters
     */
    public double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371000; // Radius of the earth in meters

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
                
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    public boolean isWithinRadius(double lat1, double lng1, double lat2, double lng2, double radiusMeters) {
        return calculateDistance(lat1, lng1, lat2, lng2) <= radiusMeters;
    }
}
