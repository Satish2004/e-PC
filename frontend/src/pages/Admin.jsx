import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/api';
import { toast } from 'react-toastify';
import { Settings, Plus, BarChart2, Activity, Zap, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Admin = () => {
    const { user, token } = useAuthStore();
    const [activeTab, setActiveTab] = useState('complaints');
    
    const [complaints, setComplaints] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [polls, setPolls] = useState([]);

    const [schemeForm, setSchemeForm] = useState({ title: '', description: '', eligibility: '', link: '' });
    const [pollForm, setPollForm] = useState({ question: '', option1: '', option2: '' });

    // const headers is now handled by api interceptor

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, sRes, pRes] = await Promise.all([
                api.get('/complaints'),
                api.get('/schemes'),
                api.get('/polls')
            ]);
            setComplaints(cRes.data);
            setSchemes(sRes.data);
            setPolls(pRes.data);
        } catch (error) { toast.error("Failed to fetch admin data"); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/complaints/${id}`, { status });
            toast.success("Status updated & User notified!");
            fetchData();
        } catch (error) { toast.error("Failed to update status"); }
    };

    const createScheme = async (e) => {
        e.preventDefault();
        try {
            await api.post('/schemes', schemeForm);
            toast.success("Scheme published!");
            setSchemeForm({ title: '', description: '', eligibility: '', link: '' });
            fetchData();
        } catch (error) { toast.error("Failed to create scheme"); }
    };

    const createPoll = async (e) => {
        e.preventDefault();
        try {
            await api.post('/polls', {
                question: pollForm.question,
                options: [pollForm.option1, pollForm.option2]
            });
            toast.success("Poll published!");
            setPollForm({ question: '', option1: '', option2: '' });
            fetchData();
        } catch (error) { toast.error("Failed to create poll"); }
    };

    if (user?.role !== 'Admin') return <div className="text-center mt-20 text-red-500 font-bold">Unauthorized Access</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                {/* Header Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 lg:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-16 h-16 bg-white/5 border border-white/10 rounded-2xl items-center justify-center shadow-lg">
                            <Settings className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-2">
                                System <span className="text-indigo-400">Control.</span>
                            </h1>
                            <p className="text-slate-400 text-sm sm:text-lg max-w-xl">Supervise network complaints, deploy schemes, and manage community polling parameters.</p>
                        </div>
                    </div>
                    
                    {/* Floating Tab Selector - Made scrollable on mobile */}
                    <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 w-full xl:w-fit overflow-x-auto no-scrollbar">
                        {['complaints', 'schemes', 'polls'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all duration-300 whitespace-nowrap flex-1 xl:flex-none ${
                                    activeTab === tab 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab} Management
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content Areas */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        {activeTab === 'complaints' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {complaints.map((c, i) => {
                                    const markerColor = c.status === 'Resolved' ? 'green' : c.status === 'In Progress' ? 'blue' : 'yellow';
                                    const customIcon = new L.Icon({
                                        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                                    });

                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={c._id} 
                                            className="bg-white/5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-white/10 hover:border-indigo-400/30 transition relative overflow-hidden backdrop-blur-sm flex flex-col h-full group"
                                        >
                                            <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                                                c.urgency === 'High' ? 'bg-red-500 shadow-[0_0_10px_red]' : 
                                                c.urgency === 'Medium' ? 'bg-yellow-400 shadow-[0_0_10px_yellow]' : 'bg-green-400'
                                            }`}></div>
                                            
                                            <div className="flex justify-between items-start mb-3 pl-2 sm:pl-3 w-full">
                                                <h4 className="font-bold text-lg sm:text-xl pr-2">{c.title}</h4>
                                                <span className="text-[10px] sm:text-xs font-bold px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 uppercase tracking-widest shrink-0">
                                                    {c.category}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs sm:text-sm text-slate-400 mb-6 pl-2 sm:pl-3 flex-1">
                                                {c.aiEnhancement || c.description}
                                            </p>

                                            {/* Admin Images View */}
                                            {c.images && c.images.length > 0 && (
                                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 pl-3">
                                                    {c.images.map((img, idx) => (
                                                        <a href={img} target="_blank" rel="noreferrer" key={idx} className="block w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-indigo-400/50 transition">
                                                            <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Admin Map View */}
                                            {c.location && c.location.lat && (
                                                <div className="h-32 w-[calc(100%-12px)] ml-3 rounded-xl overflow-hidden mb-6 border border-white/10 relative z-0">
                                                    <MapContainer center={[c.location.lat, c.location.lng]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                                        <Marker position={[c.location.lat, c.location.lng]} icon={customIcon}>
                                                            <Popup>{c.address || "Reported Area"}</Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 pl-2 sm:pl-3 relative z-10 bg-inherit">
                                                <div className="text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[120px] sm:max-w-[150px]">
                                                    By: <span className="text-slate-300">{c.user?.name}</span>
                                                </div>
                                                <select 
                                                    value={c.status} 
                                                    onChange={(e) => updateStatus(c._id, e.target.value)}
                                                    className={`text-[10px] sm:text-xs px-2 py-1 sm:py-1.5 rounded-lg font-bold border outline-none appearance-none cursor-pointer text-center min-w-[90px] sm:min-w-[100px] shadow-lg ${
                                                        c.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' :
                                                        c.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                                                    }`}
                                                >
                                                    <option className="bg-slate-900 text-white" value="Pending">Pending</option>
                                                    <option className="bg-slate-900 text-white" value="In Progress">In Progress</option>
                                                    <option className="bg-slate-900 text-white" value="Resolved">Resolved</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {complaints.length === 0 && (
                                    <div className="col-span-full h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-slate-500">No network complaints found in system.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'schemes' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                                <div className="lg:col-span-5 bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-sm h-fit">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plus className="p-1 rounded bg-indigo-500/20 text-indigo-400"/> Deploy Scheme</h2>
                                    <form onSubmit={createScheme} className="space-y-4">
                                        <input 
                                            placeholder="Scheme Title" required 
                                            className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base" 
                                            value={schemeForm.title} onChange={e => setSchemeForm({...schemeForm, title: e.target.value})} 
                                        />
                                        <textarea 
                                            placeholder="Network Description (AI converts to simple Hindi for citizens)" required rows="4" 
                                            className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none text-sm sm:text-base" 
                                            value={schemeForm.description} onChange={e => setSchemeForm({...schemeForm, description: e.target.value})}
                                        ></textarea>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input 
                                                placeholder="Eligibility" 
                                                className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base" 
                                                value={schemeForm.eligibility} onChange={e => setSchemeForm({...schemeForm, eligibility: e.target.value})} 
                                            />
                                            <input 
                                                placeholder="Direct Link" 
                                                className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base" 
                                                value={schemeForm.link} onChange={e => setSchemeForm({...schemeForm, link: e.target.value})} 
                                            />
                                        </div>
                                        <button type="submit" className="w-full py-3.5 sm:py-4 mt-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg text-sm sm:text-base">
                                            Push to Network
                                        </button>
                                    </form>
                                </div>

                                <div className="lg:col-span-7 space-y-4">
                                    <h3 className="text-xl font-bold mb-2">Active Deployments</h3>
                                    {schemes.map((s, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            key={s._id} className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-lg truncate mb-1">{s.title}</h4>
                                                <p className="text-sm text-slate-400 line-clamp-2">{s.simplifiedDescription || s.description}</p>
                                            </div>
                                            <span className="text-xs tracking-widest uppercase bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-bold self-start sm:self-auto shrink-0">
                                                Active
                                            </span>
                                        </motion.div>
                                    ))}
                                    {schemes.length === 0 && <p className="text-slate-500 p-8 text-center border border-dashed border-white/10 rounded-2xl">No schemes active.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'polls' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                                <div className="lg:col-span-5 bg-white/5 p-6 sm:p-8 rounded-3xl shadow-sm border border-white/10 backdrop-blur-sm h-fit">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="p-1 rounded bg-indigo-500/20 text-indigo-400"/> Initiate Poll</h2>
                                    <form onSubmit={createPoll} className="space-y-4">
                                        <input 
                                            placeholder="Question Parameter" required 
                                            className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base" 
                                            value={pollForm.question} onChange={e => setPollForm({...pollForm, question: e.target.value})} 
                                        />
                                        <div className="space-y-3">
                                            <input 
                                                placeholder="Variable A" required 
                                                className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base" 
                                                value={pollForm.option1} onChange={e => setPollForm({...pollForm, option1: e.target.value})} 
                                            />
                                            <input 
                                                placeholder="Variable B" required 
                                                className="w-full px-4 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base" 
                                                value={pollForm.option2} onChange={e => setPollForm({...pollForm, option2: e.target.value})} 
                                            />
                                        </div>
                                        <button type="submit" className="w-full py-3.5 sm:py-4 mt-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg text-sm sm:text-base">
                                            Broadcast Poll
                                        </button>
                                    </form>
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {polls.map((p, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                                            key={p._id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full"
                                        >
                                            <h4 className="font-bold text-lg mb-4">{p.question}</h4>
                                            <div className="space-y-2 flex-1">
                                                {p.options.map(o => (
                                                    <div key={o._id} className="flex justify-between items-center text-sm p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                                                        <span className="text-slate-300">{o.text}</span>
                                                        <span className="font-bold text-indigo-400">{o.votes} votes</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {polls.length === 0 && <div className="col-span-full text-slate-500 p-8 text-center border border-dashed border-white/10 rounded-2xl">No polls currently executing.</div>}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Admin;
