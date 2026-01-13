import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Globe, Mail, MapPin, Phone, Save, Upload } from 'lucide-react';
import { useOrgStore } from '@/store/orgStore';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { OrganizationProfile } from '@/types';

const OrgProfile: React.FC = () => {
  const { profile, updateProfile, saveProfile, fetchProfile } = useOrgStore();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<OrganizationProfile>({
    defaultValues: profile,
  });

  // Load initial data
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update form when store changes (e.g. after fetch)
  useEffect(() => {
    Object.entries(profile).forEach(([key, value]) => {
      setValue(key as keyof OrganizationProfile, value);
    });
  }, [profile, setValue]);

  const onSubmit = async (data: OrganizationProfile) => {
    try {
      updateProfile(data);
      await saveProfile();
      success('Organization profile saved successfully');
    } catch (err) {
      error('Failed to save profile');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#0f172a] border border-border/40 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-border/40 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-3">
              <Building2 size={20} className="text-primary-soft shadow-sm" />
              Organization Identity
            </h3>
            <p className="text-[0.625rem] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
              Core company details and branding configuration
            </p>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            className="h-9 px-6 bg-blue-600 hover:bg-blue-500 text-white text-[0.65rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <Save size={14} strokeWidth={3} />
            )}
            Save Changes
          </Button>
        </div>

        <div className="p-8">
          <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Branding Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="h-56 w-full rounded-2xl bg-slate-800/50 border-2 border-dashed border-border flex flex-col items-center justify-center group cursor-pointer hover:border-primary/50 hover:bg-slate-800/80 transition-all relative overflow-hidden">
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-slate-400 group-hover:text-primary" />
                    </div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Upload Logo
                    </p>
                    <p className="text-[0.6rem] text-slate-500">
                      PNG, JPG or SVG
                      <br />
                      Max 2MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => {
                    // Handle file upload (mock for now, or implement real upload logic)
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setValue('logo', reader.result as string, { shouldDirty: true });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="bg-slate-800/30 rounded-xl p-5 border border-border/30">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-border/20 pb-2">
                  System Preferences
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      className="w-full bg-slate-900 border border-border rounded-lg p-2.5 text-sm font-bold text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                      <option value="PKR">PKR (Pakistani Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Tax Year End
                    </label>
                    <select
                      {...register('taxYearEnd')}
                      className="w-full bg-slate-900 border border-border rounded-lg p-2.5 text-sm font-bold text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    >
                      <option value="June">June</option>
                      <option value="December">December</option>
                      <option value="March">March</option>
                      <option value="September">September</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* General Info Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-[0.65rem] font-black text-blue-400 uppercase tracking-[0.1em] mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <input
                      {...register('name', { required: true })}
                      className="w-full bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 text-slate-100 font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">
                    Industry / Sector
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <input
                      {...register('industry')}
                      className="w-full bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 text-slate-100 font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      placeholder="e.g. Manufacturing, Technology"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <input
                      {...register('email')}
                      className="w-full bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 text-slate-100 font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <input
                      {...register('phone')}
                      className="w-full bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 text-slate-100 font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">
                    Headquarters Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <textarea
                      {...register('addressLine1')}
                      rows={3}
                      className="w-full bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 text-slate-100 font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                      placeholder="123 Corporate Blvd, Business District..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                    <input
                      {...register('country')}
                      className="w-full bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 text-slate-100 font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      placeholder="e.g. Pakistan"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.1em] mb-2">
                    Tax Registration (NTN/EIN)
                  </label>
                  <input
                    {...register('taxId')}
                    className="w-full bg-slate-800/50 border border-border rounded-xl py-3 px-4 text-slate-100 font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="e.g. 1234567-8"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrgProfile;
