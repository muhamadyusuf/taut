import { 
  Instagram, Facebook, Twitter, Linkedin, Github, Youtube, 
  Globe, Mail, Phone, MapPin, ShoppingCart, Music, Video, Link 
} from "lucide-react";

// Kita definisikan tipe Icon
export const ICONS: Record<string, React.ReactElement> = {
  // --- SOCIAL MEDIA ---
  instagram: <Instagram size={20} />,
  facebook: <Facebook size={20} />,
  twitter: <Twitter size={20} />,
  linkedin: <Linkedin size={20} />,
  youtube: <Youtube size={20} />,
  github: <Github size={20} />,
  
  // --- CUSTOM SVG (Untuk yang tidak ada di Lucide) ---
  whatsapp: (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0 1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
  ),

  // --- GENERIC ---
  website: <Globe size={20} />,
  email: <Mail size={20} />,
  phone: <Phone size={20} />,
  location: <MapPin size={20} />,
  shop: <ShoppingCart size={20} />,
  music: <Music size={20} />,
  video: <Video size={20} />,
  default: <Link size={20} />,
};

// Helper untuk mengambil komponen icon berdasarkan string name
export const getIcon = (name?: string) => {
  return ICONS[name?.toLowerCase() || ""] || ICONS["default"];
};