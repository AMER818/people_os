import React, { useState } from 'react';
import { X, User, Briefcase, Mail, Phone, Sparkles } from 'lucide-react';
import { Candidate } from '../../types';

interface AddCandidateModalProps {
    onClose: () => void;
    onSave: (candidate: Partial<Candidate>) => void;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        email: '',
        phone: '',
        experience: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            firstName: formData.firstName,
            lastName: formData.lastName,
            positionApplied: formData.position,
            email: formData.email,
            phone: formData.phone,
            skills: ['Pending Evaluation'], // Default
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-lg rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted-bg/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-text-primary tracking-tight">New Candidate</h3>
                            <p className="text-[0.625rem] font-black text-text-muted uppercase tracking-widest mt-1">
                                Enter Details manually
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close modal" className="p-2 text-text-muted hover:text-danger transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">First Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-muted-bg border border-transparent focus:border-primary/20 rounded-xl pl-12 pr-4 py-3 font-bold text-text-primary outline-none transition-all"
                                        placeholder="Jane"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">Last Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-muted-bg border border-transparent focus:border-primary/20 rounded-xl pl-12 pr-4 py-3 font-bold text-text-primary outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">Position Applied *</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full bg-muted-bg border border-transparent focus:border-primary/20 rounded-xl pl-12 pr-4 py-3 font-bold text-text-primary outline-none transition-all"
                                    placeholder="e.g. Senior Backend Engineer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-muted-bg border border-transparent focus:border-primary/20 rounded-xl pl-12 pr-4 py-3 font-bold text-text-primary outline-none transition-all"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted px-2">Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-muted-bg border border-transparent focus:border-primary/20 rounded-xl pl-12 pr-4 py-3 font-bold text-text-primary outline-none transition-all"
                                        placeholder="+92 300 1234567"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl font-bold uppercase text-[0.625rem] tracking-widest border border-border text-text-muted hover:bg-muted-bg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold uppercase text-[0.625rem] tracking-widest shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={16} /> Create Candidate Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCandidateModal;
