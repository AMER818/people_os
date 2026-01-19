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
      <div className="card-vibrant overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-border bg-bg/50 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-vibrant uppercase tracking-wider flex items-center gap-3">
              <Building2 size={20} className="text-primary" />
              Company Profile
            </h3>
            <p className="text-[0.625rem] text-text-muted font-bold mt-1.5 uppercase tracking-widest">
              Basic company information and logo
            </p>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-[0.65rem] font-black uppercase tracking-[0.15em] gap-2 rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="h-56 w-full rounded-2xl card-vibrant border-2 border-dashed border-border flex flex-col items-center justify-center group cursor-pointer hover:border-primary/50 hover:bg-bg/80 transition-all relative overflow-hidden">
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-text-muted group-hover:text-primary" />
                    </div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Upload Logo
                    </p>
                    <p className="text-[0.6rem] text-text-muted">
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

              <div className="card-vibrant rounded-xl p-5 border border-border">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">
                  Regional Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[0.6rem] font-black text-text-muted uppercase tracking-widest mb-1.5">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-sm font-bold text-text-secondary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="PKR" className="bg-surface text-text-primary">
                        PKR (Pakistani Rupee)
                      </option>
                      <option value="USD" className="bg-surface text-text-primary">
                        USD (US Dollar)
                      </option>
                      <option value="EUR" className="bg-surface text-text-primary">
                        EUR (Euro)
                      </option>
                      <option value="GBP" className="bg-surface text-text-primary">
                        GBP (British Pound)
                      </option>
                      <option value="AED" className="bg-surface text-text-primary">
                        AED (UAE Dirham)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-black text-text-muted uppercase tracking-widest mb-1.5">
                      Tax Year End
                    </label>
                    <select
                      {...register('taxYearEnd')}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-sm font-bold text-text-secondary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="June" className="bg-surface text-text-primary">
                        June
                      </option>
                      <option value="December" className="bg-surface text-text-primary">
                        December
                      </option>
                      <option value="March" className="bg-surface text-text-primary">
                        March
                      </option>
                      <option value="September" className="bg-surface text-text-primary">
                        September
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* General Info Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-[0.65rem] font-black text-primary uppercase tracking-[0.1em] mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3.5 text-text-muted" size={18} />
                    <input
                      {...register('name', { required: true })}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-text-primary font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-[0.65rem] font-black text-text-muted uppercase tracking-[0.1em] mb-2">
                    Industry / Sector
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-text-muted" size={18} />
                    <input
                      {...register('industry')}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Manufacturing, Technology"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-black text-text-muted uppercase tracking-[0.1em] mb-2">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-text-muted" size={18} />
                    <input
                      {...register('email')}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-black text-text-muted uppercase tracking-[0.1em] mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-text-muted" size={18} />
                    <input
                      {...register('phone')}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-[0.65rem] font-black text-text-muted uppercase tracking-[0.1em] mb-2">
                    Headquarters Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-text-muted" size={18} />
                    <textarea
                      {...register('addressLine1')}
                      rows={3}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="123 Corporate Blvd, Business District..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] font-black text-text-muted uppercase tracking-[0.1em] mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-text-muted" size={18} />
                    <input
                      {...register('country')}
                      className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Pakistan"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-black text-text-muted uppercase tracking-[0.1em] mb-2">
                    Tax Registration (NTN/EIN)
                  </label>
                  <input
                    {...register('taxId')}
                    className="w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
