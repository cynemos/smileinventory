import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User as UserIcon, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { RootState } from '../store';

function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileLogo, setProfileLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.email);
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profile) {
        setDisplayName(profile.full_name || user.email);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      if (user) {
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error checking profile existence:', profileError);
          alert('Failed to update profile.');
          return;
        }

        if (existingProfile) {
          // Update existing profile
          const { error } = await supabase
            .from('profiles')
            .update({ full_name: displayName })
            .eq('id', user.id);

          if (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
          } else {
            alert('Profile updated successfully!');
          }
        } else {
          // Create new profile
          const { error } = await supabase
            .from('profiles')
            .insert([{ id: user.id, full_name: displayName }]);

          if (error) {
            console.error('Error creating profile:', error);
            alert('Failed to create profile.');
          } else {
            alert('Profile created successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
    }
    setIsEditing(false);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleProfileLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image: ', error);
        alert('Failed to upload profile logo.');
      } else {
        const publicURL = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        setProfileLogo(publicURL);
        alert('Profile logo updated successfully!');
      }
    } catch (error) {
      console.error("Error uploading profile logo:", error);
      alert('An error occurred while uploading the profile logo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Profil</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4 flex items-center">
          {profileLogo ? (
            <img src={profileLogo} alt="Profile Logo" className="w-20 h-20 rounded-full mr-4" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <UserIcon className="text-gray-500" size={48} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo de profil
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileLogoUpload}
                className="hidden"
                id="profile-logo-upload"
              />
              <label htmlFor="profile-logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </label>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Nom d'affichage
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
              value={displayName}
              onChange={handleDisplayNameChange}
              disabled={!isEditing}
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {user?.email}
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleEditClick}
            >
              <Pencil className="mr-2 h-5 w-5" />
              Modifier
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleSaveClick}
            >
              Enregistrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
