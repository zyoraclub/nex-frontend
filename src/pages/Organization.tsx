import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { organizationAPI } from '../services/organizationAPI';
import { GrEdit } from 'react-icons/gr';
import './Organization.css';

const CATEGORIES = ['Startup', 'Enterprise', 'Government', 'Non-Profit', 'Education'];
const DOMAINS = ['Finance', 'Technology', 'Government Agency', 'Agriculture', 'Healthcare', 'Manufacturing', 'Retail', 'Other'];

export default function Organization() {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isCompletionRequired = searchParams.get('complete') === 'true';
  
  const [orgData, setOrgData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(isCompletionRequired);
  const [formData, setFormData] = useState({
    mobile: '',
    category: '',
    domain: '',
    country: '',
    website: '',
    linkedin: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  useEffect(() => {
    // If profile completion is required but profile is already complete, redirect to dashboard
    if (isCompletionRequired && orgData) {
      const isProfileComplete = orgData.mobile && orgData.category && orgData.domain && orgData.country;
      if (isProfileComplete) {
        navigate(`/${orgSlug}/dashboard`, { replace: true });
      }
    }
  }, [orgData, isCompletionRequired, orgSlug, navigate]);

  useEffect(() => {
    if (isEditing && !formData.country) {
      detectCountry();
    }
  }, [isEditing]);

  const detectCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_name) {
        setFormData(prev => ({ ...prev, country: data.country_name }));
      }
    } catch (err) {
      console.error('Failed to detect country');
    }
  };

  const fetchOrganization = async () => {
    try {
      const response = await organizationAPI.getMyOrganization();
      setOrgData(response.data);
      setFormData({
        mobile: response.data.mobile || '',
        category: response.data.category || '',
        domain: response.data.domain || '',
        country: response.data.country || '',
        website: response.data.website || '',
        linkedin: response.data.linkedin || '',
      });
    } catch (err) {
      console.error('Failed to fetch organization');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCompletionRequired && (!formData.mobile || !formData.category || !formData.domain || !formData.country)) {
      alert('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      await organizationAPI.updateMyOrganization(formData);
      await fetchOrganization();
      setIsEditing(false);
      
      if (isCompletionRequired) {
        navigate(`/${orgSlug}/dashboard`);
      }
    } catch (err) {
      console.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  if (!orgData) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="org-profile">
        {isCompletionRequired && (
          <div className="completion-banner">
            <strong>Complete Your Profile</strong>
            <p>Please fill in the required information to continue</p>
          </div>
        )}
        <div className="org-header">
          <h1>Organization Profile</h1>
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <GrEdit size={14} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="org-view">
            <div className="org-section">
              <h3>Basic Information</h3>
              <div className="org-grid">
                <div className="org-field">
                  <label>Organization Name</label>
                  <div className="field-value">{orgData.organization_name}</div>
                </div>
                <div className="org-field">
                  <label>Slug</label>
                  <div className="field-value">/{orgData.organization_slug}</div>
                </div>
                <div className="org-field">
                  <label>Email</label>
                  <div className="field-value">{orgData.email}</div>
                </div>
                <div className="org-field">
                  <label>Mobile</label>
                  <div className="field-value">{orgData.mobile || 'Not set'}</div>
                </div>
              </div>
            </div>

            <div className="org-section">
              <h3>Details</h3>
              <div className="org-grid">
                <div className="org-field">
                  <label>Category</label>
                  <div className="field-value">{orgData.category || 'Not set'}</div>
                </div>
                <div className="org-field">
                  <label>Domain</label>
                  <div className="field-value">{orgData.domain || 'Not set'}</div>
                </div>
                <div className="org-field">
                  <label>Country</label>
                  <div className="field-value">{orgData.country || 'Not set'}</div>
                </div>
                <div className="org-field">
                  <label>Website</label>
                  <div className="field-value">{orgData.website || 'Not set'}</div>
                </div>
                <div className="org-field">
                  <label>LinkedIn</label>
                  <div className="field-value">{orgData.linkedin || 'Not set'}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="org-form">
            <div className="org-section">
              <h3>Basic Information</h3>
              <div className="org-grid">
                <div className="form-field">
                  <label>Organization Name</label>
                  <input type="text" value={orgData.organization_name} disabled />
                </div>
                <div className="form-field">
                  <label>Slug</label>
                  <input type="text" value={orgData.organization_slug} disabled />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" value={orgData.email} disabled />
                </div>
                <div className="form-field">
                  <label>Mobile</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>

            <div className="org-section">
              <h3>Details</h3>
              <div className="org-grid">
                <div className="form-field">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select domain</option>
                    {DOMAINS.map(dom => (
                      <option key={dom} value={dom}>{dom}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., India"
                  />
                </div>
                <div className="form-field">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-field">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              {!isCompletionRequired && (
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : isCompletionRequired ? 'Complete Profile' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
