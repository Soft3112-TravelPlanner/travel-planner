import type { Destination } from "./interfaces";

export const destinations: Destination[] = [
  {
    id: "1",
    name: "Historical Peninsula",
    city: "Istanbul",
    country: "Turkey",
    description:
      "The heart of the Byzantine and Ottoman Empires, offering a mesmerizing journey through history.",
    mainImageUrl:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800",
    coordinates: { lat: 41.0082, lng: 28.9784 },
    landmarks: [
      {
        id: "l1",
        name: "Hagia Sophia Grand Mosque",
        type: "Historical Site",
        description:
          "One of the world's greatest architectural marvels, originally built as a cathedral.",
        imageUrl:
          "https://images.unsplash.com/photo-1543967625-7033583645b2?auto=format&fit=crop&w=400",
        coordinates: { lat: 41.0086, lng: 28.9799 },
      },
      {
        id: "l2",
        name: "Basilica Cistern",
        type: "Museum",
        description:
          "An ancient underground water reservoir featuring the famous Medusa heads.",
        coordinates: { lat: 41.0084, lng: 28.9778 },
      },
    ],
    localRestaurants: [
      {
        id: "r1",
        name: "Historical Sultanahmet Koftecisi",
        cuisine: "Turkish",
        rating: 4.5,
        address: "Divanyolu Cd. No:12, Sultanahmet",
        priceRange: "$$",
        coordinates: { lat: 41.0081, lng: 28.9772 },
        specialtyDish: "Grilled Meatballs",
      },
    ],
    estimatedBudget: 150,
  },
  {
    id: "2",
    name: "Colosseum District",
    city: "Rome",
    country: "Italy",
    description:
      "The legendary arena of Ancient Rome, once the stage for gladiator battles.",
    mainImageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800",
    coordinates: { lat: 41.8902, lng: 12.4922 },
    landmarks: [
      {
        id: "l3",
        name: "Roman Forum",
        type: "Archaeological Site",
        description:
          "The center of day-to-day life in Ancient Rome and the site of important government buildings.",
        coordinates: { lat: 41.8925, lng: 12.4853 },
      },
    ],
    localRestaurants: [
      {
        id: "r2",
        name: "Trattoria Luzzi",
        cuisine: "Italian",
        rating: 4.7,
        address: "Via di S. Giovanni in Laterano, 88",
        priceRange: "$$",
        coordinates: { lat: 41.8895, lng: 12.495 },
        specialtyDish: "Lasagna",
      },
    ],
    estimatedBudget: 1500,
  },
  {
    id: "3",
    name: "Shibuya District",
    city: "Tokyo",
    country: "Japan",
    description:
      "Home to the world's busiest pedestrian crossing and a hub for neon lights and fashion.",
    mainImageUrl:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800",
    coordinates: { lat: 35.6595, lng: 139.7005 },
    landmarks: [
      {
        id: "l4",
        name: "Hachiko Statue",
        type: "Monument",
        description:
          "A famous meeting spot dedicated to the legendary loyal dog, Hachiko.",
        coordinates: { lat: 35.6591, lng: 139.7006 },
      },
    ],
    localRestaurants: [
      {
        id: "r3",
        name: "Ichiran Ramen",
        cuisine: "Japanese",
        rating: 4.8,
        address: "Shibuya City, Jinnan, 1 Chome−22−7",
        priceRange: "$$",
        coordinates: { lat: 35.661, lng: 139.7015 },
        specialtyDish: "Tonkotsu Ramen",
      },
    ],
    estimatedBudget: 15000,
  },
];
