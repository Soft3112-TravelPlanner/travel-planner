export interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterType {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface LoginType {
  email: string;
  password: string;
  remember: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  itinerary?: string[];
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Landmark {
  id: string;
  name: string;
  type: string; // Müze, Park, Tarihi Alan vb.
  description?: string;
  imageUrl?: string;
  coordinates: Coordinate;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string; // Mutfak tipi
  rating: number;
  address: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  coordinates: Coordinate;
  specialtyDish?: string; // Meşhur yemeği
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  mainImageUrl: string;
  coordinates: Coordinate; // Harita üzerinde merkez nokta
  landmarks: Landmark[];
  localRestaurants: Restaurant[];
  averageRating?: number;
  estimatedBudget: number;
}
