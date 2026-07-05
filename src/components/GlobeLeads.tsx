import { useEffect, useRef, useCallback, useState } from "react";
import createGlobe from "cobe";
import { MapPin } from "lucide-react";

interface LeadMarker {
  id: string;
  location: [number, number];
  ownerName: string;
  businessName: string;
  city: string;
  industry: string;
  avatar: string;
  status: "No Website" | "Outdated Website" | "Needs Redesign";
}

interface GlobeLeadsProps {
  markers?: LeadMarker[];
  className?: string;
  speed?: number;
}

const defaultMarkers: LeadMarker[] = [
  {
    id: "lead-1",
    location: [40.7128, -74.006],
    ownerName: "Sarah Wilson",
    businessName: "Bright Smile Dental",
    city: "New York, USA",
    industry: "Dental Clinic",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    status: "No Website",
  },
  {
    id: "lead-2",
    location: [51.5074, -0.1278],
    ownerName: "Mike Johnson",
    businessName: "Premier Roofing Co",
    city: "London, UK",
    industry: "Roofing Company",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    status: "No Website",
  },
  {
    id: "lead-3",
    location: [59.3293, 18.0686],
    ownerName: "Sophie Martin",
    businessName: "Nordic Design House",
    city: "Stockholm, Sweden",
    industry: "Interior Designer",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    status: "Outdated Website",
  },
  {
    id: "lead-4",
    location: [-23.5505, -46.6333],
    ownerName: "Carlos Mendes",
    businessName: "Mendes Auto Works",
    city: "São Paulo, Brazil",
    industry: "Auto Repair Shop",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    status: "Needs Redesign",
  },
  {
    id: "lead-5",
    location: [19.076, 72.8777],
    ownerName: "Rahul Sharma",
    businessName: "Glamour Beauty Salon",
    city: "Mumbai, India",
    industry: "Beauty Salon",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
    status: "No Website",
  },
  {
    id: "lead-6",
    location: [-33.8688, 151.2093],
    ownerName: "Emma Brown",
    businessName: "Zen Yoga Studio",
    city: "Sydney, Australia",
    industry: "Yoga Studio",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    status: "No Website",
  },
];

/* Card positions around the globe — top-left, top-right, center-left, center-right, bottom-left, bottom-right */
const cardPositions = [
  { top: "2%", left: "40%", right: "auto" },
  { top: "5%", right: "0%", left: "auto" },
  { top: "30%", left: "32%", right: "auto" },
  { top: "52%", right: "-2%", left: "auto" },
  { top: "55%", left: "20%", right: "auto" },
  { top: "72%", right: "2%", left: "auto" },
];

function statusClass(status: LeadMarker["status"]) {
  switch (status) {
    case "No Website":
      return "no-website";
    case "Outdated Website":
      return "outdated";
    case "Needs Redesign":
      return "needs-redesign";
  }
}

export function GlobeLeads({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeLeadsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phi = useRef(0);
  const [isVisible, setIsVisible] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      pointerInteracting.current =
        e.clientX - pointerInteractionMovement.current;
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    },
    []
  );

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const onMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
      }
    },
    []
  );

  useEffect(() => {
    // Fade in the cards after a short delay
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const markerLocations = markers.map((m) => ({
      location: [
        (m.location[0] * Math.PI) / 180,
        (m.location[1] * Math.PI) / 180,
      ] as [number, number],
      size: 0.06,
    }));

    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 0,
      diffuse: 1.8,
      mapSamples: 20000,
      mapBrightness: 4.5,
      baseColor: [0.92, 0.92, 0.95],
      markerColor: [0.43, 0.36, 0.96],
      glowColor: [0.9, 0.92, 0.95],
      markers: markerLocations,
      onRender: (state) => {
        if (pointerInteracting.current === null) {
          phi.current += speed;
        }
        state.phi = phi.current + pointerInteractionMovement.current / 200;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [markers, speed]);

  const visibleCards = markers.slice(0, 6);

  return (
    <div className={`globe-container ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerOut}
        onPointerMove={onMouseMove}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          maxWidth: "100%",
        }}
      />
      {visibleCards.map((marker, i) => (
        <div
          key={marker.id}
          className="lead-card-float"
          style={{
            ...cardPositions[i % cardPositions.length],
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
            animationDelay: `${-i * 1.2}s`,
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={marker.avatar}
              alt={marker.ownerName}
              className="avatar"
              loading="lazy"
            />
            <span className="online-dot" />
          </div>
          <div className="info">
            <span className="name">{marker.ownerName}</span>
            <span className="detail">
              <MapPin />
              {marker.city}
            </span>
            <span className="detail">
              <MapPin />
              {marker.industry}
            </span>
            <span className={`status-badge ${statusClass(marker.status)}`}>
              {marker.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GlobeLeads;
