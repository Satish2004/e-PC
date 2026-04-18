import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/api';
import { toast } from 'react-toastify';
import { FileText, Send, Info, ChevronRight, Activity, Zap, CheckCircle2, MapPin, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redMarker = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const LocationPicker = ({ location, setLocation }) => {
    useMapEvents({
        click(e) { setLocation({ lat: e.latlng.lat, lng: e.latlng.lng, address: "Selected Area" }); }
    });
    return location ? <Marker position={[location.lat, location.lng]} icon={redMarker} /> : null;
};

const Dashboard = () => {
    const { user, token } = useAuthStore();
    const [activeTab, setActiveTab] = useState('complaints');
    const [complaints, setComplaints] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [polls, setPolls] = useState([]);
    
    // Complaint Form State
    const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });
    const [images, setImages] = useState([]);
    const [location, setLocation] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const headers is now handled by api interceptor

    useEffect(() => {
        fetchComplaints();
        fetchSchemes();
        fetchPolls();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchSchemes = async () => {
        try {
            const res = await api.get('/schemes');
            setSchemes(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchPolls = async () => {
        try {
            const res = await api.get('/polls');
            setPolls(res.data);
        } catch (error) { console.error(error); }
    };

    const detectLocation = () => {
        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: "Current Location" });
                setIsDetecting(false);
            },
            (err) => {
                toast.error("Location access denied. Please click on map manually.");
                setIsDetecting(false);
            }
        );
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            toast.warning("Maximum 3 images allowed");
            return;
        }
        setImages([...images, ...files].slice(0, 3));
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        if (images.length === 0) return toast.warning("Please upload at least 1 image to support your claim.");
        if (!location) return toast.warning("Please select the incident location on the map.");

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', complaintForm.title);
        formData.append('description', complaintForm.description);
        formData.append('location', JSON.stringify(location));
        images.forEach(img => formData.append('images', img));

        try {
            await api.post('/complaints', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            toast.success("Complaint submitted securely! AI is processing it.");
            setComplaintForm({ title: '', description: '' });
            setImages([]);
            setLocation(null);
            fetchComplaints();
        } catch (error) {
            toast.error("Failed to submit. Check internet or file size (<5MB).");
        } finally {
            setIsSubmitting(false);
        }
    };

    const vote = async (pollId, optionId) => {
        try {
            await api.post(`/polls/${pollId}/vote`, { optionId });
            toast.success("Vote registered!");
            fetchPolls();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to vote");
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-2">
                            Welcome, <span className="text-blue-500">{user?.name?.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-slate-400 text-lg sm:text-xl max-w-xl">Your personal portal to local governance, AI assistance, and community affairs.</p>
                    </div>
                    
                    {/* Floating Tab Selector */}
                    <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 w-fit flex-wrap">
                        {['complaints', 'schemes', 'polls', 'analytics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold capitalize transition-all duration-300 xl:flex-none ${
                                    activeTab === tab 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Complaints Tab Content */}
                        {activeTab === 'complaints' && (
                            <>
                                {/* Create Complaint Panel */}
                                <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm hover:border-blue-500/30 transition-colors duration-500 group overflow-hidden h-fit flex flex-col relative z-20">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <FileText className="w-32 h-32 text-blue-400" />
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Zap className="text-yellow-400 w-6 h-6"/> File Issue</h2>
                                        <p className="text-sm text-slate-400 mb-6">Let e-PC instantly draft, locate, and prioritize your issue.</p>
                                        
                                        <form onSubmit={submitComplaint} className="space-y-4">
                                            <input 
                                                placeholder="Issue Subject" required
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm sm:text-base relative z-30"
                                                value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})}
                                            />
                                            <textarea 
                                                placeholder="Describe what's wrong..." required rows="3"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none text-sm sm:text-base relative z-30"
                                                value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                                            ></textarea>
                                            
                                            {/* Photo Upload Section */}
                                            <div className="bg-slate-900/50 border border-white/10 border-dashed rounded-xl p-4 relative z-30">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Camera className="w-4 h-4" /> Evidence Photos (Min 1, Max 3)</span>
                                                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition font-semibold">
                                                        Browse
                                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                                    </label>
                                                </div>
                                                {images.length > 0 ? (
                                                    <div className="flex gap-2">
                                                        {images.map((img, idx) => (
                                                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                                                                <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full hover:bg-red-500 transition">
                                                                    <X className="w-3 h-3"/>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-xs text-slate-500 text-center py-2">No photos uploaded yet</p>}
                                            </div>

                                            {/* Location Section */}
                                            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden relative z-30">
                                                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" /> Pinpoint Location
                                                    </span>
                                                    <button type="button" onClick={detectLocation} className="text-xs bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded hover:bg-blue-500/30 transition flex items-center gap-1">
                                                        {isDetecting ? 'Detecting...' : 'Auto Detect'}
                                                    </button>
                                                </div>
                                                <div className="h-[200px] w-full z-10 bg-slate-800">
                                                    <MapContainer center={location ? [location.lat, location.lng] : [28.6139, 77.2090]} zoom={location ? 15 : 5} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 10 }}>
                                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                                        <LocationPicker location={location} setLocation={setLocation} />
                                                    </MapContainer>
                                                </div>
                                            </div>

                                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 relative z-30">
                                                <Send className="w-4 h-4"/> {isSubmitting ? 'Uploading Data...' : 'Submit Evidence to Network'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* History Panel */}
                                <div className="lg:col-span-7 flex flex-col gap-4">
                                    {complaints.map((c, i) => {
                                        const markerColor = c.status === 'Resolved' ? 'green' : c.status === 'In Progress' ? 'blue' : 'yellow';
                                        const customIcon = new L.Icon({
                                            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                                        });

                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={c._id} 
                                                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-bold text-xl">{c.title}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                                                        c.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        c.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 mb-6 font-light">{c.description}</p>

                                                {/* Images Section */}
                                                {c.images && c.images.length > 0 && (
                                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                        {c.images.map((img, idx) => (
                                                            <a href={img} target="_blank" rel="noreferrer" key={idx} className="block w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition">
                                                                <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Map Section */}
                                                {c.location && c.location.lat && (
                                                    <div className="h-40 w-full rounded-xl overflow-hidden mb-6 border border-white/10 z-0 relative">
                                                        <MapContainer center={[c.location.lat, c.location.lng]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                                                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                                            <Marker position={[c.location.lat, c.location.lng]} icon={customIcon}>
                                                                <Popup>{c.address || "Issue Location"}</Popup>
                                                            </Marker>
                                                        </MapContainer>
                                                    </div>
                                                )}
                                                
                                                {c.aiEnhancement && (
                                                    <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800">
                                                        <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3 flex items-center gap-2">
                                                            <Activity className="w-4 h-4"/> AI Network Analysis
                                                        </p>
                                                        <p className="text-sm text-slate-300 border-l-2 border-blue-500/50 pl-4 py-1 italic mb-4">
                                                            "{c.aiEnhancement}"
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-medium border border-slate-700">Category: {c.category}</span>
                                                            <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-medium border border-slate-700">Urgency: {c.urgency}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                    {complaints.length === 0 && (
                                        <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
                                            <p className="text-slate-500 font-medium">No history found. Create a request first.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Schemes Tab Content */}
                        {activeTab === 'schemes' && (
                            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {schemes.map((s, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={s._id} 
                                        className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col hover:bg-white/10 transition duration-300"
                                    >
                                        <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                                        <p className="text-slate-400 font-light mb-6 flex-1 line-clamp-3">{s.description}</p>
                                        
                                        {s.simplifiedDescription && (
                                            <div className="bg-emerald-500/10 p-5 rounded-2xl mb-6 border border-emerald-500/20">
                                                <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2 flex items-center gap-1"><Info className="w-3 h-3"/> AI Simply Explained</p>
                                                <p className="text-sm text-emerald-100">{s.simplifiedDescription}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mt-auto space-y-4">
                                            <div className="text-xs border-t border-white/10 pt-4 flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0"/>
                                                <span className="text-slate-400">{s.eligibility}</span>
                                            </div>
                                            {s.link && (
                                                <a href={s.link} target="_blank" rel="noreferrer" className="w-full block text-center py-2.5 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition">
                                                    Apply Direct
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Polls Tab Content */}
                        {activeTab === 'polls' && (
                            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {polls.map((p, i) => {
                                    const hasVoted = p.voters.includes(user?._id);
                                    const totalVotes = p.options.reduce((acc, curr) => acc + curr.votes, 0);

                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={p._id} 
                                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                                        >
                                            <h3 className="text-2xl font-bold mb-8 w-11/12">{p.question}</h3>
                                            <div className="space-y-4">
                                                {p.options.map(opt => {
                                                    const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                                                    return (
                                                        <button 
                                                            key={opt._id}
                                                            disabled={hasVoted || !p.isActive}
                                                            onClick={() => vote(p._id, opt._id)}
                                                            className={`w-full text-left relative overflow-hidden p-4 rounded-xl border transition-all duration-300 ${
                                                                hasVoted 
                                                                ? 'bg-slate-900 border-white/5 cursor-default' 
                                                                : 'hover:border-blue-500 hover:bg-blue-500/10 cursor-pointer border-white/10'
                                                            }`}
                                                        >
                                                            {hasVoted && (
                                                                <div className="absolute left-0 top-0 bottom-0 bg-blue-600/30 z-0" style={{ width: `${percentage}%` }}></div>
                                                            )}
                                                            <div className="relative z-10 flex justify-between items-center text-sm font-semibold tracking-wide">
                                                                <span>{opt.text}</span>
                                                                {hasVoted && <span className="text-white">{percentage}%</span>}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-8 text-xs font-medium tracking-widest text-slate-500 uppercase">
                                                Total casted: {totalVotes}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Analytics Tab Content */}
                        {activeTab === 'analytics' && (
                            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Complaints Analytics */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm"
                                >
                                    <h3 className="text-xl font-bold mb-6">Complaint Status Breakdown</h3>
                                    <div className="h-64 w-full">
                                        {complaints.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie 
                                                    data={[
                                                        { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
                                                        { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length },
                                                        { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length || complaints.filter(c => !c.status).length }
                                                    ].filter(d => d.value > 0)} 
                                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                                >
                                                    { [
                                                        { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
                                                        { name: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length },
                                                        { name: 'Pending', value: complaints.filter(c => c.status === 'Pending').length || complaints.filter(c => !c.status).length }
                                                    ].filter(d => d.value > 0).map((entry, index) => {
                                                        const COLORS = { 'Resolved': '#22c55e', 'In Progress': '#3b82f6', 'Pending': '#eab308' };
                                                        return <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />;
                                                    })}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        ) : <p className="text-slate-500 text-center mt-20">No complaints filed yet.</p>}
                                    </div>
                                </motion.div>
                            
                                {/* Category Bar Chart */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm"
                                >
                                    <h3 className="text-xl font-bold mb-6">Complaints by Category</h3>
                                    <div className="h-64 w-full">
                                        {complaints.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={complaints.reduce((acc, c) => {
                                                const cat = c.category || 'General';
                                                const existing = acc.find(item => item.name === cat);
                                                if (existing) { existing.value += 1; }
                                                else { acc.push({ name: cat, value: 1 }); }
                                                return acc;
                                            }, [])}>
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        ) : <p className="text-slate-500 text-center mt-20">No analytics available.</p>}
                                    </div>
                                </motion.div>

                                {/* Polls/Schemes Summary */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                    className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                                >
                                    <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-white/5">
                                        <h4 className="text-slate-400 text-xs sm:text-sm tracking-widest font-bold uppercase mb-2">Total Schemes</h4>
                                        <p className="text-4xl text-white font-black">{schemes.length}</p>
                                    </div>
                                    <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-emerald-500/10">
                                        <h4 className="text-slate-400 text-xs sm:text-sm tracking-widest font-bold uppercase mb-2">Polls Voted In</h4>
                                        <p className="text-4xl text-emerald-400 font-black">{polls.filter(p => p.voters.includes(user?._id)).length} <span className="text-2xl text-slate-500">/ {polls.length}</span></p>
                                    </div>
                                    <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-blue-500/10">
                                        <h4 className="text-slate-400 text-xs sm:text-sm tracking-widest font-bold uppercase mb-2">My Open Issues</h4>
                                        <p className="text-4xl text-blue-400 font-black">{complaints.filter(c => c.status !== 'Resolved').length}</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
